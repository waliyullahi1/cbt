
import {
  getQuestionsDB,
  getLessonsDB,
} from "./databases"
import { scoreLessonForSelfStudy } from "./lessonTeachingScore"
const { loadLessonProgress, pruneLessonProgress } = useLessonProgress()
import  platform from "~/platforms"
// ============================================================
// GLOBAL SAVE LOCK
// ============================================================
//
// Prevents two database save operations from running at the
// same time.
//
// Example:
// saveSubjects()
// saveTopics()
//
// The second operation waits until the first one finishes.
// ============================================================

let saveQueue: Promise<any> = Promise.resolve()

function isDatabaseLocked(error: unknown): boolean {
  const message = String(
    error instanceof Error ? error.message : error
  ).toLowerCase()

  return (
    message.includes("database is locked") ||
    message.includes("sqlite_busy") ||
    message.includes("sqlite_locked") ||
    message.includes("code: 5")
  )
}

async function retryLockedOperation<T>(
  operation: () => Promise<T>
): Promise<T> {
  const delays = [250, 500, 1000, 2000, 4000, 8000]

  for (let attempt = 0; ; attempt++) {
    try {
      return await operation()
    } catch (error) {
      const delay = delays[attempt]
      if (!isDatabaseLocked(error) || delay === undefined) {
        throw error
      }

      console.warn(
        `SQLite is busy; retrying content save (${attempt + 1}/${delays.length})`
      )
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
}

async function runSequentially<T>(
  operation: () => Promise<T>
): Promise<T> {

  const previous = saveQueue

  let release!: () => void

  saveQueue = new Promise<void>((resolve) => {
    release = resolve
  })

  await previous

  try {
    const run = () => retryLockedOperation(operation)

    if (typeof navigator !== "undefined" && navigator.locks) {
      return await navigator.locks.request(
        "cbt-sqlite-content-write",
        { mode: "exclusive" },
        run
      )
    }

    return await run()
  } finally {
    release()
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
  return ["english", "english language", "english-language"].includes(normalized)
    ? "english-language"
    : value
}

function getId(item: any): string {
  return normalizeId(item?.id ?? item?._id)
}

function getSubjectRecordId(item: any): string {
  return normalizeId(
    item?.subjectId ??
    item?.subject_id ??
    item?._id ??
    item?.id
  )
}

function getTopicRecordId(item: any): string {
  return normalizeId(
    item?.topicId ??
    item?.topic_id ??
    item?._id ??
    item?.id
  )
}

function getLessonRecordId(item: any): string {
  return normalizeId(
    item?.lessonId ??
    item?.lesson_id ??
    item?._id ??
    item?.id
  )
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

async function executeRowsInBatches(
  db: any,
  tableName: string,
  columns: string[],
  rows: any[][]
): Promise<void> {
  const batchSize = Math.max(
    1,
    Math.floor(900 / columns.length)
  )
  const updateColumns = columns.filter(
    (column) => column !== "id"
  )
  const updates = updateColumns
    .map((column) => `${column} = excluded.${column}`)
    .join(", ")

  for (let offset = 0; offset < rows.length; offset += batchSize) {
    const batch = rows.slice(offset, offset + batchSize)
    const placeholders = batch
      .map(() => `(${columns.map(() => "?").join(", ")})`)
      .join(", ")

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

function isLessonSlugConflict(error: unknown): boolean {
  const message = String(
    error instanceof Error ? error.message : error
  ).toLowerCase()

  return message.includes("lessons.slug")
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
      console.warn(
        "Lesson skipped - duplicate slug in downloaded batch:",
        { id: normalizeId(row[idIndex]), slug }
      )
      skipped++
      continue
    }
    seenSlugs.add(slug)
    uniqueRows.push(row)
  }

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

  const columnIndexes = new Map(
    columns.map((column, index) => [column, index])
  )
  const indexOf = (column: string) => columnIndexes.get(column)!
  let saved = 0

  for (const row of uniqueRows) {
    const id = normalizeId(row[indexOf("id")])
    const slug = normalizeId(row[indexOf("slug")])

    const existingRows = await db.select<
      { id: string; slug: string }[]
    >(
      "SELECT id, slug FROM lessons WHERE id = ? OR slug = ?",
      [id, slug]
    )

    const byId = existingRows.find(
      (existing) => normalizeId(existing.id) === id
    )
    const bySlug = existingRows.find(
      (existing) => normalizeId(existing.slug) === slug
    )
    const slugMatches = existingRows.filter(
      (existing) => normalizeId(existing.slug) === slug
    )

    if (
      slugMatches.length > 1 ||
      (byId &&
        bySlug &&
        normalizeId(byId.id) !== normalizeId(bySlug.id))
    ) {
      console.error(
        "Lesson skipped - ID and slug belong to different local rows:",
        { id, slug, idRow: byId, slugRow: bySlug }
      )
      skipped++
      continue
    }

    const assignments = columns
      .filter((column) => column !== "id")
      .map((column) => `${column} = ?`)

    if (bySlug || byId) {
      const existingId = normalizeId((bySlug ?? byId)!.id)
      await db.execute(
        `
        UPDATE lessons
        SET id = ?, ${assignments.join(", ")}
        WHERE id = ?
        `,
        [
          id,
          ...columns
            .filter((column) => column !== "id")
            .map((column) => row[indexOf(column)]),
          existingId
        ]
      )
    } else {
      await db.execute(
        `
        INSERT INTO lessons (${columns.join(", ")})
        VALUES (${columns.map(() => "?").join(", ")})
        `,
        row
      )
    }

    saved++
  }

  return { saved, skipped }
}


function getSubjectId(item: any): string {

  const value =
    item?.subject_id ??
    item?.subjectId ??
    item?.subject?.subjectId ??
    item?.subject?._id ??
    item?.subject?.id ??
    (
      typeof item?.subject === "string"
        ? item.subject
        : ""
    )

  return normalizeId(value)
}


function getTopicId(item: any): string {

  const value =
    item?.topic_id ??
    item?.topicId ??
    item?.topic?.topicId ??
    item?.topic?._id ??
    item?.topic?.id ??
    (
      typeof item?.topic === "string"
        ? item.topic
        : ""
    )

  return normalizeId(value)
}


// ============================================================
// REPLACE LESSON DATASET WITH LATEST CONTENT
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
  return runSequentially(async () => {
    const hasSubjects = Array.isArray(payload.subjects)
    const hasTopics = Array.isArray(payload.topics)
    const hasLessons = Array.isArray(payload.lessons)

    if (!hasSubjects && !hasTopics && !hasLessons) {
      throw new Error(
        "Lesson replacement requires at least one valid subjects, topics, or lessons array."
      )
    }

    const subjects = hasSubjects ? payload.subjects! : []
    const topics = hasTopics ? payload.topics! : []
    const lessons = hasLessons ? payload.lessons! : []

    const db = await getLessonsDB()

    const subjectRows = subjects
      .map((subject: any) => {
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
      })
      .filter(Boolean) as any[][]

    const topicRows = topics
      .map((topic: any) => {
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
      })
      .filter(Boolean) as any[][]

    const lessonRows = lessons
      .map((lesson: any) => {
        const id = getLessonRecordId(lesson)
        const topicId = getTopicId(lesson)
        const subjectId = getSubjectId(lesson)
        const title = cleanText(lesson?.title ?? lesson?.name)
        const slug = cleanText(lesson?.slug)

        if (!id || !topicId || !title || !slug) {
          return null
        }

        const topicSubjectId = topicRows.find((row) => row[0] === topicId)?.[1]
        const resolvedSubjectId = subjectId || topicSubjectId || null

        if (!resolvedSubjectId) {
          return null
        }

        const summary = cleanText(lesson?.summary)
        const blocks = serializeBlocks(lesson?.blocks)
        const teachingScore = scoreLessonForSelfStudy(
          title,
          summary,
          blocks
        )
        const searchText = cleanText(
          lesson?.search_text ??
          lesson?.searchText
        )

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
      })
      .filter(Boolean) as any[][]

    const subjectIds = subjectRows.map((row) => row[0])
    const topicIds = topicRows.map((row) => row[0])
    const lessonIds = lessonRows.map((row) => row[0])

    await db.execute("BEGIN TRANSACTION")

    try {
      if (lessonIds.length > 0) {
        await db.execute(
          `DELETE FROM lessons WHERE id NOT IN (${lessonIds.map(() => "?").join(", ")})`,
          lessonIds
        )
      } else {
        await db.execute("DELETE FROM lessons")
      }

      if (topicIds.length > 0) {
        await db.execute(
          `DELETE FROM topics WHERE id NOT IN (${topicIds.map(() => "?").join(", ")}) AND id NOT IN (SELECT DISTINCT topic_id FROM lessons)`,
          topicIds
        )
      } else {
        await db.execute("DELETE FROM topics WHERE id NOT IN (SELECT DISTINCT topic_id FROM lessons)")
      }

      if (subjectIds.length > 0) {
        await db.execute(
          `DELETE FROM subjects WHERE id NOT IN (${subjectIds.map(() => "?").join(", ")}) AND id NOT IN (SELECT DISTINCT subject_id FROM topics)`,
          subjectIds
        )
      } else {
        await db.execute("DELETE FROM subjects WHERE id NOT IN (SELECT DISTINCT subject_id FROM topics)")
      }

      if (subjectRows.length > 0) {
        await executeRowsInBatches(
          db,
          "subjects",
          ["id", "name", "icon", "description", "order_index"],
          subjectRows
        )
      }

      if (topicRows.length > 0) {
        await executeRowsInBatches(
          db,
          "topics",
          ["id", "subject_id", "topic_number", "title", "order_index"],
          topicRows
        )
      }

      if (lessonRows.length > 0) {
        await saveLessonRows(db, [
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
        ], lessonRows)
      }

      const ftsTable = await db.select(
        `SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'lessons_fts' LIMIT 1`
      )

      if (ftsTable.length > 0) {
        await db.execute("DELETE FROM lessons_fts")
        await db.execute(`
          INSERT INTO lessons_fts (
            rowid,
            title,
            summary,
            search_text
          )
          SELECT rowid, title, summary, search_text
          FROM lessons
        `)
      }

      await db.execute("COMMIT")

      return {
        subjects: subjectRows.length,
        topics: topicRows.length,
        lessons: lessonRows.length,
      }
    } catch (error) {
      await db.execute("ROLLBACK")
      console.error("❌ LESSON DATASET REPLACEMENT FAILED:", error)
      throw error
    }
  })
}

// ============================================================
// SAVE SUBJECTS
// ============================================================
// lessons.db
//
// TABLE:
//
// subjects
//   id
//   name
//   icon
//   description
//   order_index
// ============================================================

export async function saveSubjects(
  subjects: any[]
) {

  return runSequentially(
    async () => {

      if (
        !Array.isArray(subjects) ||
        subjects.length === 0
      ) {

        console.warn(
          "⚠️ No subjects received"
        )

        return 0
      }


      const db =
        await getLessonsDB()


      console.log("")
      console.log("========================================")
      console.log("📚 SAVING SUBJECTS")
      console.log("========================================")
      console.log(
        `📦 Received: ${subjects.length}`
      )


      let savedCount = 0
      let skippedCount = 0
      const rows: any[][] = []


      try {

        for (
          const subject of subjects
        ) {

          // ==================================================
          // Stable backend identifier (subjectId) with legacy fallbacks.
          // ==================================================

          const id =
            getSubjectRecordId(subject)


          if (!id) {

            console.warn(
              "⚠️ Subject skipped - missing backend subject ID:",
              subject
            )

            skippedCount++

            continue
          }


          // ==================================================
          // NAME
          // ==================================================

          const name =
            subject?.name ??
            subject?.title ??
            subject?.subject ??
            ""

          const cleanName = cleanText(name)
          if (!cleanName) {

            console.warn(
              "⚠️ Subject skipped - missing name:",
              id
            )

            skippedCount++

            continue
          }


          // ==================================================
          // OTHER FIELDS
          // ==================================================

          const icon =
            cleanText(subject?.icon)


          const description =
            cleanText(subject?.description)


          const orderIndex = cleanOrderIndex(
            subject?.order_index ??
            subject?.orderIndex
          )


          // ==================================================
          // SAVE
          // ==================================================

          rows.push([
            id,
            cleanName,
            icon,
            description,
            orderIndex
          ])

          console.log(
            `📚 Subject saved: ${cleanName} [${id}]`
          )
        }

        await executeRowsInBatches(
          db,
          "subjects",
          ["id", "name", "icon", "description", "order_index"],
          rows
        )
        savedCount = rows.length


        console.log(
          `✅ SUBJECTS SAVED: ${savedCount}/${subjects.length}`
        )

        console.log(
          `⚠️ SUBJECTS SKIPPED: ${skippedCount}`
        )


        return savedCount


      } catch (error) {

        console.error(
          "❌ SUBJECT SAVE ERROR:",
          error
        )


        throw error
      }
    }
  )
}


// ============================================================
// SAVE TOPICS
// ============================================================
// lessons.db
//
// TABLE:
//
// topics
//   id
//   subject_id
//   topic_number
//   title
//   order_index
//
// IMPORTANT:
//
// subject must already exist before topic is inserted.
// ============================================================

export async function saveTopics(
  topics: any[]
) {

  return runSequentially(
    async () => {

      if (
        !Array.isArray(topics) ||
        topics.length === 0
      ) {

        console.warn(
          "⚠️ No topics received"
        )

        return 0
      }


      const db =
        await getLessonsDB()


      console.log("")
      console.log("========================================")
      console.log("📑 SAVING TOPICS")
      console.log("========================================")
      console.log(
        `📦 Received: ${topics.length}`
      )


      let savedCount = 0
      let skippedCount = 0
      const rows: any[][] = []


      try {
        const existingSubjects = await db.select<
          { id: string }[]
        >("SELECT id FROM subjects")
        const subjectIds = new Set(
          existingSubjects.map((subject) => normalizeId(subject.id))
        )

        for (
          const topic of topics
        ) {

          const id =
            getTopicRecordId(topic)


          if (!id) {

            console.warn(
              "⚠️ Topic skipped - missing ID:",
              topic
            )

            skippedCount++

            continue
          }


          const subjectId =
            getSubjectId(topic)


          if (!subjectId) {

            console.warn(
              "⚠️ Topic skipped - missing subject_id:",
              {
                id,
                title: topic?.title
              }
            )

            skippedCount++

            continue
          }

          if (!subjectIds.has(subjectId)) {
            console.warn(
              "⚠️ Topic skipped - subject does not exist in lessons.db:",
              { id, subjectId }
            )
            skippedCount++
            continue
          }


          const title =
            topic?.title ??
            topic?.name ??
            ""

          const cleanTitle = cleanText(title)
          if (!cleanTitle) {

            console.warn(
              "⚠️ Topic skipped - missing title:",
              id
            )

            skippedCount++

            continue
          }


          const topicNumber =
            topic?.topic_number ??
            topic?.topicNumber ??
            null


          const orderIndex = cleanOrderIndex(
            topic?.order_index ??
            topic?.orderIndex
          )


          rows.push([
            id,
            subjectId,
            topicNumber,
            cleanTitle,
            orderIndex
          ])


          console.log(
            `📑 Topic saved: ${cleanTitle}`
          )
        }


        await executeRowsInBatches(
          db,
          "topics",
          ["id", "subject_id", "topic_number", "title", "order_index"],
          rows
        )
        savedCount = rows.length


        console.log("")
        console.log(
          `✅ TOPICS SAVED: ${savedCount}/${topics.length}`
        )

        console.log(
          `⚠️ TOPICS SKIPPED: ${skippedCount}`
        )


        return savedCount


      } catch (error) {

        console.error(
          "❌ TOPIC SAVE ERROR:",
          error
        )


        throw error
      }
    }
  )
}


// ============================================================
// SAVE LESSONS
// ============================================================
// lessons.db
//
// TABLE:
//
// lessons
//   id
//   topic_id
//   subject_id
//   topic_number
//   slug
//   title
//   summary
//   blocks
//   search_text
//   order_index
//
// IMPORTANT:
//
// topic_id is NOT NULL.
//
// Therefore we refuse to insert a lesson without a topic.
// ============================================================

export async function saveLearning(
  lessons: any[]
) {

  return runSequentially(
    async () => {

      if (
        !Array.isArray(lessons) ||
        lessons.length === 0
      ) {

        console.warn(
          "⚠️ No lessons received"
        )

        return 0
      }


      const db =
        await getLessonsDB()


      console.log("")
      console.log("========================================")
      console.log("📖 SAVING LESSONS")
      console.log("========================================")
      console.log(
        `📦 Received: ${lessons.length}`
      )


      let savedCount = 0
      let skippedCount = 0
      const rows: any[][] = []


      try {
        const existingTopics = await db.select<
          { id: string; subject_id: string }[]
        >("SELECT id, subject_id FROM topics")
        const topicSubjects = new Map(
          existingTopics.map((topic) => [
            normalizeId(topic.id),
            normalizeId(topic.subject_id)
          ])
        )
        const existingSubjects = await db.select<
          { id: string }[]
        >("SELECT id FROM subjects")
        const subjectIds = new Set(
          existingSubjects.map((subject) => normalizeId(subject.id))
        )


        for (
          const lesson of lessons
        ) {

          // ----------------------------------------------------
          // ID
          // ----------------------------------------------------

          const id =
            getLessonRecordId(lesson)


          if (!id) {

            console.warn(
              "⚠️ Lesson skipped - missing ID:",
              lesson
            )

            skippedCount++

            continue
          }


          // ----------------------------------------------------
          // TOPIC ID
          // ----------------------------------------------------

          const topicId =
            getTopicId(lesson)


          if (!topicId) {

            console.warn(
              "⚠️ Lesson skipped - missing topic_id:",
              {
                id,
                title: lesson?.title,
                topic_id: lesson?.topic_id,
                topicId: lesson?.topicId,
                topic: lesson?.topic
              }
            )

            skippedCount++

            continue
          }

          const subjectId =
            getSubjectId(lesson)

          const topicSubjectId = topicSubjects.get(topicId)
          if (!topicSubjectId) {
            console.warn(
              "⚠️ Lesson skipped - topic does not exist in lessons.db:",
              { id, topicId }
            )
            skippedCount++
            continue
          }

          if (subjectId && subjectId !== topicSubjectId) {
            console.warn(
              "⚠️ Lesson skipped - topic belongs to a different subject:",
              { id, topicId, subjectId, topicSubjectId }
            )
            skippedCount++
            continue
          }

          if (!subjectIds.has(topicSubjectId)) {
            console.warn(
              "⚠️ Lesson skipped - topic references a missing subject:",
              { id, topicId, subjectId: topicSubjectId }
            )
            skippedCount++
            continue
          }

          const resolvedSubjectId = subjectId || topicSubjectId

          // ----------------------------------------------------
          // SUBJECT ID
          // ----------------------------------------------------

          // ----------------------------------------------------
          // TITLE
          // ----------------------------------------------------

          const title =
            lesson?.title ??
            lesson?.name ??
            ""

          const cleanTitle = cleanText(title)
          if (!cleanTitle) {

            console.warn(
              "⚠️ Lesson skipped - missing title:",
              id
            )

            skippedCount++

            continue
          }


          // ----------------------------------------------------
          // OTHER FIELDS
          // ----------------------------------------------------

          const topicNumber =
            lesson?.topic_number ??
            lesson?.topicNumber ??
            null


          const slug =
            cleanText(lesson?.slug)

          if (!slug) {
            console.warn(
              "⚠️ Lesson skipped - missing slug:",
              id
            )
            skippedCount++
            continue
          }

          const summary =
            cleanText(lesson?.summary)

          const blocks = serializeBlocks(lesson?.blocks)
          const teachingScore = scoreLessonForSelfStudy(
            cleanTitle,
            summary,
            blocks
          )

          const searchText =
            cleanText(
              lesson?.search_text ??
              lesson?.searchText
            )


          const orderIndex = cleanOrderIndex(
            lesson?.order_index ??
            lesson?.orderIndex
          )


          // ----------------------------------------------------
          // INSERT LESSON
          // ----------------------------------------------------

          rows.push([
            id,
            topicId,
            resolvedSubjectId,
            topicNumber,
            slug,
            cleanTitle,
            summary,
            blocks,
            searchText,
            orderIndex,
            teachingScore.score,
            teachingScore.level,
            JSON.stringify(teachingScore.feedback)
          ])


          console.log(
            `📖 Lesson saved: ${cleanTitle}`
          )
        }


        const lessonSaveResult = await saveLessonRows(
          db,
          [
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
            "teaching_feedback"
          ],
          rows
        )
        savedCount = lessonSaveResult.saved
        skippedCount += lessonSaveResult.skipped


        console.log("")
        console.log("========================================")
        console.log("✅ LESSON SAVE COMPLETE")
        console.log("========================================")
        console.log(
          `📖 Saved: ${savedCount}`
        )
        console.log(
          `⚠️ Skipped: ${skippedCount}`
        )
        console.log(
          `📦 Received: ${lessons.length}`
        )
        console.log("========================================")


        return savedCount


      } catch (error) {

        console.error(
          "❌ LESSON SAVE ERROR:",
          error
        )


        throw error
      }
    }
  )
}


// ============================================================
// SAVE QUESTIONS
// ============================================================
// questions.db
//
// Uses small batches to avoid SQLite parameter limits.
// ============================================================

export async function saveQuestions(
  questions: any[]
) {

  return runSequentially(
    async () => {

      if (
        !Array.isArray(questions) ||
        questions.length === 0
      ) {

        console.warn(
          "⚠️ No questions received"
        )

        return 0
      }


      const db =
        await getQuestionsDB()


      const BATCH_SIZE = 30


      const validQuestions =
        questions.filter(
          question =>
            question &&
            getId(question)
        )


      if (
        validQuestions.length === 0
      ) {

        console.warn(
          "⚠️ No valid questions to save"
        )

        return 0
      }


      let savedCount = 0


      console.log("")
      console.log("========================================")
      console.log("⚡ SAVING QUESTIONS")
      console.log("========================================")
      console.log(
        `📦 Received: ${questions.length}`
      )
      console.log(
        `📦 Valid: ${validQuestions.length}`
      )
      console.log(
        `📦 Batch size: ${BATCH_SIZE}`
      )


      try {

        for (
          let start = 0;
          start < validQuestions.length;
          start += BATCH_SIZE
        ) {

          const batch =
            validQuestions.slice(
              start,
              start + BATCH_SIZE
            )


          const placeholders =
            batch
              .map(
                () =>
                  `(
                    ?, ?, ?, ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?, ?, ?, ?
                  )`
              )
              .join(",\n")


          const values: any[] = []


          for (
            const question of batch
          ) {

            const explanation =
              question?.explanation ??
              null


            const explanationJson =
              explanation
                ? JSON.stringify(
                  explanation
                )
                : null


            values.push(

              // 1
              getId(question),

              // 2
              question?.examType ??
              question?.exam_type ??
              null,

              // 3
              normalizeQuestionSubject(question?.subject) ??
              null,

              // 4
              question?.year ??
              null,

              // 5
              question?.section ??
              null,

              // 6
              question?.topic ??
              null,

              // 7
              question?.category ??
              null,

              // 8
              question?.difficulty ??
              null,

              // 9
              question?.question ??
              null,

              // 10
              explanationJson,

              // 11
              question?.question_html ??
              null,

              // 12
              JSON.stringify(
                question?.options ??
                []
              ),

              // 13
              JSON.stringify(
                question?.options_html ??
                []
              ),

              // 14
              question?.answer ??
              null,

              // 15
              question?.solution ??
              null,

              // 16
              question?.solution_html ??
              null,

              // 17
              question?.imageUrl ??
              question?.image_url ??
              null,

              // 18
              question?.hasPassage
                ? 1
                : 0,

              // 19
              question?.passage ??
              null,

              // 20
              question?.passage_html ??
              null,

              // 21
              question?.country ??
              null,

              // 22
              question?.institution ??
              null,

              // 23
              question?.state ??
              null,

              // 24
              question?.source ??
              null
            )
          }


          await db.execute(
            `
            INSERT OR REPLACE INTO questions
            (
              id,
              examType,
              subject,
              year,
              section,
              topic,
              category,
              difficulty,
              question,
              explanation,
              question_html,
              options,
              options_html,
              answer,
              solution,
              solution_html,
              imageUrl,
              hasPassage,
              passage,
              passage_html,
              country,
              institution,
              state,
              source
            )
            VALUES ${placeholders}
            `,
            values
          )


          savedCount +=
            batch.length


          const percentage =
            Math.round(
              (
                savedCount /
                validQuestions.length
              ) * 100
            )


          console.log(
            `⚡ Questions: ${savedCount}/${validQuestions.length} (${percentage}%)`
          )
        }


        console.log("")
        console.log("========================================")
        console.log(
          `✅ SAVED ${savedCount} QUESTIONS`
        )
        console.log("========================================")


        return savedCount


      } catch (error) {

        console.error(
          "❌ QUESTION SAVE ERROR:",
          error
        )


        throw error
      }
    }
  )
}


// ============================================================
// VERIFY LESSON DATABASE
// ============================================================
//
// Use this after downloading content.
//
// It tells you exactly:
//
// subjects = ?
// topics   = ?
// lessons  = ?
// ============================================================

export async function verifyLessonDatabase() {

  return runSequentially(
    async () => {

      const db =
        await getLessonsDB()


      console.log("")
      console.log("========================================")
      console.log("🔎 VERIFYING LESSON DATABASE")
      console.log("========================================")


      const subjects =
        await db.select(
          `
          SELECT
            id,
            name,
            icon,
            description,
            order_index
          FROM subjects
          ORDER BY order_index ASC
          `
        )


      const topics =
        await db.select(
          `
          SELECT
            id,
            subject_id,
            topic_number,
            title,
            order_index
          FROM topics
          ORDER BY order_index ASC
          `
        )


      const lessons =
        await db.select(
          `
          SELECT
            id,
            topic_id,
            subject_id,
            topic_number,
            slug,
            title,
            summary,
            blocks,
            search_text,
            order_index
          FROM lessons
          ORDER BY order_index ASC
          `
        )


      console.log(
        `📚 Subjects: ${subjects.length}`
      )

      console.log(
        `📑 Topics: ${topics.length}`
      )

      console.log(
        `📖 Lessons: ${lessons.length}`
      )


      console.table(
        subjects
      )

      console.table(
        topics
      )


      console.log(
        "📖 Lessons:",
        lessons
      )


      console.log("========================================")


      return {
        subjects,
        topics,
        lessons
      }
    }
  )
}


// ============================================================
// VERIFY RELATIONSHIPS
// ============================================================
//
// This checks for:
//
// topic without subject
// lesson without topic
// lesson with missing subject
// ============================================================

export async function verifyLessonRelationships() {

  return runSequentially(
    async () => {

      const db =
        await getLessonsDB()


      console.log("")
      console.log("========================================")
      console.log("🔗 VERIFYING LESSON RELATIONSHIPS")
      console.log("========================================")


      // --------------------------------------------------------
      // TOPICS WITHOUT SUBJECTS
      // --------------------------------------------------------

      const brokenTopics =
        await db.select(
          `
          SELECT
            t.id,
            t.subject_id,
            t.title
          FROM topics t
          LEFT JOIN subjects s
            ON s.id = t.subject_id
          WHERE s.id IS NULL
          `
        )


      // --------------------------------------------------------
      // LESSONS WITHOUT TOPICS
      // --------------------------------------------------------

      const brokenLessons =
        await db.select(
          `
          SELECT
            l.id,
            l.topic_id,
            l.subject_id,
            l.title
          FROM lessons l
          LEFT JOIN topics t
            ON t.id = l.topic_id
          WHERE t.id IS NULL
          `
        )


      // --------------------------------------------------------
      // LESSONS WITHOUT SUBJECT
      // --------------------------------------------------------

      const lessonsWithoutSubject =
        await db.select(
          `
          SELECT
            l.id,
            l.topic_id,
            l.subject_id,
            l.title
          FROM lessons l
          LEFT JOIN subjects s
            ON s.id = l.subject_id
          WHERE
            l.subject_id IS NOT NULL
            AND s.id IS NULL
          `
        )


      console.log(
        `⚠️ Topics without subject: ${brokenTopics.length}`
      )

      console.log(
        `⚠️ Lessons without topic: ${brokenLessons.length}`
      )

      console.log(
        `⚠️ Lessons with invalid subject: ${lessonsWithoutSubject.length}`
      )


      if (
        brokenTopics.length
      ) {

        console.table(
          brokenTopics
        )
      }


      if (
        brokenLessons.length
      ) {

        console.table(
          brokenLessons
        )
      }


      if (
        lessonsWithoutSubject.length
      ) {

        console.table(
          lessonsWithoutSubject
        )
      }


      console.log("========================================")


      return {
        brokenTopics,
        brokenLessons,
        lessonsWithoutSubject
      }
    }
  )
}


// ============================================================
// COMPLETE CONTENT SAVE
// ============================================================
//
// IMPORTANT:
//
// ALWAYS call this instead of calling all save functions
// randomly.
//
// ORDER:
//
// 1. Subjects
// 2. Topics
// 3. Lessons
// 4. Questions
//
// Every save finishes completely before the next starts.
// ============================================================

export async function saveAllContent({
  subjects = [],
  topics = [],
  lessons = [],
  questions = []
}: {
  subjects?: any[]
  topics?: any[]
  lessons?: any[]
  questions?: any[]
}) {

      console.log("")
      console.log("########################################")
      console.log("🚀 STARTING COMPLETE CONTENT SAVE")
      console.log("########################################")


      // ======================================================
      // SUBJECTS, TOPICS, LESSONS
      // ======================================================

      console.log("")
      console.log("1️⃣ REPLACING LESSON DATASET")

      const lessonDatasetResult =
        await replaceLessonsWithLatestData({
          subjects,
          topics,
          lessons,
        })

      const subjectCount = lessonDatasetResult.subjects
      const topicCount = lessonDatasetResult.topics
      const lessonCount = lessonDatasetResult.lessons


      // ======================================================
      // QUESTIONS
      // ======================================================

      console.log("")
      console.log("4️⃣ QUESTIONS")

      const questionCount =
        await saveQuestions(
          questions
        )


      // ======================================================
      // VERIFY
      // ======================================================

      console.log("")
      console.log("5️⃣ VERIFYING")

      const verification =
        await verifyLessonDatabase()


      const relationships =
        await verifyLessonRelationships()


      // ======================================================
      // COMPLETE
      // ======================================================

      console.log("")
      console.log("########################################")
      console.log("🎉 CONTENT SAVE COMPLETE")
      console.log("########################################")

      console.log(
        `📚 Subjects saved: ${subjectCount}`
      )

      console.log(
        `📑 Topics saved: ${topicCount}`
      )

      console.log(
        `📖 Lessons saved: ${lessonCount}`
      )

      console.log(
        `❓ Questions saved: ${questionCount}`
      )

      console.log("########################################")
      const sidebar = await platform.lesson.getSidebar()
      loadLessonProgress()
      pruneLessonProgress(sidebar)

      return {
        subjects: subjectCount,
        topics: topicCount,
        lessons: lessonCount,
        questions: questionCount,
        verification,
        relationships
      }
}
