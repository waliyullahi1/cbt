
import type { Worker as WorkerType } from 'worker'

// ==================================================
// TYPES
// ==================================================

export type WebDatabase = {
  select<T = any>(
    sql: string,
    params?: unknown[],
  ): Promise<T>

  execute(
    sql: string,
    params?: unknown[],
  ): Promise<{
    rowsAffected: number
    lastInsertId: number | null
  }>
}

type Pending = {
  resolve: (value: any) => void
  reject: (error: Error) => void
}

type WorkerResponse = {
  id: number
  result?: unknown
  error?: string
}

type DatabaseMessage =
  | {
      type: 'exists'
      name: string
    }
  | {
      type: 'install'
      name: string
      bytes: ArrayBuffer
      replace: boolean
    }
  | {
      type: 'select'
      name: string
      sql: string
      params?: unknown[]
    }
  | {
      type: 'execute'
      name: string
      sql: string
      params?: unknown[]
    }

// ==================================================
// WORKER STATE
// ==================================================

let worker: Worker | null = null

let nextId = 1

const pending = new Map<number, Pending>()

// ==================================================
// WORKER ERROR HANDLING
// ==================================================

function rejectPendingRequests(error: Error): void {
  for (const call of pending.values()) {
    call.reject(error)
  }

  pending.clear()
}

function destroyWorker(error: Error): void {
  rejectPendingRequests(error)

  if (worker) {
    worker.terminate()
    worker = null
  }
}

// ==================================================
// CREATE OR REUSE SQLITE WORKER
// ==================================================

function getWorker(): Worker {
  if (worker) {
    return worker
  }

  const instance = new Worker(
    new URL('./sqlite.worker.ts', import.meta.url),
    {
      type: 'module',
      name: 'examtips-sqlite-worker',
    },
  )

  instance.onmessage = (
    event: MessageEvent<WorkerResponse>,
  ) => {
    const { id, result, error } = event.data

    const call = pending.get(id)

    if (!call) return

    pending.delete(id)

    if (error) {
      call.reject(new Error(error))
    } else {
      call.resolve(result)
    }
  }

  instance.onerror = (event: ErrorEvent) => {
    const error = new Error(
      event.message || 'SQLite worker failed.',
    )

    destroyWorker(error)
  }

  instance.onmessageerror = () => {
    const error = new Error(
      'Could not read a message from the SQLite worker.',
    )

    destroyWorker(error)
  }

  worker = instance

  return instance
}

// ==================================================
// SEND MESSAGE TO SQLITE WORKER
// ==================================================

function send<T>(
  msg: DatabaseMessage,
  transfer: Transferable[] = [],
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const id = nextId++

    pending.set(id, {
      resolve,
      reject,
    })

    try {
      getWorker().postMessage(
        {
          id,
          ...msg,
        },
        transfer,
      )
    } catch (error) {
      pending.delete(id)

      reject(
        error instanceof Error
          ? error
          : new Error(String(error)),
      )
    }
  })
}

// ==================================================
// OPEN WEB DATABASE
// ==================================================

export function openWebDatabase(
  name: string,
): WebDatabase {
  return {
    select: <T = any>(
      sql: string,
      params: unknown[] = [],
    ) => {
      return send<T>({
        type: 'select',
        name,
        sql,
        params,
      })
    },

    execute: (
      sql: string,
      params: unknown[] = [],
    ) => {
      return send<{
        rowsAffected: number
        lastInsertId: number | null
      }>({
        type: 'execute',
        name,
        sql,
        params,
      })
    },
  }
}

// ==================================================
// BUNDLED DATABASE INSTALLATION
// ==================================================

const VERSION_KEY = 'examtips-db-version'

const BUNDLED_DATABASES = [
  'questions.db',
  'lessons.db',
  'dictionary.db',
] as const

let installationPromise: Promise<void> | null = null

// ==================================================
// STORAGE HELPERS
// ==================================================

function readDatabaseVersion(): string | null {
  try {
    return localStorage.getItem(VERSION_KEY)
  } catch (error) {
    console.warn(
      'Could not read database version:',
      error,
    )

    return null
  }
}

function saveDatabaseVersion(version: string): void {
  try {
    localStorage.setItem(VERSION_KEY, version)
  } catch (error) {
    console.warn(
      'Could not save database version:',
      error,
    )
  }
}

function isBrowserOnline(): boolean {
  return typeof navigator !== 'undefined'
    ? navigator.onLine
    : false
}

// ==================================================
// INSTALL DATABASES
// ==================================================

export function installWebDatabases(
  appVersion: string,
): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(
      new Error('Browser environment required.'),
    )
  }

  if (!installationPromise) {
    installationPromise = installDatabases(appVersion)
      .catch((error) => {
        installationPromise = null
        throw error
      })
  }

  return installationPromise
}

// ==================================================
// ACTUAL INSTALLATION PROCESS
// ==================================================

async function installDatabases(
  appVersion: string,
): Promise<void> {
  const previousVersion = readDatabaseVersion()

  const refresh = previousVersion !== appVersion

  let allUpdated = true

  for (const name of BUNDLED_DATABASES) {
    console.info(`[ExamTips DB] Checking ${name}`)

    // ----------------------------------------------
    // 1. Check whether database exists in OPFS
    // ----------------------------------------------

    const installed = await send<boolean>({
      type: 'exists',
      name,
    })

    // ----------------------------------------------
    // 2. Reuse existing database when appropriate
    // ----------------------------------------------

    if (installed && (!refresh || !isBrowserOnline())) {
      console.info(
        `[ExamTips DB] Reusing existing ${name}`,
      )

      if (refresh) {
        allUpdated = false
      }

      continue
    }

    // ----------------------------------------------
    // 3. Download database
    // ----------------------------------------------

    try {
      console.info(
        `[ExamTips DB] Downloading ${name}`,
      )

      const response = await fetch(
        `/db/${name}`,
        {
          method: 'GET',
          cache: 'no-cache',
        },
      )

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: ${response.statusText}`,
        )
      }

      const bytes = await response.arrayBuffer()

      if (bytes.byteLength === 0) {
        throw new Error(
          `${name} is empty.`,
        )
      }

      console.info(
        `[ExamTips DB] Downloaded ${name}: ${(
          bytes.byteLength / 1024 / 1024
        ).toFixed(2)} MB`,
      )

      // --------------------------------------------
      // 4. Install database into OPFS
      // --------------------------------------------

      await send<{ installed: boolean }>(
        {
          type: 'install',
          name,
          bytes,
          replace: installed,
        },
        [bytes],
      )

      console.info(
        `[ExamTips DB] Installed ${name}`,
      )

    } catch (error) {
      console.error(
        `[ExamTips DB] Failed to install ${name}`,
        error,
      )

      // Preserve a previously installed database.
      if (installed) {
        console.warn(
          `[ExamTips DB] Keeping existing ${name}`,
        )

        allUpdated = false

        continue
      }

      throw new Error(
        `Unable to install ${name}. ${
          error instanceof Error
            ? error.message
            : String(error)
        }`,
      )
    }
  }

  // ----------------------------------------------
  // 5. Save version only after successful updates
  // ----------------------------------------------

  if (allUpdated) {
    saveDatabaseVersion(appVersion)

    console.info(
      `[ExamTips DB] All databases are ready. Version: ${appVersion}`,
    )
  } else {
    console.warn(
      '[ExamTips DB] Some databases are still on an older version.',
    )
  }

  // ----------------------------------------------
  // 6. Request persistent browser storage
  // ----------------------------------------------

  try {
    if (navigator.storage?.persist) {
      const persistent =
        await navigator.storage.persist()

      console.info(
        `[ExamTips DB] Persistent storage: ${persistent}`,
      )
    }
  } catch (error) {
    console.warn(
      '[ExamTips DB] Storage persistence request failed:',
      error,
    )
  }
}

// ==================================================
// PLATFORM DETECTION
// ==================================================

export function isTauriApp(): boolean {
  return (
    typeof window !== 'undefined' &&
    '__TAURI_INTERNALS__' in window
  )
}

// ==================================================
// UNIFIED DATABASE LOADER
// ==================================================

export async function loadDatabase(
  connectionString: string,
): Promise<WebDatabase> {

  // ----------------------------------------------
  // TAURI: Use native SQLite plugin
  // ----------------------------------------------

  if (isTauriApp()) {
    const { default: Database } =
      await import('@tauri-apps/plugin-sql')

    return (
      await Database.load(connectionString)
    ) as unknown as WebDatabase
  }

  // ----------------------------------------------
  // BROWSER / PWA: Use SQLite WASM and OPFS
  // ----------------------------------------------

  const name = connectionString
    .replace(/^sqlite:/, '')
    .split('?')[0]
    .replace(/^bundled-/, '')

  if (
    !name ||
    name.includes('/') ||
    name.includes('\\') ||
    name === '.' ||
    name === '..'
  ) {
    throw new Error(
      `Invalid database connection string: ${connectionString}`,
    )
  }

  return openWebDatabase(name)
}
