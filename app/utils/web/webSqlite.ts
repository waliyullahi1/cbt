
export type WebDatabase = {
  select<T = any>(sql: string, params?: unknown[]): Promise<T>

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

let worker: Worker | null = null
let nextId = 1

const pending = new Map<number, Pending>()

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(
      new URL('./sqlite.worker.ts', import.meta.url),
      { type: 'module' }
    )

    worker.onmessage = (event: MessageEvent) => {
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

    worker.onerror = (event) => {
      const error = new Error(
        event.message || 'SQLite worker failed'
      )

      for (const call of pending.values()) {
        call.reject(error)
      }

      pending.clear()
      worker?.terminate()
      worker = null
    }
  }

  return worker
}

function send<T>(
  msg: Record<string, unknown>,
  transfer: Transferable[] = [],
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const id = nextId++

    pending.set(id, { resolve, reject })

    try {
      getWorker().postMessage(
        { id, ...msg },
        transfer
      )
    } catch (error) {
      pending.delete(id)

      reject(
        error instanceof Error
          ? error
          : new Error(String(error))
      )
    }
  })
}

export function openWebDatabase(
  name: string
): WebDatabase {
  return {
    select: (sql, params = []) =>
      send({
        type: 'select',
        name,
        sql,
        params,
      }),

    execute: (sql, params = []) =>
      send({
        type: 'execute',
        name,
        sql,
        params,
      }),
  }
}

// --------------------------------------------------
// Install bundled browser databases
// --------------------------------------------------

const VERSION_KEY = 'examtips-db-version'

const BUNDLED = [
  'questions.db',
  'lessons.db',
  'dictionary.db',
]

let installationPromise: Promise<void> | null = null

export function installWebDatabases(
  appVersion: string
): Promise<void> {
  if (installationPromise) {
    return installationPromise
  }

  installationPromise = installDatabases(appVersion)
    .catch((error) => {
      installationPromise = null
      throw error
    })

  return installationPromise
}

async function installDatabases(
  appVersion: string
): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error('Browser database installation requires a client')
  }

  const refresh =
    localStorage.getItem(VERSION_KEY) !== appVersion

  for (const name of BUNDLED) {
    const installed = await send<boolean>({
      type: 'exists',
      name,
    })

    if (installed && !refresh) {
      continue
    }

    const response = await fetch(`/db/${name}`)

    if (!response.ok) {
      throw new Error(
        `Could not download ${name} (${response.status})`
      )
    }

    const bytes = await response.arrayBuffer()

    await send(
      {
        type: 'install',
        name,
        bytes,
        replace: refresh,
      },
      [bytes]
    )
  }

  // Only save the version after all databases are installed.
  localStorage.setItem(VERSION_KEY, appVersion)

  try {
    await navigator.storage?.persist?.()
  } catch (error) {
    console.warn('Could not request persistent storage:', error)
  }
}

// --------------------------------------------------
// Platform detection
// --------------------------------------------------

export function isTauriApp(): boolean {
  return (
    typeof window !== 'undefined' &&
    '__TAURI_INTERNALS__' in window
  )
}

// --------------------------------------------------
// Unified database loader
// --------------------------------------------------

export async function loadDatabase(
  connectionString: string
): Promise<WebDatabase> {
  if (isTauriApp()) {
    const { default: Database } =
      await import('@tauri-apps/plugin-sql')

    return (
      await Database.load(connectionString)
    ) as unknown as WebDatabase
  }

  const name = connectionString
    .replace(/^sqlite:/, '')
    .split('?')[0]
    .replace(/^bundled-/, '')

  return openWebDatabase(name)
}
