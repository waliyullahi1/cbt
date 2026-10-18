// ============================================================
// TYPES
// ============================================================

export interface DownloadManifest {
  subjects: number
  topics: number
  questions: number
  learning: number
  total: number

  batchSize?: number
  version?: string
}

export interface DownloadProgress {
  phase:
    | "starting"
    | "subjects"
    | "topics"
    | "learning"
    | "questions"
    | "completed"
    | "error"

  subjects: number
  topics: number
  questions: number
  learning: number

  total: number

  message?: string
}

export interface PagedResult<T = any> {
  items: T[]
  nextCursor?: string | null
}

// ============================================================
// API URL
// ============================================================

function getApiUrl() {
  const config = useRuntimeConfig()

  return String(config.public.apiUrl || "").replace(/\/$/, "")
}

// ============================================================
// GENERIC FETCH
// ============================================================

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = getApiUrl()

  if (!baseUrl) {
    throw new Error(
      "API URL is empty. Set config.public.apiUrl (for example http://localhost:5000) in nuxt.config.ts or .env."
    )
  }

  const url = `${baseUrl}${path}`

  console.log("🌐 Content request:", url.replace(/token=[^&]+/, "token=***"))

  let response: Response

  try {
    response = await fetch(url, {
      ...options,

      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    })
  } catch (networkError: any) {
    // fetch only throws when the request never reached the server
    // (server off, wrong URL/port, CORS blocked, or Tauri network block)
    throw new Error(
      `Cannot reach the server at ${baseUrl}. ${networkError?.message || networkError}`
    )
  }

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`HTTP ${response.status} from ${path}: ${text}`)
  }

  return await response.json()
}

// ============================================================
// START DOWNLOAD
// ============================================================

export async function startContentDownload(token: string) {
  if (!token?.trim()) {
    throw new Error("Activation token is required")
  }

  return await apiFetch<{
    success: boolean
    data: DownloadManifest
    message?: string
  }>("/api/content/download/start", {
    method: "POST",
    body: JSON.stringify({ token: token.trim() }),
  })
}

// ============================================================
// SUBJECTS AND TOPICS
// ============================================================

export async function fetchSubjects(token: string) {
  return await apiFetch<any>(
    `/api/content/download/subjects?token=${encodeURIComponent(token)}`
  )
}

export async function fetchTopics(token: string) {
  return await apiFetch<any>(
    `/api/content/download/topics?token=${encodeURIComponent(token)}`
  )
}

// ============================================================
// PAGED ENDPOINTS (questions, learning)
// ============================================================

function buildPagedPath(
  endpoint: "questions" | "learning",
  token: string,
  limit: number,
  cursor: string
) {
  const params = new URLSearchParams()

  params.set("token", token)
  params.set("limit", String(limit))

  if (cursor) {
    params.set("cursor", cursor)
  }

  return `/api/content/download/${endpoint}?${params.toString()}`
}

export async function fetchQuestions(
  token: string,
  limit = 500,
  cursor = ""
) {
  return await apiFetch<any>(buildPagedPath("questions", token, limit, cursor))
}

export async function fetchLearning(
  token: string,
  limit = 500,
  cursor = ""
) {
  return await apiFetch<any>(buildPagedPath("learning", token, limit, cursor))
}

// ============================================================
// DOWNLOAD EVERY PAGE (pipelined)
// ============================================================
// While one page is being processed (saved to the database),
// the next page is already downloading. The network never
// waits for the database.
//
// onPage may be async. The next page is requested before
// onPage runs.
// ============================================================

export async function downloadAllPages(
  endpoint: "questions" | "learning",
  token: string,
  limit: number,
  onPage: (items: any[], totalSoFar: number) => Promise<void> | void
): Promise<number> {
  const fetchPage = (cursor: string) =>
    apiFetch<any>(buildPagedPath(endpoint, token, limit, cursor))

  let cursor = ""
  let total = 0
  let pending: Promise<any> | null = fetchPage(cursor)

  while (pending) {
    const body = await pending
    pending = null

    const page: PagedResult = body?.data || {}
    const items = page.items

    if (!Array.isArray(items) || items.length === 0) break

    const nextCursor = page.nextCursor ? String(page.nextCursor) : ""

    // Never loop on the same cursor
    if (nextCursor && nextCursor !== cursor) {
      pending = fetchPage(nextCursor)
      // Avoid an unhandled rejection if onPage fails first
      pending.catch(() => {})
    }

    total += items.length
    await onPage(items, total)

    cursor = nextCursor
  }

  return total
}