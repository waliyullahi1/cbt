export type CbtBlock = {
  id: string
  type: "heading" | "paragraph" | "instruction" | "image" | "question" | "answer" | "table"
  text?: string
  title?: string
  accesscode?: string
  src?: string
  alt?: string
  caption?: string
  headers?: string[]
  rows?: (string | number)[][]
  options?: string[]
  answer?: string | number | string[]
  explanation?: string
  marks?: number
  questionType?: "objective" | "theory"
}

export type CbtSection = {
  id: string
  name: string
  blocks: CbtBlock[]
}

export type CbtSubject = {
  id: string
  name: string
  code: string
  accesscode: string
  board?: "WAEC" | "NECO" | "NABTEB" | "JAMB" | "Custom"
  year: string
  paper?: string
  durationMinutes?: number
  instructions?: string
  examType: "objective" | "practical" | "mixed"
  sections: CbtSection[]
}

export type CbtCurriculum = {
  version: number
  subjects: CbtSubject[]
}

export type CbtPaperSummary = Pick<
  CbtSubject,
  | "id"
  | "name"
  | "code"
  | "board"
  | "year"
  | "paper"
  | "durationMinutes"
  | "examType"
  | "accesscode"
> & {
  paperId: string
  questionCount: number
  updatedAt?: string
}

/* --------------------------------------------------
 * Shared request helper
 * -------------------------------------------------- */

type ApiBody<T> = {
  success: boolean
  message?: string
  data: T
}

type FetchOptions = Parameters<typeof useApiFetch>[1]

/**
 * useApiFetch never throws: it returns { success, data, message, status, error }.
 * Our pages use try/catch, so this wrapper:
 *   - throws when the request failed (keeping the server message, status and body)
 *   - returns the server body { success, message, data } when it worked
 */
async function cbtRequest<T>(path: string, options: FetchOptions = {}): Promise<ApiBody<T>> {
  const res = await useApiFetch<ApiBody<T>>(path, options)

  if (!res.success || !res.data) {
    const err: any = new Error(res.message || "Request failed")
    err.status = res.status
    err.data = (res.error as any)?.data // server body, e.g. { success: false, message }
    throw err
  }

  return res.data
}

/* --------------------------------------------------
 * Endpoints
 * -------------------------------------------------- */

export async function getCbtCurriculum() {
  const body = await cbtRequest<CbtCurriculum>("/api/cbt/admin/subjects")
  return body.data
}

export async function getCbtSubjects() {
  const body = await cbtRequest<CbtPaperSummary[]>("/api/cbt/subjects")
  return body.data
}

export async function getCbtSubject(id: string) {
  if (!id.trim()) throw new Error("Exam paper id is required.")

  const body = await cbtRequest<CbtSubject>(
    `/api/cbt/subjects/${encodeURIComponent(id)}`
  )
  return body.data
}

export async function getCbtSubjectByAccessCode(code: string) {
  const clean = code.trim().toUpperCase()
  if (!clean) throw new Error("Enter the access code.")

  const body = await cbtRequest<CbtSubject>(
    `/api/cbt/subjects/access/${encodeURIComponent(clean)}`
  )
  return body.data
}

export async function updateCbtSubject(id: string, subject: CbtSubject) {
  if (!id.trim()) throw new Error("Exam paper id is required.")

  return await cbtRequest<CbtSubject>(
    `/api/cbt/subjects/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      body: { subject },
    }
  )
}

export async function deleteCbtSubject(id: string) {
  if (!id.trim()) throw new Error("Exam paper id is required.")

  return await cbtRequest<null>(
    `/api/cbt/subjects/${encodeURIComponent(id)}`,
    { method: "DELETE" }
  )
}

export async function uploadCbtImage(file: File) {
  const form = new FormData()
  form.append("image", file)

  return await cbtRequest<{ src: string; publicId: string }>(
    "/api/cbt/images",
    { method: "POST", body: form }
  )
}

export async function submitCbtAttempt(
  paperId: string,
  answers: Record<string, string | string[]>
) {
  return await cbtRequest<{
    id: string
    paperId: string
    score: number
    possible: number
    percentage: number
    submittedAt: string
  }>("/api/cbt/attempt", {
    method: "POST",
    body: { paperId, answers },
  })
}