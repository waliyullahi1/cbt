import { getVersion } from "@tauri-apps/api/app"
import { appConfigDir, join, resolveResource } from "@tauri-apps/api/path"
import {
  exists,
  mkdir,
  open,
  readFile,
  remove,
  rename,
  writeFile,
} from "@tauri-apps/plugin-fs"
import { isMobileTauri } from "~/utils/isMobileTauri"

const bundledDatabases = [
  "questions.db",
  "lessons.db",
  "dictionary.db",
] as const

const writableContentDatabases = [
  "questions.db",
  "lessons.db",
] as const

const sqliteHeader = new Uint8Array([
  0x53, 0x51, 0x4c, 0x69, 0x74, 0x65, 0x20, 0x66,
  0x6f, 0x72, 0x6d, 0x61, 0x74, 0x20, 0x33, 0x00,
])
const copyBufferSize = 256 * 1024
const cacheVersionFileName = "bundled-databases.version"

let initializationPromise: Promise<void> | null = null

function getPlatformName(): string {
  if (typeof navigator !== "undefined" && /android/i.test(navigator.userAgent)) {
    return "android"
  }

  if (isMobileTauri()) {
    return "mobile"
  }

  return "desktop"
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

async function copyDatabase(
  database: string,
  source: string,
  destination: string,
  replaceDestination: boolean,
): Promise<void> {
  const temporary = `${destination}.installing`
  let sourceExists = false
  let destinationExists = await exists(destination)
  let sourceFile: Awaited<ReturnType<typeof open>> | undefined
  let destinationFile: Awaited<ReturnType<typeof open>> | undefined

  console.info("[database bootstrap] copy started", {
    platform: getPlatformName(),
    database,
    sourceResolved: true,
    sourceExists: false,
    destinationExists,
  })

  try {
    sourceFile = await open(source, { read: true })
    sourceExists = true
    destinationFile = await open(temporary, {
      write: true,
      create: true,
      truncate: true,
    })

    const buffer = new Uint8Array(copyBufferSize)
    const header = new Uint8Array(sqliteHeader.length)
    let headerLength = 0
    let bytesCopied = 0

    while (true) {
      const bytesRead = await sourceFile.read(buffer)
      if (bytesRead === null) {
        break
      }
      if (bytesRead === 0) {
        continue
      }

      if (headerLength < header.length) {
        const bytesToCapture = Math.min(
          header.length - headerLength,
          bytesRead,
        )
        header.set(
          buffer.subarray(0, bytesToCapture),
          headerLength,
        )
        headerLength += bytesToCapture
      }

      await destinationFile.write(buffer.subarray(0, bytesRead))
      bytesCopied += bytesRead
    }

    if (
      bytesCopied === 0 ||
      headerLength !== sqliteHeader.length ||
      !header.every((byte, index) => byte === sqliteHeader[index])
    ) {
      throw new Error("The bundled file is empty or is not a SQLite database.")
    }

    await sourceFile.close()
    sourceFile = undefined
    await destinationFile.close()
    destinationFile = undefined

    if (destinationExists && replaceDestination) {
      await remove(destination)
      destinationExists = false
    }

    if (!destinationExists) {
      await rename(temporary, destination)
    } else {
      await remove(temporary)
    }

    if (!(await exists(destination))) {
      throw new Error("The copied database is missing from application storage.")
    }

    console.info("[database bootstrap] copy succeeded", {
      platform: getPlatformName(),
      database,
      sourceExists,
      destinationExists: true,
      bytesCopied,
    })
  } catch (error) {
    for (const file of [sourceFile, destinationFile]) {
      if (!file) {
        continue
      }

      try {
        await file.close()
      } catch (closeError) {
        console.error("[database bootstrap] failed to close a database file", {
          platform: getPlatformName(),
          database,
          error: closeError,
        })
      }
    }

    try {
      if (await exists(temporary)) {
        await remove(temporary)
      }
    } catch (cleanupError) {
      console.error("[database bootstrap] temporary-file cleanup failed", {
        platform: getPlatformName(),
        database,
        error: cleanupError,
      })
    }

    console.error("[database bootstrap] copy failed", {
      platform: getPlatformName(),
      database,
      stage: sourceExists ? "copy-or-validate" : "open-bundled-source",
      sourceExists,
      destinationExists,
      error,
    })

    throw new Error(
      `Could not prepare bundled database "${database}": ${errorMessage(error)}`,
    )
  }
}

async function initializeBundledDatabasesOnce(): Promise<void> {
  const platform = getPlatformName()
  const appConfig = await appConfigDir()

  if (!(await exists(appConfig))) {
    await mkdir(appConfig, { recursive: true })
  }

  console.info("[database bootstrap] application database directory ready", {
    platform,
    directoryExists: true,
  })

  const resources = new Map(
    await Promise.all(
      bundledDatabases.map(async (database) => [
        database,
        await resolveResource(`resources/${database}`),
      ] as const),
    ),
  )

  const cacheVersion = `${await getVersion()}-2`
  const cacheVersionPath = await join(appConfig, cacheVersionFileName)
  const versionExists = await exists(cacheVersionPath)
  const installedVersion = versionExists
    ? new TextDecoder().decode(await readFile(cacheVersionPath))
    : ""
  const refreshCache = installedVersion !== cacheVersion

  for (const database of bundledDatabases) {
    const destination = await join(appConfig, `bundled-${database}`)
    const destinationExists = await exists(destination)

    if (destinationExists && !refreshCache) {
      console.info("[database bootstrap] bundled cache already present", {
        platform,
        database,
        destinationExists: true,
      })
      continue
    }

    await copyDatabase(
      database,
      resources.get(database)!,
      destination,
      refreshCache,
    )
  }

  await writeFile(
    cacheVersionPath,
    new TextEncoder().encode(cacheVersion),
  )

  for (const database of writableContentDatabases) {
    const destination = await join(appConfig, database)
    const destinationExists = await exists(destination)

    if (destinationExists) {
      console.info("[database bootstrap] writable database preserved", {
        platform,
        database,
        destinationExists: true,
      })
      continue
    }

    await copyDatabase(
      database,
      resources.get(database)!,
      destination,
      false,
    )
  }
}

export function initializeBundledDatabases(): Promise<void> {
  if (!initializationPromise) {
    initializationPromise = initializeBundledDatabasesOnce().catch((error) => {
      initializationPromise = null
      throw error
    })
  }

  return initializationPromise
}