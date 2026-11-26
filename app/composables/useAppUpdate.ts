type Phase = "idle" | "downloading" | "ready" | "failed";

interface LatestRelease {
  versionCode: number;
  versionName: string;
  apkUrl: string;
  notes?: string;
  force?: boolean;
}

interface UpdateState {
  phase: Phase;
  progress: number;
  latest: LatestRelease | null;
}

let started = false;
let pollTimer: ReturnType<typeof setInterval> | null = null;

export const useAppUpdate = () => {
  const config = useRuntimeConfig();
  const state = useState<UpdateState>("app-update", () => ({
    phase: "idle",
    progress: 0,
    latest: null,
  }));

  // Only exists inside the Android app (see MainActivity.kt)
  const native = () => (window as any).AppUpdater as
    | {
        currentVersionCode(): number;
        start(url: string, versionCode: number): boolean;
        status(): string;
        install(): boolean;
        cleanup(keep: number): void;
      }
    | undefined;

  const fetchLatest = async (): Promise<LatestRelease | null> => {
    const url = `${config.public.apiUrl}/app/latest?platform=android`;
    try {
      const { fetch: tauriFetch } = await import("@tauri-apps/plugin-http");
      const res = await tauriFetch(url, { method: "GET" });
      if (!res.ok) return null;
      return (await res.json()) as LatestRelease;
    } catch {
      return null;
    }
  };

  const poll = () => {
    const n = native();
    if (!n) return;
    try {
      const s = JSON.parse(n.status());
      state.value.progress = s.progress ?? 0;
      if (s.state === "ready") {
        state.value.phase = "ready";
        stopPolling();
      } else if (s.state === "failed") {
        state.value.phase = "failed";
        stopPolling();
      } else if (s.state === "downloading") {
        state.value.phase = "downloading";
      }
    } catch {
      /* ignore */
    }
  };

  const startPolling = () => {
    if (pollTimer) return;
    pollTimer = setInterval(poll, 1000);
  };

  const stopPolling = () => {
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = null;
  };

  const startDownload = () => {
    const n = native();
    const latest = state.value.latest;
    if (!n || !latest) return;
    if (n.start(latest.apkUrl, latest.versionCode)) {
      state.value.phase = "downloading";
      startPolling();
      poll();
    } else {
      state.value.phase = "failed";
    }
  };

  /** Checks the backend; if newer, starts the background download. */
  const check = async () => {
    const n = native();
    if (!n) return; // not running inside the Android app
    if (state.value.phase === "downloading" || state.value.phase === "ready") {
      poll();
      return;
    }

    const latest = await fetchLatest();
    if (!latest) return;

    const current = Number(n.currentVersionCode());
    if (latest.versionCode <= current) {
      n.cleanup(-1); // already up to date: delete leftover APKs
      state.value.phase = "idle";
      return;
    }

    state.value.latest = latest;
    startDownload();
  };

  const install = () => {
    native()?.install();
  };

  /** Call once from app.vue */
  const init = () => {
    if (started || typeof window === "undefined") return;
    started = true;
    check();
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") check();
    });
    setInterval(check, 30 * 60 * 1000); // re-check every 30 minutes while open
  };

  return { state, init, check, startDownload, install };
};
