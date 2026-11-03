import { ref, computed } from "vue";
import { invoke, isTauri } from "@tauri-apps/api/core";
import { isMobileTauri } from "~/utils/isMobileTauri";

type OfflineLicense = {
  activationId: string;
  tokenId: string;
  deviceId: string;
  expiresAt: string;
  status: "active" | "expired" | "revoked";
};

type LocalUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
};

// ✅ WEB CHANGE
// Same small API on both platforms:
//   - Tauri app -> the native plugin-store file (exactly as before)
//   - Browser   -> localStorage (the Tauri plugin does not exist there)
type KeyValueStore = {
  get<T>(key: string): Promise<T | null | undefined>;
  set(key: string, value: unknown): Promise<void>;
  delete(key: string): Promise<void>;
  save(): Promise<void>;
};

const SESSION_FILE = "exam-tips-session.json";
const WEB_PREFIX = "exam-tips:";

async function openStore(): Promise<KeyValueStore> {
  if (isTauri()) {
    // loaded only inside the app, so it never runs in the browser
    const { Store } = await import("@tauri-apps/plugin-store");
    const tauriStore = await Store.load(SESSION_FILE);

    return {
      get: <T>(key: string) => tauriStore.get<T>(key),
      set: (key, value) => tauriStore.set(key, value),
      delete: async (key) => {
        await tauriStore.delete(key);
      },
      save: () => tauriStore.save(),
    };
  }

  return {
    async get<T>(key: string) {
      try {
        const raw = localStorage.getItem(WEB_PREFIX + key);
        return raw === null ? null : (JSON.parse(raw) as T);
      } catch {
        return null;
      }
    },
    async set(key, value) {
      localStorage.setItem(WEB_PREFIX + key, JSON.stringify(value));
    },
    async delete(key) {
      localStorage.removeItem(WEB_PREFIX + key);
    },
    async save() {
      // localStorage saves instantly, nothing to do
    },
  };
}

const user = ref<LocalUser | null>(null);
const license = ref<OfflineLicense | null>(null);
const initialized = ref(false);

let store: KeyValueStore | null = null;
let initializationPromise: Promise<void> | null = null;

export const useExamTipsAuth = () => {
  const isLoggedIn = computed(() => !!user.value);

  const isActivated = computed(() => {
    if (!license.value) return false;

    if (license.value.status !== "active") {
      return false;
    }

    return (
      new Date(license.value.expiresAt).getTime() >
      Date.now()
    );
  });

  const initialize = async () => {
    if (initialized.value) return;

    if (!initializationPromise) {
      initializationPromise = (async () => {
        const loadedStore = await openStore();

        user.value =
          (await loadedStore.get<LocalUser>("user")) ?? null;

        license.value =
          (await loadedStore.get<OfflineLicense>("license")) ?? null;

        store = loadedStore;
        initialized.value = true;
      })().catch((error) => {
        initializationPromise = null;
        throw error;
      });
    }

    await initializationPromise;
  };

  const saveUser = async (newUser: LocalUser) => {
    if (!store) await initialize();

    user.value = newUser;

    await store!.set("user", newUser);
    await store!.save();
  };

  const saveLicense = async (
    newLicense: OfflineLicense
  ) => {
    if (!store) await initialize();

    license.value = newLicense;

    await store!.set("license", newLicense);
    await store!.save();
  };

  const getDeviceId = async () => {
    // Desktop app: the native command knows the real device id
    if (isTauri() && !isMobileTauri()) {
      return await invoke<string>("get_device_id");
    }

    // Mobile app and browsers have no native device id,
    // so keep one random id in the store
    if (!store) await initialize();

    let deviceId = await store!.get<string>("device-id");
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      await store!.set("device-id", deviceId);
      await store!.save();
    }

    return deviceId;
  };

  const clearSession = async () => {
    if (!store) await initialize();

    user.value = null;
    license.value = null;

    await store!.delete("user");
    await store!.delete("license");
    await store!.save();
  };

  return {
    user,
    license,
    isLoggedIn,
    isActivated,
    initialized,
    initialize,
    saveUser,
    saveLicense,
    getDeviceId,
    clearSession,
  };
};