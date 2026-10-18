import {
  startContentDownload,
  fetchSubjects,
  fetchTopics,
  fetchQuestions,
  fetchLearning,
} from "~/utils/contentDownloader"

import {
  saveQuestions,
  replaceLessonsWithLatestData,
} from "~/utils/contentSync"

// Ask the server for big pages first. If it rejects the size (HTTP 400/422)
// we fall back to the manifest batch size automatically.
const PREFERRED_PAGE_SIZE = 2000
const FALLBACK_PAGE_SIZE = 500

export function useContentSync() {
  const downloading = ref(false)
  const completed = ref(false)
  const error = ref("")
  const phase = ref("")
  const manifest = ref<any>(null)

  const subjectsDownloaded = ref(0)
  const topicsDownloaded = ref(0)
  const questionsDownloaded = ref(0)
  const learningDownloaded = ref(0)

  const downloadedTotal = computed(
    () =>
      subjectsDownloaded.value +
      topicsDownloaded.value +
      questionsDownloaded.value +
      learningDownloaded.value
  )

  const total = computed(() =>
    manifest.value ? Number(manifest.value.total || 0) : 0
  )

  const percentage = computed(() => {
    if (!total.value) return 0
    return Math.min(
      100,
      Math.round((downloadedTotal.value / total.value) * 100)
    )
  })

  // ==========================================================
  // RESPONSE HELPERS
  // ==========================================================

  function getItems(response: any, names: string[]) {
    if (Array.isArray(response)) return response

    for (const name of names) {
      if (Array.isArray(response?.data?.[name])) return response.data[name]
      if (Array.isArray(response?.[name])) return response[name]
    }

    return []
  }

  function getNextCursor(response: any) {
    return (
      response?.data?.nextCursor ??
      response?.data?.next_cursor ??
      response?.nextCursor ??
      response?.next_cursor ??
      null
    )
  }

  function isBadLimitError(err: any) {
    const message = String(err?.message || "")
    return message.startsWith("HTTP 400") || message.startsWith("HTTP 422")
  }

  // Generic cursor paginator. `onPage` is awaited only for the PREVIOUS page,
  // so fetching page N+1 overlaps with saving page N.
  async function paginate(
    fetchPage: (limit: number, cursor: string) => Promise<any>,
    names: string[],
    onPage: (items: any[]) => Promise<void> | void
  ) {
    let limit = Math.max(
      Number(manifest.value?.batchSize || 0),
      PREFERRED_PAGE_SIZE
    )
    let cursor = ""
    let inFlight: Promise<void> | void = undefined
    const seenCursors = new Set<string>()

    while (true) {
      let response: any

      try {
        response = await fetchPage(limit, cursor)
      } catch (err) {
        if (limit > FALLBACK_PAGE_SIZE && isBadLimitError(err)) {
          limit = FALLBACK_PAGE_SIZE
          continue
        }
        throw err
      }

      const items = getItems(response, names)
      if (!items.length) break

      await inFlight // previous page must be saved before we queue this one
      inFlight = onPage(items)

      const nextCursor = getNextCursor(response)
      if (!nextCursor) break

      cursor = String(nextCursor)
      if (!cursor || seenCursors.has(cursor)) break // loop protection
      seenCursors.add(cursor)
    }

    await inFlight
  }

  // ==========================================================
  // DOWNLOAD PARTS
  // ==========================================================

  async function downloadSubjectsAndTopics(token: string) {
    const [subjectsResponse, topicsResponse] = await Promise.all([
      fetchSubjects(token),
      fetchTopics(token),
    ])

    const subjects = getItems(subjectsResponse, ["subjects", "items"])
    const topics = getItems(topicsResponse, ["topics", "items"])

    subjectsDownloaded.value = subjects.length
    topicsDownloaded.value = topics.length

    return { subjects, topics }
  }

  async function downloadQuestions(token: string) {
    let totalSaved = 0

    await paginate(
      (limit, cursor) => fetchQuestions(token, limit, cursor),
      ["questions", "items"],
      async (questions) => {
        await saveQuestions(questions)
        totalSaved += questions.length
        questionsDownloaded.value = totalSaved
      }
    )
  }

  async function downloadLearning(token: string) {
    const allLessons: any[] = []

    await paginate(
      (limit, cursor) => fetchLearning(token, limit, cursor),
      ["learning", "lessons", "items"],
      (lessons) => {
        allLessons.push(...lessons)
        learningDownloaded.value = allLessons.length
      }
    )

    return allLessons
  }

  function friendlyError(err: any) {
    const message = String(err?.message || "")

    if (/readonly|read-only|code: 8\b/i.test(message)) {
      return (
        "The local database is read-only, so the content could not be saved. " +
        "Fully close the app and reopen it. If it still happens, clear the app data and try again."
      )
    }

    return message || "Content download failed"
  }

  // ==========================================================
  // START COMPLETE DOWNLOAD
  // ==========================================================

  async function startDownload(token: string) {
    if (downloading.value) return

    downloading.value = true
    completed.value = false
    error.value = ""
    manifest.value = null

    subjectsDownloaded.value = 0
    topicsDownloaded.value = 0
    questionsDownloaded.value = 0
    learningDownloaded.value = 0

    try {
      // STEP 1: verify token
      phase.value = "Verifying activation token..."

      const startResponse = await startContentDownload(token)
      const responseData: any = startResponse.data

      manifest.value = responseData?.content
        ? {
            ...responseData.content,
            batchSize:
              responseData.content.batchSize || responseData.batchSize,
          }
        : responseData || null

      if (!manifest.value) {
        throw new Error("The server did not return a content manifest")
      }

      // STEP 2: everything downloads at the same time.
      //  - questions stream into questions.db while they download
      //  - subjects + topics + lessons download in parallel and are
      //    written to lessons.db together at the end
      phase.value = "Downloading content..."

      const questionsTask = downloadQuestions(token)

      const lessonsTask = (async () => {
        const [{ subjects, topics }, lessons] = await Promise.all([
          downloadSubjectsAndTopics(token),
          downloadLearning(token),
        ])

        phase.value = "Saving lessons..."

        await replaceLessonsWithLatestData({ subjects, topics, lessons })
      })()

      // allSettled so one failure never leaves the other task running
      // in the background; we then report the first error.
      const results = await Promise.allSettled([questionsTask, lessonsTask])
      const failed = results.find(
        (r): r is PromiseRejectedResult => r.status === "rejected"
      )
      if (failed) throw failed.reason

      phase.value = "Download complete"
      completed.value = true
    } catch (err: any) {
      console.error("❌ Content download failed:", err)

      error.value = friendlyError(err)
      phase.value = "Download failed"
    } finally {
      downloading.value = false
    }
  }

  return {
    downloading,
    completed,
    error,
    phase,
    manifest,
    subjectsDownloaded,
    topicsDownloaded,
    questionsDownloaded,
    learningDownloaded,
    downloadedTotal,
    total,
    percentage,
    startDownload,
  }
}