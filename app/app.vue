
<template>
  <!-- Splash screen: desktop splash window and mobile startup -->
  <div
    v-if="!startupReady || keepSplash"
    class="flex h-dvh w-dvw items-center justify-center bg-slate-950 p-6 text-white"
  >
    <div class="w-full max-w-md text-center">
      <img
        src="/images/logo.png"
        alt="ExamTips logo"
        class="mx-auto mb-6 h-24 w-24 object-contain"
      />

      <div
        class="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-cyan-400"
        :class="{ hidden: Boolean(startupError) }"
      />

      <h1 class="text-xl font-semibold">
        ExamTips
      </h1>

      <p class="mt-2 text-sm text-white/70">
        {{
          startupError
            ? "Startup could not finish."
            : startupStep
        }}
      </p>

      <div
        v-if="!startupError"
        class="mx-auto mt-6 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-white/10"
      >
        <div
          class="h-full animate-pulse rounded-full bg-cyan-400"
          style="width: 65%"
        />
      </div>

      <pre
        v-if="startupError"
        class="mt-4 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-black/30 p-3 text-left text-xs text-red-200"
      >{{ startupError }}</pre>

      <button
        v-if="startupError"
        type="button"
        class="mt-5 rounded-lg bg-cyan-600 px-5 py-2 text-sm font-semibold hover:bg-cyan-500"
        @click="initializeApp"
      >
        Retry startup
      </button>

      <p class="mt-6 text-xs text-white/40">
        Please wait while ExamTips prepares your application.
      </p>
    </div>
  </div>

  <!-- Main application: rendered only after successful startup -->
  <div
    v-else
    class="mt-5 h-dvh w-dvw sm:overflow-hidden"
  >
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
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

let splashDone = false
let startupRunning = false

let splashQueryUnlisten: (() => void) | undefined
let splashReadyUnlisten: (() => void) | undefined


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
     * PLAIN BROWSER
     *
     * npm run dev in a normal browser does not have the
     * native Tauri runtime or bundled DB setup.
     */

    if (!import.meta.client || !isTauri()) {
      await runStep(
        "Loading your saved session...",
        () => auth.initialize(),
        errors,
      )

      if (errors.length === 0) {
        startupReady.value = true
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
  void initializeApp()
})
</script>
