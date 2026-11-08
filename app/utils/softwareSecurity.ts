import { getPlatform, getAppVersion } from "~/utils/deviceInfo";

// NOTE: the Tauri plugins are imported lazily (inside functions) so that
// the browser/PWA build never touches them.

const KEYRING_SESSION_PATH = "/abanise/security";
const KEYRING_CLIENT = "abanise-security";

const PRIVATE_KEY_RECORD = "software_private_key";
const PUBLIC_KEY_RECORD = "software_public_key";
const SYSTEM_ID_KEY = "software_system_id";
const INSTALLATION_ID_KEY = "software_installation_id";
const LICENSE_INFO_KEY = "software_license_info";
const WEB_SIGNER_KEY = "software_web_signer";

let keyringSession: any = null;
let keyringClient: any = null;

let systemIdCache: string | null = null;
let isMobileCache: boolean | null = null;
let keysPromise: Promise<SoftwareKeys> | null = null;

type SoftwareKeys = {
  publicKeyPem: string;
  sign: (data: Uint8Array) => Promise<ArrayBuffer>;
  // kept for backwards compatibility (only set on Tauri)
  privateKey?: CryptoKey;
  publicKey?: CryptoKey;
};

/* =========================================================
   ENVIRONMENT
========================================================= */

export const isTauri = () =>
  typeof window !== "undefined" &&
  ("__TAURI_INTERNALS__" in window || "__TAURI__" in window);

async function currentPlatform(): Promise<string> {
  if (!isTauri()) return "web";
  return await getPlatform();
}

async function currentAppVersion(): Promise<string> {
  if (!isTauri()) {
    const config = useRuntimeConfig();
    return String((config.public as any).appVersion || "web");
  }
  return await getAppVersion();
}

async function isMobile(): Promise<boolean> {
  if (isMobileCache !== null) return isMobileCache;
  const p = await currentPlatform();
  isMobileCache = p === "android" || p === "ios";
  return isMobileCache;
}

/* =========================================================
   DEBUG HELPERS
========================================================= */

const DEBUG = false;
const TAG = "[ABANISE-SEC]";

function dbg(...args: any[]) {
  if (!DEBUG) return;
  console.log(TAG, ...args);
}

function dbgErr(label: string, err: any) {
  if (!DEBUG) return;
  console.error(
    TAG,
    `FAIL ${label}:`,
    err?.name,
    err?.message || String(err),
    err?.stack || "",
  );
}

async function step<T>(label: string, fn: () => Promise<T> | T): Promise<T> {
  const t0 = Date.now();
  dbg(`START ${label}`);

  const hangTimer = setTimeout(() => {
    console.warn(TAG, `STILL WAITING after 8s: ${label} (possible hang)`);
  }, 8000);

  try {
    const result = await fn();
    dbg(`OK    ${label} (${Date.now() - t0}ms)`);
    return result;
  } catch (err) {
    dbgErr(label, err);
    throw err;
  } finally {
    clearTimeout(hangTimer);
  }
}

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(
      () => reject(new Error(`Timeout after ${ms}ms: ${label}`)),
      ms,
    );
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}

export async function debugEnvironment() {
  dbg("---- ENV CHECK ----");
  dbg("userAgent:", navigator.userAgent);
  dbg("location:", location.href);
  dbg("isTauri:", isTauri());
  dbg("isSecureContext:", (globalThis as any).isSecureContext);
  dbg("crypto.subtle exists:", !!(typeof crypto !== "undefined" && crypto.subtle));
  dbg("indexedDB exists:", typeof indexedDB !== "undefined");

  try {
    dbg("platform:", await currentPlatform());
    dbg("appVersion:", await currentAppVersion());
  } catch (e) {
    dbgErr("deviceInfo", e);
  }

  dbg("native Ed25519:", await supportsNativeEd25519());

  try {
    await kvGet("__probe__");
    dbg("KV storage OK");
  } catch (e) {
    dbgErr("KV storage test", e);
  }
  dbg("---- ENV CHECK DONE ----");
}

/* =========================================================
   WEB: PERSISTENT STORAGE
   Asks the browser not to evict our data (license, keys, SQLite files).
========================================================= */

export async function requestPersistentStorage(): Promise<boolean> {
  try {
    if (isTauri() || !navigator.storage?.persist) return false;
    if (await navigator.storage.persisted()) return true;
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}

/* =========================================================
   KEY/VALUE STORAGE
   Tauri -> @tauri-apps/plugin-store
   Web   -> IndexedDB
========================================================= */

let idbPromise: Promise<IDBDatabase> | null = null;

function openIdb(): Promise<IDBDatabase> {
  if (!idbPromise) {
    idbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open("abanise-security", 1);
      req.onupgradeneeded = () => req.result.createObjectStore("kv");
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => {
        idbPromise = null;
        reject(req.error);
      };
    });
  }
  return idbPromise;
}

async function idbGet<T>(key: string): Promise<T | null> {
  const db = await openIdb();
  return new Promise((resolve, reject) => {
    const req = db.transaction("kv", "readonly").objectStore("kv").get(key);
    req.onsuccess = () => resolve((req.result as T) ?? null);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(key: string, value: unknown): Promise<void> {
  const db = await openIdb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("kv", "readwrite");
    tx.objectStore("kv").put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

async function getAppStore() {
  const { Store } = await import("@tauri-apps/plugin-store");
  return await step("Store.load", () =>
    Store.load("abanise-security.json", {
      autoSave: true,
      defaults: {},
    }),
  );
}

async function kvGet<T>(key: string): Promise<T | null> {
  if (!isTauri()) return idbGet<T>(key);
  const store = await getAppStore();
  return ((await store.get<T>(key)) ?? null) as T | null;
}

async function kvSet(key: string, value: unknown): Promise<void> {
  if (!isTauri()) return idbSet(key, value);
  const store = await getAppStore();
  await store.set(key, value);
  await store.save();
}

/* =========================================================
   RANDOM VALUES
========================================================= */

function randomHex(bytes = 32): string {
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function generateSystemId(): string {
  return `AB-${crypto.randomUUID()}-${randomHex(8)}`;
}

/* =========================================================
   BASE64 / PEM
========================================================= */

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(
      ...bytes.subarray(i, Math.min(i + chunkSize, bytes.length)),
    );
  }
  return btoa(binary);
}

function arrayBufferToPem(buffer: ArrayBuffer): string {
  const base64 = arrayBufferToBase64(buffer);
  const lines = base64.match(/.{1,64}/g)?.join("\n") || "";
  return ["-----BEGIN PUBLIC KEY-----", lines, "-----END PUBLIC KEY-----"].join("\n");
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;
}

// Wraps a raw 32-byte Ed25519 public key into SPKI (same format as WebCrypto)
function rawEd25519ToSpki(raw: Uint8Array): ArrayBuffer {
  const prefix = new Uint8Array([
    0x30, 0x2a, 0x30, 0x05, 0x06, 0x03, 0x2b, 0x65, 0x70, 0x03, 0x21, 0x00,
  ]);
  const out = new Uint8Array(prefix.length + raw.length);
  out.set(prefix, 0);
  out.set(raw, prefix.length);
  return toArrayBuffer(out);
}

/* =========================================================
   KEYRING (DESKTOP ONLY)
========================================================= */

function toUint8Array(value: unknown): Uint8Array {
  if (value === null || value === undefined) return new Uint8Array();
  if (value instanceof Uint8Array) return value;
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  if (Array.isArray(value)) return new Uint8Array(value.map((e) => Number(e)));
  if (typeof value === "string") return new TextEncoder().encode(value);

  if (typeof value === "object") {
    const c = value as { bytes?: unknown; data?: unknown; value?: unknown };
    if (c.bytes !== undefined) return toUint8Array(c.bytes);
    if (c.data !== undefined) return toUint8Array(c.data);
    if (c.value !== undefined) return toUint8Array(c.value);
  }
  return new TextEncoder().encode(JSON.stringify(value));
}

function decodeStoredBytes(value: unknown): string {
  return new TextDecoder().decode(toUint8Array(value));
}

async function initKeyringSession() {
  if (keyringSession && keyringClient) {
    return { session: keyringSession, client: keyringClient };
  }

  const { KeyringSession } = await import("tauri-plugin-keyring-store-api");

  const session: any = await step("KeyringSession.load", () =>
    withTimeout(
      KeyringSession.load(KEYRING_SESSION_PATH, ""),
      10000,
      "KeyringSession.load",
    ),
  );

  let client: any;

  try {
    client = await step("session.loadClient", () =>
      withTimeout(session.loadClient(KEYRING_CLIENT), 10000, "session.loadClient"),
    );
  } catch (e) {
    dbg("loadClient failed, trying createClient");
    client = await step("session.createClient", () =>
      withTimeout(session.createClient(KEYRING_CLIENT), 10000, "session.createClient"),
    );
  }

  keyringSession = session;
  keyringClient = client;

  return { session, client };
}

/* =========================================================
   KEY STORAGE (TAURI ONLY)
   Mobile  -> Store plugin (the keyring plugin hangs on Android)
   Desktop -> OS keyring
========================================================= */

async function getTauriKeyStorage() {
  if (await isMobile()) {
    return {
      get: (key: string) => kvGet<string>(key),
      put: (key: string, text: string) => kvSet(key, text),
    };
  }

  const { client } = await initKeyringSession();
  const store = client.getStore();
  return {
    async get(key: string): Promise<string | null> {
      const v = await withTimeout(store.get(key), 10000, `keyring get ${key}`);
      return v ? decodeStoredBytes(v) : null;
    },
    async put(key: string, text: string) {
      await withTimeout(
        store.insert(key, new TextEncoder().encode(text)),
        10000,
        `keyring insert ${key}`,
      );
    },
  };
}

/* =========================================================
   SYSTEM ID
========================================================= */

export async function getSystemId(): Promise<string> {
  if (systemIdCache) return systemIdCache;

  return await step("getSystemId", async () => {
    let systemId = await kvGet<string>(SYSTEM_ID_KEY);

    if (!systemId) {
      systemId = generateSystemId();
      await kvSet(SYSTEM_ID_KEY, systemId);
    }

    systemIdCache = systemId;
    return systemId;
  });
}

type DeviceIdentity = {
  hardwareId: string | null;
  deviceFingerprint: string | null;
  deviceLabel: string;
};

async function getBrowserDeviceFingerprint(): Promise<string> {
  const identity = {
    platform: navigator.platform || "unknown",
    hardwareConcurrency: navigator.hardwareConcurrency || null,
    deviceMemory:
      "deviceMemory" in navigator
        ? (navigator as Navigator & { deviceMemory?: number }).deviceMemory || null
        : null,
    maxTouchPoints: navigator.maxTouchPoints || 0,
  };
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(JSON.stringify(identity)),
  );
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function getDeviceLabel(platform: string): string {
  if (platform === "web") {
    return navigator.platform
      ? `Web (${navigator.platform})`
      : "Web browser";
  }
  return `${platform.charAt(0).toUpperCase()}${platform.slice(1)} device`;
}

async function getDeviceIdentity(): Promise<DeviceIdentity> {
  const platform = await currentPlatform();

  if (isTauri() && platform !== "ios") {
    const { invoke } = await import("@tauri-apps/api/core");
    const hardwareId = await invoke<string>("get_device_id");
    if (!hardwareId.trim()) {
      throw new Error("Unable to read this device's hardware identifier.");
    }

    return {
      hardwareId,
      deviceFingerprint: null,
      deviceLabel: getDeviceLabel(platform),
    };
  }

  return {
    hardwareId: null,
    deviceFingerprint: await getBrowserDeviceFingerprint(),
    deviceLabel: getDeviceLabel(platform),
  };
}

/* =========================================================
   ED25519 KEYS
========================================================= */

async function supportsNativeEd25519(): Promise<boolean> {
  try {
    if (!crypto?.subtle) return false;
    await crypto.subtle.generateKey({ name: "Ed25519" }, false, ["sign", "verify"]);
    return true;
  } catch {
    return false;
  }
}

/* ---- Tauri: keys stored as JWK text in keyring / store ---- */

async function loadOrCreateTauriKeys(): Promise<SoftwareKeys> {
  const storage = await getTauriKeyStorage();

  const privateText = await storage.get(PRIVATE_KEY_RECORD);
  const publicText = await storage.get(PUBLIC_KEY_RECORD);

  if (privateText && publicText) {
    const privateKey = await crypto.subtle.importKey(
      "jwk",
      JSON.parse(privateText),
      { name: "Ed25519" },
      false,
      ["sign"],
    );
    const publicKey = await crypto.subtle.importKey(
      "jwk",
      JSON.parse(publicText),
      { name: "Ed25519" },
      true,
      ["verify"],
    );
    const spki = await crypto.subtle.exportKey("spki", publicKey);

    return {
      privateKey,
      publicKey,
      publicKeyPem: arrayBufferToPem(spki),
      sign: (data) => crypto.subtle.sign({ name: "Ed25519" }, privateKey, data),
    };
  }

  const keyPair = (await crypto.subtle.generateKey({ name: "Ed25519" }, true, [
    "sign",
    "verify",
  ])) as CryptoKeyPair;

  const privateJwk = await crypto.subtle.exportKey("jwk", keyPair.privateKey);
  const publicJwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
  const spki = await crypto.subtle.exportKey("spki", keyPair.publicKey);

  await storage.put(PRIVATE_KEY_RECORD, JSON.stringify(privateJwk));
  await storage.put(PUBLIC_KEY_RECORD, JSON.stringify(publicJwk));

  return {
    privateKey: keyPair.privateKey,
    publicKey: keyPair.publicKey,
    publicKeyPem: arrayBufferToPem(spki),
    sign: (data) =>
      crypto.subtle.sign({ name: "Ed25519" }, keyPair.privateKey, data),
  };
}

/* ---- Web: CryptoKey (non-extractable) stored directly in IndexedDB ---- */

type StoredWebSigner =
  | { kind: "webcrypto"; privateKey: CryptoKey; publicKeyPem: string }
  | { kind: "noble"; seed: Uint8Array; publicKeyPem: string };

async function nobleSigner(seed: Uint8Array, publicKeyPem: string): Promise<SoftwareKeys> {
  const ed = await import("@noble/ed25519");
  return {
    publicKeyPem,
    sign: async (data) => toArrayBuffer(await ed.signAsync(data, seed)),
  };
}

async function loadOrCreateWebKeys(): Promise<SoftwareKeys> {
  if (!crypto?.subtle) {
    throw new Error(
      "Web Crypto is unavailable. The app must be served over HTTPS (or localhost).",
    );
  }

  const stored = await idbGet<StoredWebSigner>(WEB_SIGNER_KEY);

  if (stored?.kind === "webcrypto") {
    const { privateKey, publicKeyPem } = stored;
    return {
      privateKey,
      publicKeyPem,
      sign: (data) => crypto.subtle.sign({ name: "Ed25519" }, privateKey, data),
    };
  }

  if (stored?.kind === "noble") {
    return nobleSigner(stored.seed, stored.publicKeyPem);
  }

  // First run on this browser
  if (await supportsNativeEd25519()) {
    // extractable=false: the private key can be used but never read out
    const keyPair = (await crypto.subtle.generateKey({ name: "Ed25519" }, false, [
      "sign",
      "verify",
    ])) as CryptoKeyPair;

    const spki = await crypto.subtle.exportKey("spki", keyPair.publicKey);
    const publicKeyPem = arrayBufferToPem(spki);

    await idbSet(WEB_SIGNER_KEY, {
      kind: "webcrypto",
      privateKey: keyPair.privateKey,
      publicKeyPem,
    } satisfies StoredWebSigner);

    return {
      privateKey: keyPair.privateKey,
      publicKey: keyPair.publicKey,
      publicKeyPem,
      sign: (data) =>
        crypto.subtle.sign({ name: "Ed25519" }, keyPair.privateKey, data),
    };
  }

  // Older browsers without native Ed25519: pure-JS fallback
  dbg("native Ed25519 not supported, using @noble/ed25519");
  const ed = await import("@noble/ed25519");
  const seed = crypto.getRandomValues(new Uint8Array(32));
  const rawPublic = await ed.getPublicKeyAsync(seed);
  const publicKeyPem = arrayBufferToPem(rawEd25519ToSpki(rawPublic));

  await idbSet(WEB_SIGNER_KEY, {
    kind: "noble",
    seed,
    publicKeyPem,
  } satisfies StoredWebSigner);

  return nobleSigner(seed, publicKeyPem);
}

/* ---- Entry point (one in-flight load, never two key pairs) ---- */

export async function getSoftwareKeys(): Promise<SoftwareKeys> {
  if (!keysPromise) {
    keysPromise = step("getSoftwareKeys", () =>
      isTauri() ? loadOrCreateTauriKeys() : loadOrCreateWebKeys(),
    ).catch((err) => {
      keysPromise = null; // allow retry after a failure
      throw err;
    });
  }
  return keysPromise;
}

/* =========================================================
   INSTALLATION ID / LICENSE
========================================================= */

export async function saveInstallationId(installationId: string) {
  await step("saveInstallationId", () => kvSet(INSTALLATION_ID_KEY, installationId));
}

export async function getInstallationId() {
  return await step("getInstallationId", () => kvGet<string>(INSTALLATION_ID_KEY));
}

export async function saveLicenseInfo(license: unknown) {
  await step("saveLicenseInfo", () => kvSet(LICENSE_INFO_KEY, license));
}

export async function getLicenseInfo() {
  return await step("getLicenseInfo", () => kvGet(LICENSE_INFO_KEY));
}

/* =========================================================
   ACTIVATE SOFTWARE
========================================================= */

export async function activateSoftware(token: string) {
  return await step("activateSoftware", async () => {
    // Web only: ask the browser to keep our data (no-op on Tauri)
    await requestPersistentStorage();

    const systemId = await getSystemId();
    const { publicKeyPem } = await getSoftwareKeys();
    const deviceIdentity = await getDeviceIdentity();

    const platform = await currentPlatform();
    const appVersion = await currentAppVersion();

    const res = await step("POST /api/software/activate", () =>
      useApiFetch<any>("/api/software/activate", {
        method: "POST",
        body: {
          token: token.trim().toUpperCase(),
          systemId,
          publicKey: publicKeyPem,
          platform,
          appVersion,
          ...deviceIdentity,
        },
      }),
    );

    // useApiFetch never throws, so check the transport result first
    if (!res.success) {
      throw new Error(res.message || "Software activation failed.");
    }

    const response = res.data;

    if (!response?.success) {
      throw new Error(response?.message || "Software activation failed.");
    }

    const installationId = response.data?.installationId;
    if (installationId) {
      await saveInstallationId(String(installationId));
    }

    if (response.data?.license) {
      await saveLicenseInfo(response.data.license);
    }

    return response.data;
  });
}

export async function bindSoftwareDevice() {
  const deviceIdentity = await getDeviceIdentity();
  const response = await softwareFetch<any>("/api/software/bind-device", {
    method: "POST",
    body: deviceIdentity,
  });

  if (!response?.success || !response.data?.license) {
    throw new Error(
      response?.message || "Unable to bind this installation to its device.",
    );
  }

  await saveLicenseInfo(response.data.license);
  return response.data.license;
}

/* =========================================================
   SIGN REQUEST
========================================================= */

export async function signRequest({
  timestamp,
  nonce,
  method,
  path,
  bodyHash,
}: {
  timestamp: string;
  nonce: string;
  method: string;
  path: string;
  bodyHash: string;
}) {
  return await step("signRequest", async () => {
    const keys = await getSoftwareKeys();

    const message = [
      String(timestamp),
      String(nonce),
      String(method).toUpperCase(),
      String(path),
      String(bodyHash),
    ].join("\n");

    const signature = await keys.sign(new TextEncoder().encode(message));

    return arrayBufferToBase64(signature);
  });
}

/* =========================================================
   HASH REQUEST BODY
========================================================= */

export async function hashRequestBody(body: unknown) {
  return await step("hashRequestBody", async () => {
    const raw = body === undefined || body === null ? "" : JSON.stringify(body);

    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));

    return Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  });
}

/* =========================================================
   RANDOM NONCE
========================================================= */

export function generateNonce() {
  return `${crypto.randomUUID()}-${randomHex(16)}`;
}

/* =========================================================
   SIGNED API REQUEST
========================================================= */

export async function softwareFetch<T = any>(
  path: string,
  options: {
    method?: string;
    body?: any;
    query?: Record<string, string | number | boolean | undefined | null>;
    headers?: Record<string, string>;
  } = {},
): Promise<T> {
  return await step(`softwareFetch ${path}`, async () => {
    const method = (options.method || "GET").toUpperCase();

    const systemId = await getSystemId();

    const config = useRuntimeConfig();
    const apiUrl = String(config.public.apiUrl || "").replace(/\/$/, "");

    const cleanPath = path.startsWith("/") ? path : `/${path}`;

    // The backend signs only the pathname, not the query string.
    // The base lets this work when apiUrl is relative (e.g. "/api-proxy").
    let requestPath: string;
    try {
      const base =
        typeof location !== "undefined" ? location.origin : "http://localhost";
      requestPath = new URL(`${apiUrl}${cleanPath}`, base).pathname;
    } catch (e) {
      dbgErr(`new URL("${apiUrl}${cleanPath}")`, e);
      throw e;
    }

    const query: Record<string, string> = {};
    for (const [key, value] of Object.entries(options.query || {})) {
      if (value !== undefined && value !== null) {
        query[key] = String(value);
      }
    }

    const body = options.body;
    const bodyHash = await hashRequestBody(body);
    const timestamp = String(Date.now());
    const nonce = generateNonce();

    const signature = await signRequest({
      timestamp,
      nonce,
      method,
      path: requestPath,
      bodyHash,
    });

    const res = await step(`useApiFetch ${method} ${cleanPath}`, () =>
      useApiFetch<T>(cleanPath, {
        method: method as any,
        query,
        body,
        headers: {
          ...(options.headers || {}),
          "X-Device-ID": systemId,
          "X-Timestamp": timestamp,
          "X-Nonce": nonce,
          "X-Signature": signature,
          "Content-Type": "application/json",
        },
      }),
    );

    if (!res.success) {
      dbg("softwareFetch failed response:", JSON.stringify(res)?.slice(0, 500));
      throw res.error || new Error(res.message || "Request failed.");
    }

    return res.data as T;
  });
}