<script setup lang="ts">
import {
  saveQuestions,
  replaceLessonsWithLatestData,
} from "~/utils/contentSync"

const software = useSoftwareSecurity()

const token = ref("")
const loading = ref(false)
const error = ref("")
const success = ref("")

// ============================================================
// DOWNLOAD STATE
// ============================================================
const downloading = ref(false)
const downloadPhase = ref("")
const downloadError = ref("")
const downloadPercentage = ref(0)

const downloadedSubjects = ref(0)
const downloadedTopics = ref(0)
const downloadedQuestions = ref(0)
const downloadedLearning = ref(0)
const downloadTotal = ref(0)

const manifestSubjects = ref(0)
const manifestTopics = ref(0)
const manifestQuestions = ref(0)
const manifestLearning = ref(0)

// ============================================================
// API HELPER
// useApiFetch never throws, so this turns a failed result into
// an Error and returns the server's JSON body.
// ============================================================
async function api<T = any>(
  path: string,
  options: Record<string, any> = {}
): Promise<T> {
  const res = await useApiFetch<T>(path, options as any)

  if (!res.success) {
    throw new Error(res.message || "Request failed.")
  }

  return res.data as T
}

// ============================================================
// ACTIVATE SOFTWARE
// ============================================================
async function activate() {
  if (loading.value || downloading.value) return

  error.value = ""
  success.value = ""
  downloadError.value = ""

  const cleanToken = token.value.trim().toUpperCase()

  if (!cleanToken) {
    error.value = "Please enter your activation token."
    return
  }

  loading.value = true

  try {
    // STEP 1: activate software
    await software.activate(cleanToken)
    success.value = "Software activated successfully."

    // STEP 2: download content
    await downloadContent(cleanToken)

    success.value =
      "Abanise CBT has been activated and all content has been downloaded."

    // await navigateTo("/")
  } catch (err: any) {
    console.error("Activation/download error:", err)
    error.value = err?.data?.message || err?.message || "Activation failed."
  } finally {
    loading.value = false
  }
}

// ============================================================
// DOWNLOAD ONE PAGED LIST (questions, lessons)
// ============================================================
async function downloadPaged(
  path: string,
  activationToken: string,
  batchSize: number,
  save: ((items: any[]) => Promise<unknown>) | null,
  onSaved: (totalSoFar: number) => void,
  onPage?: (items: any[]) => void
) {
  let cursor = ""
  let total = 0

  while (true) {
    const body = await api(path, {
      query: {
        token: activationToken,
        limit: batchSize,
        ...(cursor ? { cursor } : {}),
      },
    })

    const page = body?.data || {}
    const items = page.items

    if (!Array.isArray(items) || items.length === 0) break

    if (onPage) {
      onPage(items)
    }

    if (save) {
      const saved = await save(items)
      total += typeof saved === "number" ? saved : items.length
      onSaved(total)
    }
    updateDownloadPercentage()

    const nextCursor = page.nextCursor ? String(page.nextCursor) : ""

    // Stop on the last page, and never loop on the same cursor
    if (!nextCursor || nextCursor === cursor) break
    cursor = nextCursor
  }

  return total
}

// ============================================================
// DOWNLOAD CONTENT
// ============================================================
async function downloadContent(activationToken: string) {
  downloading.value = true
  downloadError.value = ""
  downloadPhase.value = "Connecting to Abanise server..."
  downloadPercentage.value = 0

  downloadedSubjects.value = 0
  downloadedTopics.value = 0
  downloadedQuestions.value = 0
  downloadedLearning.value = 0

  manifestSubjects.value = 0
  manifestTopics.value = 0
  manifestQuestions.value = 0
  manifestLearning.value = 0

  try {
    // STEP 1: start download and read the manifest
    downloadPhase.value = "Verifying activation token..."

    const startData = await api("/api/content/download/start", {
      method: "POST",
      body: { token: activationToken },
    })

    const content = startData?.data?.content

    if (!content) {
      throw new Error("Server did not return content manifest.")
    }

    manifestSubjects.value = Number(content.subjects || 0)
    manifestTopics.value = Number(content.topics || 0)
    manifestQuestions.value = Number(content.questions || 0)
    manifestLearning.value = Number(content.learning || 0)
    downloadTotal.value = Number(content.total || 0)

    const batchSize = Number(
      content.batchSize || startData?.data?.batchSize || 500
    )

    // STEP 2: subjects
    downloadPhase.value = "Downloading subjects..."

    const subjectsData = await api("/api/content/download/subjects", {
      query: { token: activationToken },
    })
    const subjects = subjectsData?.data?.items || []

    if (!Array.isArray(subjects)) {
      throw new Error("Subjects response is not an array.")
    }

    downloadedSubjects.value = subjects.length
    updateDownloadPercentage()

    // STEP 3: topics
    downloadPhase.value = "Downloading topics..."

    const topicsData = await api("/api/content/download/topics", {
      query: { token: activationToken },
    })
    const topics = topicsData?.data?.items || []

    if (!Array.isArray(topics)) {
      throw new Error("Topics response is not an array.")
    }

    downloadedTopics.value = topics.length
    updateDownloadPercentage()

    // STEP 4: questions (paged)
    downloadPhase.value = "Downloading past questions..."

    await downloadPaged(
      "/api/content/download/questions",
      activationToken,
      batchSize,
      saveQuestions,
      (n) => (downloadedQuestions.value = n)
    )

    // STEP 5: lessons (paged)
    downloadPhase.value = "Downloading lessons..."

    const allLessons: any[] = []
    await downloadPaged(
      "/api/content/download/learning",
      activationToken,
      batchSize,
      null,
      (n) => (downloadedLearning.value = n),
      (items) => {
        allLessons.push(...items)
      }
    )

    await replaceLessonsWithLatestData({
      subjects,
      topics,
      lessons: allLessons,
    })
    downloadedLearning.value = allLessons.length
    updateDownloadPercentage()

    // COMPLETE
    downloadPhase.value = "Download complete"
    downloadPercentage.value = 100
  } catch (err: any) {
    console.error("Content download error:", err)
    downloadError.value = err?.message || "Content download failed."
    throw err
  } finally {
    downloading.value = false
  }
}

// ============================================================
// UPDATE PROGRESS
// ============================================================
function updateDownloadPercentage() {
  const total = Number(downloadTotal.value || 0)
  if (!total) return

  const downloaded =
    downloadedSubjects.value +
    downloadedTopics.value +
    downloadedQuestions.value +
    downloadedLearning.value

  downloadPercentage.value = Math.min(99, Math.round((downloaded / total) * 100))
}
</script>