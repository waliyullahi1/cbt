import {
  getQuestionsDB,
  getLessonsDB,
} from "./databases"
import { scoreLessonForSelfStudy } from "./lessonTeachingScore"
import platform from "~/platforms"

// ============================================================
// SETTINGS
// ============================================================

// Change this if your backend uses a different English subject id
// (for example "use-of-english").
const ENGLISH_SUBJECT_ID = "english-language"
const ENGLISH_ALIASES = ["english", "english language", "english-language"]

// 24 columns x 1000 rows = 24,000 variables (SQLite limit is 32,766).
// If you ever see "too many SQL variables", lower this to 200.
const QUESTION_BATCH_SIZE = 1000

// Max rows per INSERT for subjects / topics / lessons.
const MAX_ROWS_PER_INSERT = 500
const MAX_VARIABLES_PER_STATEMENT = 30000

const SUBJECT_COLUMNS = ["id", "name", "icon", "description", "order_index"]
const TOPIC_COLUMNS = ["id", "subject_id", "topic_number", "title", "order_index"]
const LESSON_COLUMNS = [
  "id",
  "topic_id",
  "subject_id",
  "topic_number",
  "slug",
  "title",
  "summary",
  "blocks",
  "search_text",
  "order_index",
  "teaching_score",
  "teaching_level",
  "teaching_feedback",
]

// ============================================================
// SAVE LOCK (one queue per database)
// ============================================================
// Writes to the SAME database run one at a time. Writes to
// DIFFERENT databases (questions.db vs lessons.db) run in
// parallel, which makes the download much faster.
// ============================================================

type DbKey = "questions" | "lessons"

const saveQueues = new Map<DbKey, Promise<any>>()

function errorMessage(error: unknown): string {
  return String(error instanceof Error ? error.message : error).toLowerCase()
}

function isDatabaseLocked(error: unknown): boolean {
  const message = errorMessage(error)

  return (
    message.includes("database is locked") ||
    message.includes("sqlite_busy") ||
    message.includes("sqlite_locked") ||
    /code: 5\b/.test(message)
  )
}

function isDatabaseReadonly(error: unknown): boolean {
  const message = errorMessage(error)

  return (
    message.includes("readonly database") ||
    message.includes("read-only") ||
    /code: 8\b/.test(message)
  )
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function retryLockedOperation<T>(
  operation: () => Promise<T>
): Promise<T> {
  const lockedDelays = [250, 500, 1000, 2000, 4000]
  const readonlyDelays = [400, 1200]
  let lockedAttempt = 0
  let readonlyAttempt = 0

  while (true) {
    try {
      return await operation()
    } catch (error) {
      if (isDatabaseReadonly(error)) {
        // A read-only error is sometimes a stale connection (the file was
        // replaced while open). The operation re-opens the DB on every try,
        // so one or two retries fix that case. If it keeps failing, the
        // file or folder itself is not writable.
        const delay = readonlyDelays[readonlyAttempt++]
        if (delay === undefined) {
          throw new Error(
            "The local database is read-only (file or folder is not writable). " +
              "Original error: " +
              errorMessage(error)
          )
        }
        console.warn(`SQLite is read-only; retrying (${readonlyAttempt}/${readonlyDelays.length})`)
        await sleep(delay)
        continue
      }

      const delay = lockedDelays[lockedAttempt++]
      if (!isDatabaseLocked(error) || delay === undefined) {
        throw error
      }

      console.warn(
        `SQLite is busy; retrying content save (${lockedAttempt}/${lockedDelays.length})`
      )
      await sleep(delay)
    }
  }
}

async function runSequentially<T>(
  key: DbKey,
  operation: () => Promise<T>
): Promise<T> {
  const previous = saveQueues.get(key) ?? Promise.resolve()

  let release!: () => void

  saveQueues.set(
    key,
    new Promise<void>((resolve) => {
      release = resolve
    })
  )

  // A failed earlier save must not block later saves.
  await previous.catch(() => {})

  try {
    const run = () => retryLockedOperation(operation)

    if (typeof navigator !== "undefined" && navigator.locks) {
      return await navigator.locks.request(
        `cbt-sqlite-content-write-${key}`,
        { mode: "exclusive" },
        run
      )
    }

    return await run()
  } finally {
    release()
  }
}

// Best-effort speed tuning. Safe to ignore if it fails.
// The content can always be downloaded again, so we trade a little
// crash-safety for a lot of write speed while syncing.
const tunedDatabases = new WeakSet<object>()

async function tuneForBulkWrite(db: any) {
  if (tunedDatabases.has(db)) return
  tunedDatabases.add(db)

  for (const pragma of ["PRAGMA synchronous = OFF", "PRAGMA temp_store = MEMORY"]) {
    try {
      await db.execute(pragma)
    } catch {
      // ignore
    }
  }
}

// ============================================================
// HELPERS
// ============================================================

function normalizeId(value: any): string {
  if (value === null || value === undefined) {
    return ""
  }

  if (typeof value === "object") {
    if (value.$oid) {
      return String(value.$oid).trim()
    }

    if (typeof value.toString === "function") {
      const result = value.toString()
      return result === "[object Object]" ? "" : result.trim()
    }
  }

  return String(value).trim()
}

function normalizeQuestionSubject(value: unknown): unknown {
  if (typeof value !== "string") {
    return value
  }

  const normalized = value.trim().toLowerCase()
  return ENGLISH_ALIASES.includes(normalized) ? ENGLISH_SUBJECT_ID : value
}

function getId(item: any): string {
  return normalizeId(item?.id ?? item?._id)
}

function getSubjectRecordId(item: any): string {
  return normalizeId(
    item?.subjectId ?? item?.subject_id ?? item?._id ?? item?.id
  )
}

function getTopicRecordId(item: any): string {
  return normalizeId(
    item?.topicId ?? item?.topic_id ?? item?._id ?? item?.id
  )
}

function getLessonRecordId(item: any): string {
  return normalizeId(
    item?.lessonId ?? item?.lesson_id ?? item?._id ?? item?.id
  )
}

function getSubjectId(item: any): string {
  const value =
    item?.subject_id ??
    item?.subjectId ??
    item?.subject?.subjectId ??
    item?.subject?._id ??
    item?.subject?.id ??
    (typeof item?.subject === "string" ? item.subject : "")

  return normalizeId(value)
}

function getTopicId(item: any): string {
  const value =
    item?.topic_id ??
    item?.topicId ??
    item?.topic?.topicId ??
    item?.topic?._id ??
    item?.topic?.id ??
    (typeof item?.topic === "string" ? item.topic : "")

  return normalizeId(value)
}

function cleanText(value: any): string | null {
  if (value === null || value === undefined) {
    return null
  }

  const text = String(value).trim()
  return text || null
}

function cleanOrderIndex(value: any): number {
  const orderIndex = Number(value ?? 0)
  return Number.isFinite(orderIndex) ? orderIndex : 0
}

function serializeBlocks(value: any): string {
  if (value === null || value === undefined || value === "") {
    return "[]"
  }

  if (typeof value === "string") {
    try {
      return JSON.stringify(JSON.parse(value))
    } catch {
      return JSON.stringify([value])
    }
  }

  return JSON.stringify(value)
}

function chunk<T>(items: T[], size: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size))
  }
  return result
}

async function rollbackQuietly(db: any) {
  try {
    await db.execute("ROLLBACK")
  } catch {
    // SQLite may already have rolled back; keep the original error.
  }
}

// ============================================================
// ROW BUILDERS
// ============================================================

function buildSubjectRow(subject: any): any[] | null {
  const id = getSubjectRecordId(subject)
  const name = cleanText(subject?.name ?? subject?.title ?? subject?.subject)

  if (!id || !name) {
    return null
  }

  return [
    id,
    name,
    cleanText(subject?.icon),
    cleanText(subject?.description),
    cleanOrderIndex(subject?.order_index ?? subject?.orderIndex),
  ]
}

function buildTopicRow(topic: any): any[] | null {
  const id = getTopicRecordId(topic)
  const subjectId = getSubjectId(topic)
  const title = cleanText(topic?.title ?? topic?.name)

  if (!id || !subjectId || !title) {
    return null
  }

  return [
    id,
    subjectId,
    topic?.topic_number ?? topic?.topicNumber ?? null,
    title,
    cleanOrderIndex(topic?.order_index ?? topic?.orderIndex),
  ]
}

function buildLessonRow(
  lesson: any,
  resolveSubjectId: (topicId: string, subjectId: string) => string | null
): any[] | null {
  const id = getLessonRecordId(lesson)
  const topicId = getTopicId(lesson)
  const title = cleanText(lesson?.title ?? lesson?.name)
  const slug = cleanText(lesson?.slug)

  if (!id || !topicId || !title || !slug) {
    return null
  }

  const resolvedSubjectId = resolveSubjectId(topicId, getSubjectId(lesson))
  if (!resolvedSubjectId) {
    return null
  }

  const summary = cleanText(lesson?.summary)
  const blocks = serializeBlocks(lesson?.blocks)
  const teachingScore = scoreLessonForSelfStudy(title, summary, blocks)
  const searchText = cleanText(lesson?.search_text ?? lesson?.searchText)

  return [
    id,
    topicId,
    resolvedSubjectId,
    lesson?.topic_number ?? lesson?.topicNumber ?? null,
    slug,
    title,
    summary,
    blocks,
    searchText,
    cleanOrderIndex(lesson?.order_index ?? lesson?.orderIndex),
    teachingScore.score,
    teachingScore.level,
    JSON.stringify(teachingScore.feedback),
  ]
}

// ============================================================
// BATCH WRITERS
// ============================================================

async function executeRowsInBatches(
  db: any,
  tableName: string,
  columns: string[],
  rows: any[][]
): Promise<void> {
  if (rows.length === 0) return

  const batchSize = Math.max(
    1,
    Math.min(
      MAX_ROWS_PER_INSERT,
      Math.floor(MAX_VARIABLES_PER_STATEMENT / columns.length)
    )
  )
  const rowPlaceholder = `(${columns.map(() => "?").join(", ")})`
  const updates = columns
    .filter((column) => column !== "id")
    .map((column) => `${column} = excluded.${column}`)
    .join(", ")

  for (const batch of chunk(rows, batchSize)) {
    const placeholders = batch.map(() => rowPlaceholder).join(", ")

    await db.execute(
      `
      INSERT INTO ${tableName} (${columns.join(", ")})
      VALUES ${placeholders}
      ON CONFLICT(id) DO UPDATE SET ${updates}
      `,
      batch.flat()
    )
  }
}

async function deleteIds(db: any, tableName: string, ids: string[]) {
  for (const batch of chunk(ids, 500)) {
    await db.execute(
      `DELETE FROM ${tableName} WHERE id IN (${batch.map(() => "?").join(", ")})`,
      batch
    )
  }
}

async function selectIds(db: any, sql: string): Promise<Set<string>> {
  const rows = await db.select(sql) as { id: string }[]
  return new Set(rows.map((row) => normalizeId(row.id)))
}

function isLessonSlugConflict(error: unknown): boolean {
  return errorMessage(error).includes("lessons.slug")
}

async function saveLessonRows(
  db: any,
  columns: string[],
  rows: any[][]
): Promise<{ saved: number; skipped: number }> {
  const slugIndex = columns.indexOf("slug")
  const idIndex = columns.indexOf("id")
  const uniqueRows: any[][] = []
  const seenSlugs = new Set<string>()
  let skipped = 0

  for (const row of rows) {
    const slug = normalizeId(row[slugIndex])
    if (seenSlugs.has(slug)) {
      console.warn("Lesson skipped - duplicate slug in downloaded batch:", {
        id: normalizeId(row[idIndex]),
        slug,
      })
      skipped++
      continue
    }
    seenSlugs.add(slug)
    uniqueRows.push(row)
  }

  // Fast path: one big upsert per batch.
  try {
    await executeRowsInBatches(db, "lessons", columns, uniqueRows)
    return { saved: uniqueRows.length, skipped }
  } catch (error) {
    if (!isLessonSlugConflict(error)) {
      throw error
    }

    console.warn(
      "Lesson slug conflict found; resolving existing rows individually."
    )
  }

  // Slow path: only runs when an existing local slug clashes.
  const columnIndexes = new Map(columns.map((column, index) => [column, index]))
  const indexOf = (column: string) => columnIndexes.get(column)!
  const nonIdColumns = columns.filter((column) => column !== "id")
  const assignments = nonIdColumns.map((column) => `${column} = ?`)
  let saved = 0

  for (const row of uniqueRows) {
    const id = normalizeId(row[indexOf("id")])
    const slug = normalizeId(row[indexOf("slug")])

    const existingRows = await db.select(
      "SELECT id, slug FROM lessons WHERE id = ? OR slug = ?",
      [id, slug]
    ) as { id: string; slug: string }[]

    const byId = existingRows.find((e) => normalizeId(e.id) === id)
    const bySlug = existingRows.find((e) => normalizeId(e.slug) === slug)
    const slugMatches = existingRows.filter(
      (e) => normalizeId(e.slug) === slug
    )

    if (
      slugMatches.length > 1 ||
      (byId && bySlug && normalizeId(byId.id) !== normalizeId(bySlug.id))
    ) {
      console.error(
        "Lesson skipped - ID and slug belong to different local rows:",
        { id, slug, idRow: byId, slugRow: bySlug }
      )
      skipped++
      continue
    }

    if (bySlug || byId) {
      const existingId = normalizeId((bySlug ?? byId)!.id)
      await db.execute(
        `UPDATE lessons SET id = ?, ${assignments.join(", ")} WHERE id = ?`,
        [id, ...nonIdColumns.map((column) => row[indexOf(column)]), existingId]
      )
    } else {
      await db.execute(
        `INSERT INTO lessons (${columns.join(", ")}) VALUES (${columns
          .map(() => "?")
          .join(", ")})`,
        row
      )
    }

    saved++
  }

  return { saved, skipped }
}

// ============================================================
// SEARCH INDEX (FTS)
// ============================================================
// Runs AFTER the transaction commits. A search-index problem
// must never block the content download.
//
// Uses the single "rebuild" command instead of DELETE + INSERT,
// which is what caused "database disk image is malformed"
// (code 267) on FTS tables.
// ============================================================

async function rebuildLessonSearchIndex(db: any) {
  try {
    const ftsTable = await db.select(
      `SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'lessons_fts' LIMIT 1`
    )

    if (ftsTable.length === 0) return

    await db.execute(`INSERT INTO lessons_fts(lessons_fts) VALUES('rebuild')`)
  } catch (error) {
    console.warn(
      "⚠️ Lesson search index could not be rebuilt (content was saved):",
      error
    )
  }
}

// ============================================================
// REPLACE LESSON DATASET WITH LATEST CONTENT
// ============================================================
// IMPORTANT: call this ONCE with ALL subjects, topics and lessons.
// Anything not in the payload is removed from the local database.
// ============================================================

export async function replaceLessonsWithLatestData(
  payload: {
    subjects?: any[]
    topics?: any[]
    lessons?: any[]
  } = {}
): Promise<{
  subjects: number
  topics: number
  lessons: number
}> {
  return runSequentially("lessons", async () => {
    const hasSubjects = Array.isArray(payload.subjects)
    const hasTopics = Array.isArray(payload.topics)
    const hasLessons = Array.isArray(payload.lessons)

    if (!hasSubjects && !hasTopics && !hasLessons) {
      throw new Error(
        "Lesson replacement requires at least one valid subjects, topics, or lessons array."
      )
    }

    const db = await getLessonsDB()
    await tuneForBulkWrite(db)

    const subjectRows = (payload.subjects ?? [])
      .map(buildSubjectRow)
      .filter(Boolean) as any[][]

    const topicRows = (payload.topics ?? [])
      .map(buildTopicRow)
      .filter(Boolean) as any[][]

    const topicSubjectById = new Map<string, string>(
      topicRows.map((row) => [String(row[0]), String(row[1])])
    )

    const lessonRows = (payload.lessons ?? [])
      .map((lesson) =>
        buildLessonRow(
          lesson,
          (topicId, subjectId) =>
            subjectId || topicSubjectById.get(topicId) || null
        )
      )
      .filter(Boolean) as any[][]

    const keepSubjects = new Set(subjectRows.map((row) => String(row[0])))
    const keepTopics = new Set(topicRows.map((row) => String(row[0])))
    const keepLessons = new Set(lessonRows.map((row) => String(row[0])))

    await db.execute("BEGIN TRANSACTION")

    try {
      // 1. Remove lessons that are no longer in the dataset
      const existingLessons = await selectIds(db, "SELECT id FROM lessons")
      await deleteIds(
        db,
        "lessons",
        [...existingLessons].filter((id) => !keepLessons.has(id))
      )

      // 2. Remove old topics that no remaining lesson uses
      const usedTopics = await selectIds(
        db,
        "SELECT DISTINCT topic_id AS id FROM lessons"
      )
      const existingTopics = await selectIds(db, "SELECT id FROM topics")
      await deleteIds(
        db,
        "topics",
        [...existingTopics].filter(
          (id) => !keepTopics.has(id) && !usedTopics.has(id)
        )
      )

      // 3. Remove old subjects that no remaining topic uses
      const usedSubjects = await selectIds(
        db,
        "SELECT DISTINCT subject_id AS id FROM topics"
      )
      const existingSubjects = await selectIds(db, "SELECT id FROM subjects")
      await deleteIds(
        db,
        "subjects",
        [...existingSubjects].filter(
          (id) => !keepSubjects.has(id) && !usedSubjects.has(id)
        )
      )

      // 4. Insert / update in dependency order
      await executeRowsInBatches(db, "subjects", SUBJECT_COLUMNS, subjectRows)
      await executeRowsInBatches(db, "topics", TOPIC_COLUMNS, topicRows)

      if (lessonRows.length > 0) {
        await saveLessonRows(db, LESSON_COLUMNS, lessonRows)
      }

      await db.execute("COMMIT")
    } catch (error) {
      await rollbackQuietly(db)
      console.error("❌ LESSON DATASET REPLACEMENT FAILED:", error)
      throw error
    }

    await rebuildLessonSearchIndex(db)

    return {
      subjects: subjectRows.length,
      topics: topicRows.length,
      lessons: lessonRows.length,
    }
  })
}

// ============================================================
// SAVE SUBJECTS
// ============================================================

export async function saveSubjects(subjects: any[]) {
  return runSequentially("lessons", async () => {
    if (!Array.isArray(subjects) || subjects.length === 0) {
      console.warn("⚠️ No subjects received")
      return 0
    }

    const db = await getLessonsDB()
    const rows = subjects.map(buildSubjectRow).filter(Boolean) as any[][]

    try {
      await executeRowsInBatches(db, "subjects", SUBJECT_COLUMNS, rows)
      console.log(
        `✅ SUBJECTS SAVED: ${rows.length}/${subjects.length} (skipped ${subjects.length - rows.length})`
      )
      return rows.length
    } catch (error) {
      console.error("❌ SUBJECT SAVE ERROR:", error)
      throw error
    }
  })
}

// ============================================================
// SAVE TOPICS
// ============================================================
// Subjects must already exist before topics are inserted.
// ============================================================

export async function saveTopics(topics: any[]) {
  return runSequentially("lessons", async () => {
    if (!Array.isArray(topics) || topics.length === 0) {
      console.warn("⚠️ No topics received")
      return 0
    }

    const db = await getLessonsDB()

    try {
      const subjectIds = await selectIds(db, "SELECT id FROM subjects")
      let skipped = 0
      const rows: any[][] = []

      for (const topic of topics) {
        const row = buildTopicRow(topic)

        if (!row) {
          skipped++
          continue
        }

        if (!subjectIds.has(String(row[1]))) {
          console.warn("⚠️ Topic skipped - subject does not exist in lessons.db:", {
            id: row[0],
            subjectId: row[1],
          })
          skipped++
          continue
        }

        rows.push(row)
      }

      await executeRowsInBatches(db, "topics", TOPIC_COLUMNS, rows)
      console.log(`✅ TOPICS SAVED: ${rows.length}/${topics.length} (skipped ${skipped})`)
      return rows.length
    } catch (error) {
      console.error("❌ TOPIC SAVE ERROR:", error)
      throw error
    }
  })
}

// ============================================================
// SAVE LESSONS
// ============================================================
// topic_id is NOT NULL, so a lesson without an existing topic
// is skipped.
// ============================================================

export async function saveLearning(lessons: any[]) {
  return runSequentially("lessons", async () => {
    if (!Array.isArray(lessons) || lessons.length === 0) {
      console.warn("⚠️ No lessons received")
      return 0
    }

    const db = await getLessonsDB()

    try {
      const existingTopics = await db.select(
        "SELECT id, subject_id FROM topics"
      ) as { id: string; subject_id: string }[]
      const topicSubjects = new Map(
        existingTopics.map((topic) => [
          normalizeId(topic.id),
          normalizeId(topic.subject_id),
        ])
      )
      const subjectIds = await selectIds(db, "SELECT id FROM subjects")

      let skipped = 0
      const rows: any[][] = []

      for (const lesson of lessons) {
        const row = buildLessonRow(lesson, (topicId, subjectId) => {
          const topicSubjectId = topicSubjects.get(topicId)

          if (!topicSubjectId) return null
          if (subjectId && subjectId !== topicSubjectId) return null
          if (!subjectIds.has(topicSubjectId)) return null

          return subjectId || topicSubjectId
        })

        if (!row) {
          skipped++
          continue
        }

        rows.push(row)
      }

      const result = await saveLessonRows(db, LESSON_COLUMNS, rows)
      skipped += result.skipped

      await rebuildLessonSearchIndex(db)

      console.log(
        `✅ LESSONS SAVED: ${result.saved}/${lessons.length} (skipped ${skipped})`
      )
      return result.saved
    } catch (error) {
      console.error("❌ LESSON SAVE ERROR:", error)
      throw error
    }
  })
}

// ============================================================
// SAVE QUESTIONS
// ============================================================
// Big batches: 500 questions per INSERT (about 12,000 variables).
// No per-row logging - console.log for every row is very slow.
// ============================================================

function questionToValues(question: any): any[] {
  const explanation = question?.explanation ?? null

  return [
    getId(question),
    question?.examType ?? question?.exam_type ?? null,
    normalizeQuestionSubject(question?.subject) ?? null,
    question?.year ?? null,
    question?.section ?? null,
    question?.topic ?? null,
    question?.category ?? null,
    question?.difficulty ?? null,
    question?.question ?? null,
    explanation ? JSON.stringify(explanation) : null,
    question?.question_html ?? null,
    JSON.stringify(question?.options ?? []),
    JSON.stringify(question?.options_html ?? []),
    question?.answer ?? null,
    question?.solution ?? null,
    question?.solution_html ?? null,
    question?.imageUrl ?? question?.image_url ?? null,
    question?.hasPassage ? 1 : 0,
    question?.passage ?? null,
    question?.passage_html ?? null,
    question?.country ?? null,
    question?.institution ?? null,
    question?.state ?? null,
    question?.source ?? null,
  ]
}

const QUESTION_COLUMNS = [
  "id",
  "examType",
  "subject",
  "year",
  "section",
  "topic",
  "category",
  "difficulty",
  "question",
  "explanation",
  "question_html",
  "options",
  "options_html",
  "answer",
  "solution",
  "solution_html",
  "imageUrl",
  "hasPassage",
  "passage",
  "passage_html",
  "country",
  "institution",
  "state",
  "source",
]

export async function saveQuestions(questions: any[]) {
  return runSequentially("questions", async () => {
    if (!Array.isArray(questions) || questions.length === 0) {
      console.warn("⚠️ No questions received")
      return 0
    }

    const validQuestions = questions.filter(
      (question) => question && getId(question)
    )

    if (validQuestions.length === 0) {
      console.warn("⚠️ No valid questions to save")
      return 0
    }

    const db = await getQuestionsDB()
    await tuneForBulkWrite(db)
    const rowPlaceholder = `(${QUESTION_COLUMNS.map(() => "?").join(", ")})`
    let savedCount = 0

    try {
      for (const batch of chunk(validQuestions, QUESTION_BATCH_SIZE)) {
        await db.execute(
          `
          INSERT OR REPLACE INTO questions (${QUESTION_COLUMNS.join(", ")})
          VALUES ${batch.map(() => rowPlaceholder).join(", ")}
          `,
          batch.flatMap(questionToValues)
        )

        savedCount += batch.length
      }

      return savedCount
    } catch (error) {
      console.error("❌ QUESTION SAVE ERROR:", error)
      throw error
    }
  })
}

// ============================================================
// VERIFY LESSON DATABASE (counts only - fast)
// ============================================================

export async function verifyLessonDatabase() {
  return runSequentially("lessons", async () => {
    const db = await getLessonsDB()

    const count = async (table: string): Promise<number> => {
      const rows = await db.select(`SELECT COUNT(*) AS total FROM ${table}`) as {
        total: number
      }[]
      return Number(rows[0]?.total ?? 0)
    }

    const result = {
      subjects: await count("subjects"),
      topics: await count("topics"),
      lessons: await count("lessons"),
    }

    console.log(
      `🔎 Lesson DB -> subjects: ${result.subjects}, topics: ${result.topics}, lessons: ${result.lessons}`
    )

    return result
  })
}

// ============================================================
// VERIFY RELATIONSHIPS
// ============================================================

export async function verifyLessonRelationships() {
  return runSequentially("lessons", async () => {
    const db = await getLessonsDB()

    const brokenTopics = await db.select(
      `
      SELECT t.id, t.subject_id, t.title
      FROM topics t
      LEFT JOIN subjects s ON s.id = t.subject_id
      WHERE s.id IS NULL
      LIMIT 50
      `
    )

    const brokenLessons = await db.select(
      `
      SELECT l.id, l.topic_id, l.subject_id, l.title
      FROM lessons l
      LEFT JOIN topics t ON t.id = l.topic_id
      WHERE t.id IS NULL
      LIMIT 50
      `
    )

    const lessonsWithoutSubject = await db.select(
      `
      SELECT l.id, l.topic_id, l.subject_id, l.title
      FROM lessons l
      LEFT JOIN subjects s ON s.id = l.subject_id
      WHERE l.subject_id IS NOT NULL AND s.id IS NULL
      LIMIT 50
      `
    )

    console.log(
      `🔗 Topics without subject: ${brokenTopics.length}, lessons without topic: ${brokenLessons.length}, lessons with invalid subject: ${lessonsWithoutSubject.length}`
    )

    return { brokenTopics, brokenLessons, lessonsWithoutSubject }
  })
}

// ============================================================
// SAVE LEARNING CONTENT / QUESTIONS / EVERYTHING
// ============================================================

export async function saveLearningContent({
  subjects = [],
  topics = [],
  lessons = [],
}: {
  subjects?: any[]
  topics?: any[]
  lessons?: any[]
}) {
  return replaceLessonsWithLatestData({ subjects, topics, lessons })
}

export async function saveQuestionContent(questions: any[] = []) {
  return saveQuestions(questions)
}

// Order: subjects -> topics -> lessons, THEN questions.
export async function saveAllContent({
  subjects = [],
  topics = [],
  lessons = [],
  questions = [],
}: {
  subjects?: any[]
  topics?: any[]
  lessons?: any[]
  questions?: any[]
}) {
  const learning = await saveLearningContent({ subjects, topics, lessons })
  const questionCount = await saveQuestionContent(questions)

  const verification = await verifyLessonDatabase()
  const relationships = await verifyLessonRelationships()

  // Create the progress composable here (not at module level) so it
  // runs inside a normal app context.
  try {
    const { loadLessonProgress, pruneLessonProgress } = useLessonProgress()
    const sidebar = await platform.lesson.getSidebar()
    loadLessonProgress()
    pruneLessonProgress(sidebar)
  } catch (error) {
    console.warn("⚠️ Lesson progress cleanup skipped:", error)
  }

  return {
    subjects: learning.subjects,
    topics: learning.topics,
    lessons: learning.lessons,
    questions: questionCount,
    verification,
    relationships,
  }
}