<template>
  <div>
    <VitePwaManifest />

  <div
     v-if="!startupReady || keepSplash || holdForAnimation"
    class="sp"
  >
    <div class="sp-stack">
      <svg
        class="sp-logo"
        viewBox="140 170 740 690"
        preserveAspectRatio="xMidYMid meet"
        :style="logoStyle"
        aria-hidden="true"
      >
        <!-- dots -->
        <path class="sp-pop sp-d1" fill="#032B64" d="M330.85 208.2c0,48.8 60.11,34.26 60.11,3.54 0,-39.92 -60.11,-42.4 -60.11,-3.54z" />
        <path class="sp-pop sp-d2" fill="#032B64" d="M330.85 293.06c0,55.04 60.11,37.13 60.11,7.07 0,-15.83 -11.28,-28.4 -25.96,-30.6 -13.8,-2.07 -34.15,10.36 -34.15,23.53z" />
        <path class="sp-pop sp-d3" fill="#0B769B" d="M330.85 384.99c0,42.51 60.11,32.94 60.11,3.54 0,-38.77 -60.11,-44.47 -60.11,-3.54z" />

        <!-- lines -->
        <path class="sp-line sp-l1" fill="#032B64" d="M415.71 208.2c0,17.48 14.34,31.82 31.82,31.82l212.16 0c52.15,0 49.11,-60.11 0,-60.11l-205.09 0c-19.74,0 -38.89,10.4 -38.89,28.29z" />
        <path class="sp-line sp-l2" fill="#032B64" d="M415.71 300.13c0,19.82 20.81,28.29 38.89,28.29l169.73 0c50.86,0 47.44,-56.57 10.6,-56.57l-190.93 0c-17.11,0 -28.29,11.18 -28.29,28.28z" />
        <path class="sp-line sp-l3" fill="#0B769B" d="M415.71 384.99c0,34.81 36.41,28.29 63.64,28.29 38.01,0 39.06,-56.57 -3.53,-56.57 -22.14,0 -60.11,-4.93 -60.11,28.28z" />

        <!-- book pages -->
        <path class="sp-page sp-left" fill="#032B64" d="M154.05 409.75c0,64.82 0.08,129.65 0,194.47 -0.11,88.82 21.11,78.17 155.54,137.95 28.08,12.49 132.24,70.63 157.64,89.92 6.63,5.03 26.27,23.12 26.27,1.96l0 -141.43c0,-43.73 -75.72,-98.38 -105.15,-128.22 -21.68,-21.99 -112.8,-90.23 -133.15,-103.76 -17.07,-11.35 -30.89,-19.69 -47.91,-29.88 -22.63,-13.54 -36.64,-27.46 -53.24,-21.01z" />
        <path class="sp-page sp-right" fill="#032B64" d="M525.32 692.62c0,167.28 -10.52,165.19 37.48,132.94 62.12,-41.74 122.56,-67.85 186.42,-99.98 16.72,-8.41 31.82,-13.88 49.35,-21.37 33.24,-14.23 69.73,-29.84 69.73,-75.24 0,-246.58 14.9,-237.34 -44.87,-203.99 -65.86,36.74 -129.63,85.97 -187.45,134.32l-60.63 59.59c-19.85,25.02 -50.03,38.26 -50.03,73.73z" />

        <!-- check -->
        <path class="sp-check" fill="#029AC3" d="M507.64 505.21c-10.94,-9.5 -20.16,-18.29 -30.93,-29.17 -12.53,-12.66 -32.24,-37.81 -61.73,-13.98 -39.55,31.97 13.33,77.26 34.09,94.66 69.59,58.34 39.57,89.34 190.35,-68.23l40.03 -41.3c0.5,-0.53 1.22,-1.28 1.73,-1.81 1.49,-1.56 5.23,-5.22 7.07,-7.07 0.52,-0.51 1.26,-1.25 1.77,-1.76 20.25,-20.25 67.81,-55 32.41,-89.55 -29.73,-29.01 -59.44,4.64 -79.54,24.73 -27.64,27.64 -118.08,121.99 -135.25,133.48z" />
      </svg>

      <div class="sp-name"><span class="sp-exam">Exam</span><span class="sp-tips">tips</span></div>
      <div class="sp-tag"> Learn &nbsp;·&nbsp; Practice &nbsp;·&nbsp; Succeed</div>

      <div v-if="!startupError" class="sp-status">{{ startupStep }}</div>

      <div v-else class="sp-error">
        <p>Startup could not finish.</p>
        <pre>{{ startupError }}</pre>
        <button type="button" @click="initializeApp">Retry startup</button>
      </div>
    </div>
  </div>

     <div
    v-else 
    class="pt-[env(safe-area-inset-top)] h-dvh w-dvw overflow-hidden"
  >
  
    <NuxtLayout>
      
      <NuxtPage />
    </NuxtLayout>
  </div>
 </div>
 
</template>

<script setup lang="ts">
import {
  onMounted,
  ref,
} from "vue"

import {
  initializeDatabases,
} from "~/utils/databases"

import {
  initializeBundledDatabases,
} from "~/utils/database/databaseBootstrap"

import {
  isMobileTauri,
} from "~/utils/isMobileTauri"

// ✅ WEB CHANGE 1 of 3: the browser (PWA) database installer
import {
  installWebDatabases,
} from "~/utils/web/webSqlite"

import {
  isTauri,
  invoke,
} from "@tauri-apps/api/core"

import {
  emit,
  listen,
} from "@tauri-apps/api/event"

import {
  getCurrentWindow,
} from "@tauri-apps/api/window"


/* =========================================================
   LOGO SIZE  (change these two values)
========================================================= */

// Any CSS unit works: "180px", "60vw", "12rem", "min(52vw, 240px)"
const LOGO_WIDTH = "min(30vw, 100px)"

// "auto" keeps the logo's proportions. Set a value like "160px" or "30vh"
// to fit the logo inside a fixed box (it is never stretched).
const LOGO_HEIGHT = "auto"

const logoStyle = {
  "--logo-w": LOGO_WIDTH,
  "--logo-h": LOGO_HEIGHT,
}


/* =========================================================
   WEB (PWA) DATABASE VERSION
========================================================= */

// ✅ WEB CHANGE 2 of 3
// Bump this text whenever you put NEW .db files in public/db/,
// so browsers download the new copies instead of keeping old ones.
const WEB_DB_VERSION = "1.0.0"


/* =========================================================
   EVENTS
========================================================= */

const EVENT_DONE = "startup:done"
const EVENT_QUERY = "startup:query"
const EVENT_MAIN_READY = "startup:main-ready"

const MAIN_WAIT_TIMEOUT_MS = 60_000

const READY_KEY = "cbt:startup-ready"


/* =========================================================
   SESSION STARTUP FLAG
========================================================= */

function hasReadyFlag(): boolean {
  try {
    return sessionStorage.getItem(READY_KEY) === "1"
  } catch {
    return false
  }
}

function setReadyFlag(): void {
  try {
    sessionStorage.setItem(READY_KEY, "1")
  } catch {
    // Storage may be unavailable in some WebView contexts.
  }
}

function clearReadyFlag(): void {
  try {
    sessionStorage.removeItem(READY_KEY)
  } catch {
    // Ignore storage errors.
  }
}


/* =========================================================
   APPLICATION STATE
========================================================= */

const auth = useExamTipsAuth()
const software = useSoftwareSecurity()

const startupReady = ref(false)
const startupStep = ref("Preparing ExamTips...")
const startupError = ref("")
const keepSplash = ref(false)

// Mobile only: keeps the splash visible until the 2s logo animation finishes.
const holdForAnimation = ref(false)

let splashDone = false
let startupRunning = false

let splashQueryUnlisten: (() => void) | undefined
let splashReadyUnlisten: (() => void) | undefined


useHead({
  link: [
    {
      rel: "apple-touch-icon",
      href: "/image/pwa-192x192.png",
    },
  ],
});

/* =========================================================
   LOGGING
========================================================= */

function startupLog(
  message: string,
  details?: unknown,
): void {
  if (import.meta.dev) {
    console.info(`[startup] ${message}`, details ?? "")
  }
}

function startupLogError(
  message: string,
  error: unknown,
): void {
  console.error(`[startup] ${message}`, error)
}


/* =========================================================
   RUN A STARTUP STEP
========================================================= */

async function runStep(
  label: string,
  step: () => Promise<unknown>,
  errors: string[],
): Promise<void> {
  startupStep.value = label

  const startedAt = performance.now()

  startupLog(`Starting: ${label}`)

  try {
    await step()

    startupLog(
      `Completed: ${label}`,
      {
        durationMs: Math.round(
          performance.now() - startedAt,
        ),
      },
    )
  } catch (error) {
    startupLogError(`${label} failed`, error)

    const message =
      error instanceof Error
        ? error.message
        : String(error)

    errors.push(`${label}\n${message}`)
  }
}


/* =========================================================
   FULL INITIALIZATION
========================================================= */

async function initializeCore(
  errors: string[],
): Promise<void> {
  /*
   * Run independent initialization tasks concurrently.
   *
   * Each task records its own error. The next stage will
   * still be attempted so all startup failures can be shown.
   */

  await Promise.all([
    runStep(
      "Loading your saved session...",
      () => auth.initialize(),
      errors,
    ),

    runStep(
      "Checking software activation...",
      () => software.initialize(),
      errors,
    ),

    runStep(
      "Preparing the bundled databases...",
      () => initializeBundledDatabases(),
      errors,
    ),
  ])

  /*
   * Do not open/migrate the application database if
   * the bundled database preparation failed.
   */

  const bundleFailed = errors.some(
    (message) =>
      message.startsWith(
        "Preparing the bundled databases...",
      ),
  )

  if (bundleFailed) {
    errors.push(
      "Application database initialization was skipped because bundled database preparation failed.",
    )

    return
  }

  await runStep(
    "Initializing the application databases...",
    () => initializeDatabases(),
    errors,
  )
}


/* =========================================================
   LIGHT INITIALIZATION
========================================================= */

async function resumeUi(
  errors: string[],
): Promise<void> {
  /*
   * Used when the page refreshes in the same app session.
   * No bundled DB copying or full migration is performed.
   */

  await runStep(
    "Restoring your session...",
    () => auth.initialize(),
    errors,
  )

  await runStep(
    "Opening the application databases...",
    () =>
      initializeDatabases({
        migrate: false,
      }),
    errors,
  )
}


/* =========================================================
   WAIT FOR AN EVENT
========================================================= */

function waitForEvent(
  eventName: string,
  timeoutMs: number,
): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    let settled = false
    let unlisten: (() => void) | undefined

    const finish = (success: boolean) => {
      if (settled) return

      settled = true

      clearTimeout(timer)

      unlisten?.()

      resolve(success)
    }

    const timer = setTimeout(() => {
      startupLog(
        `Timed out waiting for ${eventName}`,
      )

      finish(false)
    }, timeoutMs)

    listen(eventName, () => {
      finish(true)
    })
      .then((stopListening) => {
        if (settled) {
          stopListening()
          return
        }

        unlisten = stopListening
      })
      .catch((error) => {
        startupLogError(
          `Could not listen for ${eventName}`,
          error,
        )

        finish(false)
      })
  })
}


/* =========================================================
   SPLASH WINDOW LISTENERS
========================================================= */

async function setupSplashListeners(): Promise<void> {
  /*
   * The splash window must listen for the main window's
   * readiness before it announces that its own startup
   * is complete.
   */

  if (!splashQueryUnlisten) {
    splashQueryUnlisten = await listen(
      EVENT_QUERY,
      () => {
        if (splashDone) {
          void emit(EVENT_DONE, {
            ok: true,
          })
        }
      },
    )
  }

  if (!splashReadyUnlisten) {
    splashReadyUnlisten = await listen(
      EVENT_MAIN_READY,
      () => {
        startupLog(
          "Main window reported successful initialization",
        )

        splashDone = true

        /*
         * Desktop splash closes only after the main
         * window has initialized successfully.
         */
        void getCurrentWindow().close()
      },
    )
  }
}


/* =========================================================
   MAIN INITIALIZATION
========================================================= */

async function initializeApp(): Promise<void> {
  if (startupRunning) {
    return
  }

  startupRunning = true

  startupError.value = ""
  startupReady.value = false

  const totalStart = performance.now()
  const errors: string[] = []

  let isDesktopMain = false
  let isDesktopSplash = false
  let mobile = false

  try {
    /*
     * PLAIN BROWSER  (this is the PWA / website path)
     *
     * ✅ WEB CHANGE 3 of 3
     *
     * A normal browser has no Tauri runtime, so none of the Tauri
     * code below this block ever runs there. Here we:
     *   1. restore the saved session
     *   2. download the .db files once into the browser's storage
     *   3. open the databases
     * If any step fails, the error and the Retry button are shown.
     */

    if (!import.meta.client || !isTauri()) {
      await runStep(
        "Loading your saved session...",
        () => auth.initialize(),
        errors,
      )

      if (import.meta.client) {
        await runStep(
          "Preparing the offline databases...",
          () => installWebDatabases(WEB_DB_VERSION),
          errors,
        )

        if (errors.length === 0) {
          await runStep(
            "Initializing the application databases...",
            () => initializeDatabases(),
            errors,
          )
        }
      }

      if (errors.length === 0) {
        startupReady.value = true
      } else {
        startupError.value = errors.join("\n\n")
      }

      return
    }

    const appWindow = getCurrentWindow()

    mobile = isMobileTauri()
    const isSplash =
      appWindow.label === "splashscreen"

    const isMain =
      appWindow.label === "main"

    isDesktopSplash = isSplash

    isDesktopMain = isMain

    /*
     * MOBILE
     *
     * The same window displays the splash and the app.
     * Do not use the desktop splash/main event handshake.
     */

    if (mobile) {
      keepSplash.value = false

      if (hasReadyFlag()) {
        startupLog(
          "Mobile page refresh detected",
        )

        await resumeUi(errors)
      } else {
        await initializeCore(errors)
      }

      if (errors.length > 0) {
        clearReadyFlag()

        startupError.value = errors.join("\n\n")

        return
      }

      setReadyFlag()

      startupStep.value = "Opening ExamTips..."

      startupReady.value = true

      startupLog(
        "Mobile startup completed successfully",
      )

      return
    }

    /*
     * DESKTOP SPLASH WINDOW
     */

    if (isSplash) {
      keepSplash.value = true

      startupReady.value = false

      await setupSplashListeners()

      await initializeCore(errors)

      if (errors.length > 0) {
        clearReadyFlag()

        startupError.value = errors.join("\n\n")

        splashDone = false

        return
      }

      splashDone = true

      startupStep.value =
        "Waiting for the application..."

      /*
       * Notify the main window that the splash's
       * initialization has finished.
       *
       * The splash remains visible until the main window
       * sends EVENT_MAIN_READY.
       */

      await emit(EVENT_DONE, {
        ok: true,
      })

      startupLog(
        "Splash initialization complete; waiting for main window",
      )

      /*
       * The splash intentionally stays mounted.
       * The EVENT_MAIN_READY listener closes it.
       */

      return
    }

    /*
     * DESKTOP MAIN WINDOW
     */

    if (isMain) {
      /*
       * Keep the main window hidden until everything
       * needed by its own JavaScript context is ready.
       */

      await appWindow.setResizable(true)

      if (hasReadyFlag()) {
        startupLog(
          "Desktop refresh detected",
        )

        await resumeUi(errors)
      } else {
        startupStep.value =
          "Waiting for the splash screen..."

        const splashOk = await waitForEvent(
          EVENT_DONE,
          MAIN_WAIT_TIMEOUT_MS,
        )

        if (splashOk) {
          /*
           * The splash has initialized the bundled
           * databases. Initialize the main window's own
           * application state and open the databases.
           */

          await resumeUi(errors)
        } else {
          /*
           * If the splash event was missed, safely run
           * full initialization instead of showing a
           * partially initialized application.
           */

          startupLog(
            "Splash handshake timed out; running full initialization",
          )

          await initializeCore(errors)
        }
      }

      if (errors.length > 0) {
        clearReadyFlag()

        startupError.value = errors.join("\n\n")

        /*
         * Do not emit EVENT_MAIN_READY on failure.
         * The splash remains visible.
         */

        return
      }

      setReadyFlag()

      startupStep.value = "Opening ExamTips..."

      /*
       * This event is sent only after the main window
       * has completed initialization successfully.
       */

      await emit(EVENT_MAIN_READY)

      /*
       * Reveal the main window only after successful
       * initialization.
       */

      await invoke("show_main_window")

      startupReady.value = true

      startupLog(
        "Desktop main window is ready",
      )

      return
    }

    /*
     * FALLBACK FOR OTHER TAURI WINDOWS
     */

    await initializeCore(errors)

    if (errors.length > 0) {
      startupError.value = errors.join("\n\n")
      return
    }

    startupReady.value = true
  } catch (error) {
    startupLogError(
      "Application startup failed",
      error,
    )

    errors.push(
      error instanceof Error
        ? error.message
        : String(error),
    )

    clearReadyFlag()

    startupError.value = errors.join("\n\n")
  } finally {
    startupLog(
      `Total startup time: ${Math.round(
        performance.now() - totalStart,
      )}ms`,
    )

    /*
     * The desktop main window should be revealed only
     * when startup has succeeded.
     *
     * On failure, keep the splash visible and leave the
     * main window hidden.
     */

    if (
      isDesktopMain &&
      startupReady.value
    ) {
      await invoke(
        "show_main_window",
      ).catch((error) => {
        startupLogError(
          "Failed to show main window",
          error,
        )

        startupReady.value = false

        startupError.value =
          "Initialization completed, but the application window could not be shown. Please retry."
      })
    }

    if (
      isDesktopSplash &&
      startupError.value
    ) {
      keepSplash.value = true
    }

    startupRunning = false
  }
}


/* =========================================================
   MOUNT
========================================================= */

onMounted(() => {
  // The logo is drawn: tell Android it can remove the native splash.
  requestAnimationFrame(() =>
    requestAnimationFrame(() => (window as any).SplashBridge?.ready?.()),
  )

  // On mobile, keep the splash until the 2s animation has finished,
  // even if startup is faster. Skipped on a page refresh in the same session.
  if (isTauri() && isMobileTauri() && !hasReadyFlag()) {
    holdForAnimation.value = true
    setTimeout(() => (holdForAnimation.value = false), 2300)
  }

  void initializeApp()
})
</script>

<style scoped>
.sp {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #EEF5FF; /* must match the native splash colour */
}
.sp-stack {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  max-width: 100%;
  animation: sp-rise 0.3s 1.7s ease-out both;
}

/* Size is controlled by LOGO_WIDTH / LOGO_HEIGHT in the script */
.sp-logo {
  width: var(--logo-w, min(52vw, 240px));
  height: var(--logo-h, auto);
  overflow: visible;
  transform-origin: 50% 60%;
  animation: sp-pulse 0.2s 1.5s ease-in-out both;
}
.sp-logo * { transform-box: fill-box; }

.sp-pop { transform-origin: center; opacity: 0; animation: sp-pop 0.2s ease-out forwards; }
.sp-d1 { animation-delay: 0s; }
.sp-d2 { animation-delay: 0.25s; }
.sp-d3 { animation-delay: 0.4s; }

.sp-line { transform-origin: left center; opacity: 0; animation: sp-grow 0.25s ease-out forwards; }
.sp-l1 { animation-delay: 0.2s; }
.sp-l2 { animation-delay: 0.35s; }
.sp-l3 { animation-delay: 0.5s; }

.sp-page { opacity: 0; animation: sp-open 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) 0.6s forwards; }
.sp-left { transform-origin: right bottom; }
.sp-right { transform-origin: left bottom; }

/* The check is a filled shape (not a stroke), so it is revealed with a wipe */
.sp-check {
  clip-path: inset(0 100% 0 0);
  animation: sp-wipe 0.4s ease-out 1s forwards, sp-glow 0.5s ease-out 1s forwards;
}

.sp-name {
  margin-top: 14px;
  font: 800 clamp(25px, 11vw, 22px) / 1 system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  letter-spacing: -0.5px;
  opacity: 0;
  animation: sp-fade 0.3s 1.7s ease-out forwards;
}
.sp-exam { color: #0B3A7A; }
.sp-tips { color: #12B5D6; }
.sp-tag {
  margin-top: 10px;
  font: 500 13px system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  color: #4B6A8F;
  letter-spacing: 0.5px;
  opacity: 0;
  animation: sp-fade 0.1s 1.9s ease-out forwards;
}
.sp-status {
  margin-top: 22px;
  min-height: 18px;
  font: 400 12px system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  color: #6F86A6;
  opacity: 0;
  animation: sp-fade 0.3s 2.1s ease-out forwards;
}

.sp-error { margin-top: 20px; width: min(86vw, 360px); text-align: center; font-family: system-ui, sans-serif; }
.sp-error p { margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #0B3A7A; }
.sp-error pre {
  max-height: 160px;
  overflow: auto;
  margin: 0 0 14px;
  padding: 10px;
  border-radius: 8px;
  background: #fff;
  color: #B42318;
  font-size: 11px;
  text-align: left;
  white-space: pre-wrap;
  word-break: break-word;
}
.sp-error button {
  padding: 9px 20px;
  border: 0;
  border-radius: 8px;
  background: #0B3A7A;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
}

@keyframes sp-pop { from { opacity: 0; transform: scale(0.2); } to { opacity: 1; transform: scale(1); } }
@keyframes sp-grow { from { opacity: 0; transform: scaleX(0); } to { opacity: 1; transform: scaleX(1); } }
@keyframes sp-open { from { opacity: 0; transform: scale(0.2, 0.6); } to { opacity: 1; transform: scale(1); } }
@keyframes sp-wipe { to { clip-path: inset(0 0 0 0); } }
@keyframes sp-glow {
  0% { filter: drop-shadow(0 0 0 rgba(0, 200, 255, 0)); }
  40% { filter: drop-shadow(0 0 8px rgba(0, 200, 255, 0.9)); }
  100% { filter: drop-shadow(0 0 0 rgba(0, 200, 255, 0)); }
}
@keyframes sp-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.06); } }
@keyframes sp-fade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
@keyframes sp-rise { from { transform: translateY(40px); } to { transform: translateY(0); } }

@media (prefers-reduced-motion: reduce) {
  .sp-pop, .sp-line, .sp-page, .sp-check, .sp-name, .sp-tag, .sp-status, .sp-logo, .sp-stack {
    animation-duration: 0.01s;
    animation-delay: 0s;
  }
}
</style>