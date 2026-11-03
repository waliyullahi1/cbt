
import sqlite3InitModule from '@sqlite.org/sqlite-wasm'

type Msg =
  | { id: number; type: 'exists'; name: string }
  | { id: number; type: 'install'; name: string; bytes: ArrayBuffer; replace: boolean }
  | { id: number; type: 'select'; name: string; sql: string; params?: unknown[] }
  | { id: number; type: 'execute'; name: string; sql: string; params?: unknown[] }

let pool: any = null
let poolPromise: Promise<any> | null = null

const connections = new Map<string, any>()

// Initialize SQLite only once, even when multiple requests arrive.
async function getPool() {
  if (pool) return pool

  if (poolPromise) return poolPromise

  poolPromise = (async () => {
    try {
      const sqlite3 = await sqlite3InitModule()

      const instance = await sqlite3.installOpfsSAHPoolVfs({
        name: 'examtips-pool',
        initialCapacity: 16,
      })

      pool = instance
      return instance
    } catch (error) {
      poolPromise = null
      throw error
    }
  })()

  return poolPromise
}

function normalizeName(name: string) {
  return name.replace(/^\/+/, '')
}

function hasFile(p: any, name: string) {
  const target = normalizeName(name)

  return p.getFileNames().some(
    (file: string) => normalizeName(file) === target
  )
}

async function open(name: string) {
  const p = await getPool()
  const filename = normalizeName(name)

  let db = connections.get(filename)

  if (!db) {
    db = new p.OpfsSAHPoolDb(`/${filename}`)
    connections.set(filename, db)
  }

  return db
}

function closeConnection(name: string) {
  const filename = normalizeName(name)
  const db = connections.get(filename)

  if (db) {
    db.close()
    connections.delete(filename)
  }
}

async function handleMessage(msg: Msg) {
  let result: unknown

  if (msg.type === 'exists') {
    result = hasFile(await getPool(), msg.name)

  } else if (msg.type === 'install') {
    const p = await getPool()
    const filename = normalizeName(msg.name)

    if (hasFile(p, filename) && !msg.replace) {
      result = { installed: false }
    } else {
      // Close any existing connection before replacing the database.
      closeConnection(filename)

      await p.importDb(
        `/${filename}`,
        new Uint8Array(msg.bytes)
      )

      result = { installed: true }
    }

  } else {
    const db = await open(msg.name)
    const bind = msg.params?.length ? msg.params : undefined

    if (msg.type === 'select') {
      result = db.exec({
        sql: msg.sql,
        bind,
        rowMode: 'object',
        returnValue: 'resultRows',
      })

    } else {
      db.exec({
        sql: msg.sql,
        bind,
      })

      result = {
        rowsAffected: db.changes(),
        lastInsertId: db.selectValue(
          'SELECT last_insert_rowid()'
        ),
      }
    }
  }

  self.postMessage({
    id: msg.id,
    result,
  })
}

// Serialize all operations in this worker.
// This prevents install/query operations from overlapping.
let operationQueue = Promise.resolve()

self.onmessage = (event: MessageEvent<Msg>) => {
  const msg = event.data

  operationQueue = operationQueue
    .then(() => handleMessage(msg))
    .catch((error) => {
      self.postMessage({
        id: msg.id,
        error: error instanceof Error
          ? error.message
          : String(error),
      })
    })
}
