import { KeyringSession } from "tauri-plugin-keyring-store-api";
import { Store } from "@tauri-apps/plugin-store";
import { getPlatform, getAppVersion } from "~/utils/deviceInfo";

const KEYRING_SESSION_PATH = "/abanise/security";
const KEYRING_CLIENT = "abanise-security";

const PRIVATE_KEY_RECORD = "software_private_key";
const PUBLIC_KEY_RECORD = "software_public_key";
const SYSTEM_ID_KEY = "software_system_id";
const INSTALLATION_ID_KEY = "software_installation_id";
const LICENSE_INFO_KEY = "software_license_info";

let keyringSession: KeyringSession | null = null;
let keyringClient: Awaited<ReturnType<KeyringSession["createClient"]>> | null = null;

let systemIdCache: string | null = null;
let privateKeyCache: CryptoKey | null = null;
let isMobileCache: boolean | null = null;
let keysPromise: Promise<SoftwareKeys> | null = null;

type SoftwareKeys = {
  privateKey: CryptoKey;
  publicKey: CryptoKey;
  publicKeyPem: string;
};

/* =========================================================
   DEBUG HELPERS
========================================================= */

const DEBUG = true;
const TAG = "[ABANISE-SEC]";

function dbg(...args: any[]) {
  if (!DEBUG) return;
  console.log(TAG, ...args);
}

function dbgErr(label: string, err: any) {
  console.error(
    TAG,
    `FAIL ${label}:`,
    err?.name,
    err?.message || String(err),
    err?.stack || "",
  );
}

// Wraps any async step: logs start, success (with ms), or failure + rethrows.
// Also warns if a step is still pending after 8s (detects silent hangs).
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

// Rejects if a promise takes too long (so a hang becomes a visible error)
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

async function isMobile(): Promise<boolean> {
  if (isMobileCache !== null) return isMobileCache;
  const p = await getPlatform();
  isMobileCache = p === "android" || p === "ios";
  return isMobileCache;
}

// Call once at app start (e.g. in app.vue onMounted or a plugin)
export async function debugEnvironment() {
  dbg("---- ENV CHECK ----");
  dbg("userAgent:", navigator.userAgent);
  dbg("location:", location.href);
  dbg("isSecureContext:", (globalThis as any).isSecureContext);
  dbg("crypto exists:", typeof crypto !== "undefined");
  dbg("crypto.subtle exists:", !!(typeof crypto !== "undefined" && crypto.subtle));
  dbg("crypto.randomUUID exists:", typeof crypto?.randomUUID === "function");
  dbg("TextEncoder exists:", typeof TextEncoder !== "undefined");

  try {
    await getPlatform().then((p) => dbg("platform:", p));
    await getAppVersion().then((v) => dbg("appVersion:", v));
  } catch (e) {
    dbgErr("deviceInfo", e);
  }

  // Ed25519 support test
  try {
    await crypto.subtle.generateKey({ name: "Ed25519" }, true, ["sign", "verify"]);
    dbg("Ed25519 SUPPORTED");
  } catch (e) {
    dbgErr("Ed25519 support test (THIS WEBVIEW MAY NOT SUPPORT Ed25519)", e);
  }

  // Store test
  try {
    const s = await getAppStore();
    dbg("Store loaded OK", !!s);
  } catch (e) {
    dbgErr("Store test", e);
  }

  // Keyring test (desktop only, with timeout so it can't hang the check)
  try {
    if (await isMobile()) {
      dbg("Keyring test skipped on mobile");
    } else {
      await withTimeout(initKeyringSession(), 10000, "initKeyringSession");
      dbg("Keyring OK");
    }
  } catch (e) {
    dbgErr("Keyring test", e);
  }
  dbg("---- ENV CHECK DONE ----");
}

/* =========================================================
   STORE
========================================================= */

async function getAppStore() {
  return await step("Store.load", () =>
    Store.load("abanise-security.json", {
      autoSave: true,
      defaults: {},
    }),
  );
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
    dbg("keyring: using cached session");
    return { session: keyringSession, client: keyringClient };
  }

  const session = await step("KeyringSession.load", () =>
    withTimeout(
      KeyringSession.load(KEYRING_SESSION_PATH, ""),
      10000,
      "KeyringSession.load",
    ),
  );

  let client: Awaited<ReturnType<KeyringSession["createClient"]>>;

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
   KEY STORAGE
   Mobile  -> Store plugin (the keyring plugin hangs on Android)
   Desktop -> OS keyring
========================================================= */

async function getKeyStorage() {
  if (await isMobile()) {
    dbg("key storage: Store plugin (mobile)");
    const store = await getAppStore();
    return {
      async get(key: string): Promise<string | null> {
        return (await store.get<string>(key)) ?? null;
      },
      async put(key: string, text: string) {
        await store.set(key, text);
        await store.save();
      },
    };
  }

  dbg("key storage: OS keyring (desktop)");
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
  if (systemIdCache) {
    dbg("getSystemId: cached");
    return systemIdCache;
  }

  return await step("getSystemId", async () => {
    const store = await getAppStore();

    let systemId = await step("store.get systemId", () => store.get<string>(SYSTEM_ID_KEY));

    if (!systemId) {
      dbg("getSystemId: generating new id");
      systemId = generateSystemId();
      await step("store.set systemId", () => store.set(SYSTEM_ID_KEY, systemId!));
      await step("store.save systemId", () => store.save());
    }

    systemIdCache = systemId;
    return systemId;
  });
}

/* =========================================================
   GENERATE ED25519 KEYS
========================================================= */

async function generateKeyPair() {
  if (!crypto?.subtle) {
    throw new Error(
      "Web Crypto API is not available (isSecureContext=" +
        (globalThis as any).isSecureContext +
        ")",
    );
  }

  return await step("crypto.subtle.generateKey Ed25519", () =>
    crypto.subtle.generateKey({ name: "Ed25519" }, true, ["sign", "verify"]),
  );
}

/* =========================================================
   GET OR CREATE KEY PAIR
========================================================= */

async function loadOrCreateSoftwareKeys(): Promise<SoftwareKeys> {
  const storage = await getKeyStorage();

  const privateText = await step("storage get private", () =>
    storage.get(PRIVATE_KEY_RECORD),
  );
  const publicText = await step("storage get public", () =>
    storage.get(PUBLIC_KEY_RECORD),
  );

  if (privateText && publicText) {
    dbg("getSoftwareKeys: existing keys found");

    const privateKey = await step("importKey private", () =>
      crypto.subtle.importKey(
        "jwk",
        JSON.parse(privateText),
        { name: "Ed25519" },
        false,
        ["sign"],
      ),
    );

    const publicKey = await step("importKey public", () =>
      crypto.subtle.importKey(
        "jwk",
        JSON.parse(publicText),
        { name: "Ed25519" },
        true,
        ["verify"],
      ),
    );

    const spki = await step("exportKey spki", () =>
      crypto.subtle.exportKey("spki", publicKey),
    );

    privateKeyCache = privateKey;

    return { privateKey, publicKey, publicKeyPem: arrayBufferToPem(spki) };
  }

  /* First installation */
  dbg("getSoftwareKeys: first install, generating keys");

  const keyPair = await generateKeyPair();

  const privateJwk = await step("exportKey private jwk", () =>
    crypto.subtle.exportKey("jwk", keyPair.privateKey),
  );
  const publicJwk = await step("exportKey public jwk", () =>
    crypto.subtle.exportKey("jwk", keyPair.publicKey),
  );
  const spki = await step("exportKey public spki", () =>
    crypto.subtle.exportKey("spki", keyPair.publicKey),
  );

  await step("storage put private", () =>
    storage.put(PRIVATE_KEY_RECORD, JSON.stringify(privateJwk)),
  );
  await step("storage put public", () =>
    storage.put(PUBLIC_KEY_RECORD, JSON.stringify(publicJwk)),
  );

  privateKeyCache = keyPair.privateKey;

  return {
    privateKey: keyPair.privateKey,
    publicKey: keyPair.publicKey,
    publicKeyPem: arrayBufferToPem(spki),
  };
}

// Shares one in-flight load so two parallel callers never generate two key pairs
export async function getSoftwareKeys(): Promise<SoftwareKeys> {
  if (!keysPromise) {
    keysPromise = step("getSoftwareKeys", loadOrCreateSoftwareKeys).catch((err) => {
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
  await step("saveInstallationId", async () => {
    const store = await getAppStore();
    await store.set(INSTALLATION_ID_KEY, installationId);
    await store.save();
  });
}

export async function getInstallationId() {
  return await step("getInstallationId", async () => {
    const store = await getAppStore();
    return await store.get<string>(INSTALLATION_ID_KEY);
  });
}

export async function saveLicenseInfo(license: unknown) {
  await step("saveLicenseInfo", async () => {
    const store = await getAppStore();
    await store.set(LICENSE_INFO_KEY, license);
    await store.save();
  });
}

export async function getLicenseInfo() {
  return await step("getLicenseInfo", async () => {
    const store = await getAppStore();
    return await store.get(LICENSE_INFO_KEY);
  });
}

/* =========================================================
   ACTIVATE SOFTWARE
========================================================= */

export async function activateSoftware(token: string) {
  return await step("activateSoftware", async () => {
    const systemId = await getSystemId();
    const { publicKeyPem } = await getSoftwareKeys();

    const platform = await step("getPlatform", () => getPlatform());
    const appVersion = await step("getAppVersion", () => getAppVersion());

    dbg("activate payload", { systemId, platform, appVersion, tokenLen: token.length });

    const res = await step("POST /api/software/activate", () =>
      useApiFetch<any>("/api/software/activate", {
        method: "POST",
        body: {
          token: token.trim().toUpperCase(),
          systemId,
          publicKey: publicKeyPem,
          platform,
          appVersion,
        },
      }),
    );

    dbg("activate transport result:", JSON.stringify(res)?.slice(0, 500));

    // useApiFetch never throws, so check the transport result first
    if (!res.success) {
      throw new Error(res.message || "Software activation failed.");
    }

    const response = res.data;

    // then check the server's own { success } flag
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
    if (!privateKeyCache) {
      dbg("signRequest: privateKeyCache empty, loading keys");
      await getSoftwareKeys();
    }

    if (!privateKeyCache) {
      throw new Error("Software private key is unavailable.");
    }

    const message = [
      String(timestamp),
      String(nonce),
      String(method).toUpperCase(),
      String(path),
      String(bodyHash),
    ].join("\n");

    const signature = await step("crypto.subtle.sign", () =>
      crypto.subtle.sign(
        { name: "Ed25519" },
        privateKeyCache!,
        new TextEncoder().encode(message),
      ),
    );

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
    dbg("softwareFetch apiUrl:", apiUrl);

    const cleanPath = path.startsWith("/") ? path : `/${path}`;

    // The backend signs only the pathname, not the query string
    let requestPath: string;
    try {
      requestPath = new URL(`${apiUrl}${cleanPath}`).pathname;
    } catch (e) {
      dbgErr(`new URL("${apiUrl}${cleanPath}") - apiUrl may be empty/invalid on mobile`, e);
      throw e;
    }

    // Drop empty query values
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