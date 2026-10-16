import {
  getLessonsDB as getSharedLessonsDB,
  initializeLessonsDatabase as initializeSharedLessonsDatabase,
} from "../../utils/databases"
import { scoreLessonForSelfStudy } from "../../utils/lessonTeachingScore"

/**
 * ============================================================
 * LESSONS SQLITE DATABASE
 * ============================================================
 *
 * Database:
 *   sqlite:lessons.db
 *
 * Tables:
 *   subjects
 *   topics
 *   lessons
 *
 * IMPORTANT:
 * Every database operation goes through readyLessonsDB()
 * so the tables are guaranteed to exist before querying them.
 * ============================================================
 */


type LessonsDatabase = Awaited<
  ReturnType<typeof getSharedLessonsDB>
>


/**
 * ============================================================
 * GET DATABASE CONNECTION
 * ============================================================
 */
function getLessonsDB(): Promise<LessonsDatabase> {
  return getSharedLessonsDB()
}


/**
 * ============================================================
 * CREATE / ENSURE TABLES
 * ============================================================
 */

export async function ensureTables(): Promise<void> {
  await initializeSharedLessonsDatabase()
}

 
export async function debugLessonsDB() {
  const db = await getLessonsDB()
  
  console.log("🔥 LESSON DATABASE INSTANCE:", db)

  const tables = await db.select(`
    SELECT name
    FROM sqlite_master
    WHERE type = 'table'
    ORDER BY name
  `)

  console.log("🔥 TABLES:", tables)

  for (const table of ["subjects", "topics", "lessons"]) {
    const rows = await db.select(
      `SELECT * FROM ${table} LIMIT 5`
    )

    console.log(
      `🔥 ${table.toUpperCase()} ROWS:`,
      rows
    )
  }

  const counts = await db.select(`
    SELECT
      (SELECT COUNT(*) FROM subjects) AS subjects_count,
      (SELECT COUNT(*) FROM topics) AS topics_count,
      (SELECT COUNT(*) FROM lessons) AS lessons_count
  `)

  console.log("🔥 DATABASE COUNTS:", counts)

  return {
    tables,
    counts
  }
}

/**
 * ============================================================
 * INITIALIZE DATABASE ONLY ONCE
 * ============================================================
 *
 * This prevents multiple components from trying to initialize
 * the database simultaneously.
 */
export function initializeLessonsDatabase(): Promise<void> {
  return initializeSharedLessonsDatabase()
}


/**
 * ============================================================
 * DATABASE READY
 * ============================================================
 *
 * EVERY database operation should use this.
 */
async function readyLessonsDB(): Promise<LessonsDatabase> {

  await initializeLessonsDatabase()

  return await getLessonsDB()
}


/**
 * ============================================================
 * TRANSACTIONS
 * ============================================================
 */

export async function beginTransaction(): Promise<void> {

  const database = await readyLessonsDB()

  await database.execute("BEGIN TRANSACTION")
}


export async function commitTransaction(): Promise<void> {

  const database = await readyLessonsDB()

  await database.execute("COMMIT")
}


export async function rollbackTransaction(): Promise<void> {

  const database = await readyLessonsDB()

  await database.execute("ROLLBACK")
}


/**
 * ============================================================
 * SUBJECT COUNT
 * ============================================================
 */

export async function getRawSubjectsCount(): Promise<number> {

  const database = await readyLessonsDB()

  const rows = await database.select<{ n: number }[]>(
    "SELECT COUNT(*) AS n FROM subjects"
  )

  return Number(rows?.[0]?.n ?? 0)
}


/**
 * ============================================================
 * GET SIDEBAR
 * ============================================================
 */

// export async function getSidebar() {

//   const db = await readyLessonsDB()


//   /**
//    * SUBJECTS
//    */
//   const subjects = await db.select<{
//     id: number
//     name: string
//     icon: string | null
//   }[]>(
//     `
//     SELECT id, name, icon
//     FROM subjects
//     ORDER BY id
//     `
//   )


//   console.log(
//     "📚 SUBJECTS COUNT:",
//     subjects.length
//   )

//   console.log(
//     "📚 SUBJECTS JSON:",
//     JSON.stringify(subjects, null, 2)
//   )

//   console.table(subjects)


//   /**
//    * TOPICS
//    */
//   const topics = await db.select<{
//     id: string
//     subject_id: string
//     title: string
//     order_index: number
//   }[]>(
//     `
//     SELECT
//       id,
//       subject_id,
//       title,
//       order_index
//     FROM topics
//     ORDER BY subject_id, order_index
//     `
//   )


//   console.log(
//     "📖 TOPICS COUNT:",
//     topics.length
//   )

//   console.table(topics)


//   /**
//    * LESSONS
//    */
//   const lessons = await db.select<{
//     id: string
//     topic_id: string
//     slug: string
//     title: string
//     order_index: number
//   }[]>(
//     `
//     SELECT
//       id,
//       topic_id,
//       slug,
//       title,
//       order_index
//     FROM lessons
//     ORDER BY topic_id, order_index
//     `
//   )


//   console.log(
//     "📝 LESSONS COUNT:",
//     lessons.length
//   )

//   console.table(lessons)


//   /**
//    * BUILD SIDEBAR TREE
//    */
//   const result = subjects.map((subject) => ({

//     ...subject,

//     topics: topics
//       .filter(
//         (topic) =>
//           Number(topic.subject_id) ===
//           Number(subject.id)
//       )

//       .map((topic) => ({

//         ...topic,

//         lessons: lessons.filter(
//           (lesson) =>
//             String(lesson.topic_id) ===
//             String(topic.id)
//         )

//       }))

//   }))


//   console.log(
//     "🌳 SIDEBAR RESULT:",
//     JSON.stringify(result, null, 2)
//   )


//   return result
// }

// export async function getSidebar() {
//   try {
//     const db = await readyLessonsDB()
//     const db2 = await getLessonsDB2()

//     /**
//      * ==========================================
//      * DATABASE 1
//      * ==========================================
//      */

//     const subjects = await db.select<{
//       id: number | string
//       name: string
//       icon: string | null
//     }[]>(`
//       SELECT *
//       FROM subjects
//       ORDER BY id
//     `)

//     const topics = await db.select<{
//       id: string
//       subject_id: string
//       title: string
//       order_index: number
//     }[]>(`
//       SELECT *
//       FROM topics
//       ORDER BY subject_id, order_index
//     `)

//     const lessons = await db.select<{
//       id: string
//       topic_id: string
//       subject_id: string
//       slug: string
//       title: string
//       order_index: number
//     }[]>(`
//       SELECT *
//       FROM lessons
//       ORDER BY topic_id, order_index
//     `)


//     /**
//      * ==========================================
//      * DATABASE 2
//      * ==========================================
//      */

//     const subjects2 = await db2.select<{
//       id: number | string
//       name: string
//       icon: string | null
//     }[]>(`
//       SELECT *
//       FROM subjects
//       ORDER BY id
//     `)

//     const topics2 = await db2.select<{
//       id: string
//       subject_id: string
//       title: string
//       order_index: number
//     }[]>(`
//       SELECT *
//       FROM topics
//       ORDER BY subject_id, order_index
//     `)

//     const lessons2 = await db2.select<{
//       id: string
//       topic_id: string
//       subject_id: string
//       slug: string
//       title: string
//       order_index: number
//     }[]>(`
//       SELECT *
//       FROM lessons
//       ORDER BY topic_id, order_index
//     `)


//     /**
//      * ==========================================
//      * BUILD RESULT 1
//      * ==========================================
//      */

//     const result = subjects.map((subject) => {

//       const subjectId = String(subject.id).trim()

//       const subjectTopics = topics
//         .filter((topic) => {

//           return (
//             subjectId ===
//             String(topic.subject_id).trim()
//           )

//         })
//         .map((topic) => {

//           const topicLessons = lessons.filter(
//             (lesson) =>
//               String(lesson.topic_id).trim() ===
//               String(topic.id).trim()
//           )

//           return {
//             ...topic,
//             lessons: topicLessons
//           }
//         })

//       return {
//         ...subject,
//         topics: subjectTopics
//       }
//     })


//     /**
//      * ==========================================
//      * BUILD RESULT 2
//      * ==========================================
//      */

//     const result2 = subjects2.map((subject) => {

//       const subjectId = String(subject.id).trim()

//       const subjectTopics = topics2
//         .filter((topic) => {

//           return (
//             subjectId ===
//             String(topic.subject_id).trim()
//           )

//         })
//         .map((topic) => {

//           const topicLessons = lessons2.filter(
//             (lesson) =>
//               String(lesson.topic_id).trim() ===
//               String(topic.id).trim()
//           )

//           return {
//             ...topic,
//             lessons: topicLessons
//           }
//         })

//       return {
//         ...subject,
//         topics: subjectTopics
//       }
//     })


//     /**
//      * ==========================================
//      * FALLBACK
//      *
//      * If result2 is empty, use result.
//      * ==========================================
//      */

//     let finalResult = result2

//     if (result2.length === 0) {

//       console.warn(
//         "⚠️ result2 is empty. Using result instead."
//       )

//       finalResult = result

//     } else {

//       console.log(
//         "✅ result2 contains data. Using result2."
//       )
//     }


//     /**
//      * ==========================================
//      * IF BOTH ARE EMPTY
//      * ==========================================
//      */

//     if (finalResult.length === 0) {

//       console.warn(
//         "⚠️ Both database results are empty."
//       )

//       return []

//     }


//     /**
//      * ==========================================
//      * DEBUG
//      * ==========================================
//      */

//     console.log(
//       "📊 RESULT 1 COUNT:",
//       result.length
//     )

//     console.log(
//       "📊 RESULT 2 COUNT:",
//       result2.length
//     )

//     console.log(
//       "📊 FINAL RESULT COUNT:",
//       finalResult.length
//     )

//     console.log(
//       "🌳 FINAL SIDEBAR:",
//       JSON.stringify(finalResult, null, 2)
//     )


//     /**
//      * ==========================================
//      * RETURN THE NON-EMPTY RESULT
//      * ==========================================
//      */

//     return finalResult

//   } catch (error) {

//     console.error(
//       "❌ getSidebar failed:",
//       error
//     )

//     throw error
//   }
// }

export async function getSidebar() {
  try {
    // ============================================================
    // OPEN DATABASES
    // ============================================================

    const db = await readyLessonsDB()


    console.log("📦 Loading sidebar data...")



    // ============================================================
    // DATABASE 1 — SUBJECTS
    // ============================================================

    let subjects = await db.select<{
      id: string | number
      name: string
      icon: string | null
    }[]>(`
      SELECT
        id,
        name,
        icon
      FROM subjects
      ORDER BY id
    `)

    // ============================================================
    // DATABASE 1 — TOPICS
    // ============================================================

    let topics = await db.select<{
      id: string
      subject_id: string
      topic_number: string | null
      title: string
      order_index: number
    }[]>(`
      SELECT
        id,
        subject_id,
        topic_number,
        title,
        order_index
      FROM topics
      ORDER BY subject_id, order_index
    `)

    // ============================================================
    // DATABASE 1 — LESSONS
    // Only load the metadata needed to render the sidebar.
    // Full lesson blocks are loaded by getLesson().

    let lessons = await db.select<{
      id: string
      topic_id: string
      subject_id: string
      topic_number: string | null
      slug: string
      title: string
      summary: string | null
      teaching_score: number | null
      teaching_level: string | null
      order_index: number
    }[]>(`
      SELECT
        id,
        topic_id,
        subject_id,
        topic_number,
        slug,
        title,
        summary,
        teaching_score,
        teaching_level,
        order_index
      FROM lessons
      ORDER BY topic_id, order_index
    `)

    console.log("📊 DATABASE 1:")
    console.log("Subjects:", subjects.length)
    console.log("Topics:", topics.length)
    console.log("Lessons:", lessons.length)

    // ============================================================
    // IF DATABASE 1 IS EMPTY
    // COPY EVERYTHING FROM DATABASE 2
    // ============================================================

    // ============================================================
    // BUILD SIDEBAR TREE
    // ============================================================

    const topicsBySubject = new Map<string, typeof topics>()
    for (const topic of topics) {
      const subjectId = String(topic.subject_id).trim()
      const subjectTopics = topicsBySubject.get(subjectId) ?? []
      subjectTopics.push(topic)
      topicsBySubject.set(subjectId, subjectTopics)
    }

    const lessonsByTopic = new Map<string, typeof lessons>()
    for (const lesson of lessons) {
      const topicId = String(lesson.topic_id).trim()
      const topicLessons = lessonsByTopic.get(topicId) ?? []
      topicLessons.push(lesson)
      lessonsByTopic.set(topicId, topicLessons)
    }

    const result = subjects.map((subject) => {

      const subjectId = String(
        subject.id
      ).trim()

      // ==========================================================
      // GET TOPICS FOR THIS SUBJECT
      // ==========================================================

      const subjectTopics = (topicsBySubject.get(subjectId) ?? [])

        // ========================================================
        // BUILD TOPIC
        // ========================================================

        .map((topic) => {

          const topicId = String(
            topic.id
          ).trim()

          // ======================================================
          // GET LESSON METADATA FOR THIS TOPIC
          // ======================================================

          const topicLessons = (lessonsByTopic.get(topicId) ?? [])

            // ====================================================
            // RETURN COMPLETE LESSON
            // ====================================================

            .map((lesson) => {

              return {
                id: lesson.id,

                topic_id: lesson.topic_id,

                subject_id: lesson.subject_id,

                topic_number: lesson.topic_number,

                slug: lesson.slug,

                title: lesson.title,

                summary: lesson.summary,

                teaching_score: lesson.teaching_score,

                teaching_level: lesson.teaching_level,

                order_index: lesson.order_index
              }

            })

          // ======================================================
          // RETURN COMPLETE TOPIC
          // ======================================================

          return {
            id: topic.id,

            subject_id: topic.subject_id,

            topic_number: topic.topic_number,

            title: topic.title,

            order_index: topic.order_index,

            lessons: topicLessons
          }

        })

      // ==========================================================
      // RETURN COMPLETE SUBJECT
      // ==========================================================

      return {
        id: subject.id,

        name: subject.name,

        icon: subject.icon,

        topics: subjectTopics
      }

    })

    // ============================================================
    // DEBUG COUNTS
    // ============================================================

    console.log(
      "📊 FINAL SUBJECT COUNT:",
      result.length
    )

    console.log(
      "📊 FINAL TOPIC COUNT:",
      result.reduce(
        (total, subject) =>
          total + subject.topics.length,
        0
      )
    )

    console.log(
      "📊 FINAL LESSON COUNT:",
      result.reduce(
        (total, subject) =>
          total +
          subject.topics.reduce(
            (topicTotal, topic) =>
              topicTotal + topic.lessons.length,
            0
          ),
        0
      )
    )

    return result

  } catch (error) {

    console.error(
      "❌ getSidebar failed:",
      error
    )

    throw error
  }
}

export interface AvailableSubject {
  id: string
  name: string
  icon: string | null
  topicCount: number
  lessonCount: number
}

export async function getSubjects(): Promise<AvailableSubject[]> {
  const db = await readyLessonsDB()

  return db.select<AvailableSubject[]>(`
    SELECT
      s.id,
      s.name,
      s.icon,
      COUNT(DISTINCT t.id) AS topicCount,
      COUNT(DISTINCT l.id) AS lessonCount
    FROM subjects s
    LEFT JOIN topics t ON t.subject_id = s.id
    LEFT JOIN lessons l ON l.topic_id = t.id
    GROUP BY s.id, s.name, s.icon
    ORDER BY s.order_index, s.name
  `)
}

export async function getSubject(idOrName: string) {
  const key = String(idOrName ?? "").trim()
  if (!key) {
    throw new Error("Subject id or name is required")
  }

  const subjects = await getSidebar()
  const normalizedName = (value: string) =>
    value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-")

  return subjects.find((subject: any) => {
    return (
      String(subject.id) === key ||
      normalizedName(subject.name) === normalizedName(key)
    )
  }) ?? null
}




/**
 * ============================================================
 * GET SINGLE LESSON
 * ============================================================
 */

export async function getLesson(
  slug: string
) {

  const db = await readyLessonsDB()

  const rows = await db.select(
    `
    SELECT *
    FROM lessons
    WHERE slug = ?
    LIMIT 1
    `,
    [slug]
  )


  if (!rows.length) {
    return null
  }


  const lesson =
    rows[0] as Record<string, any>


  let blocks: any[] = []

  if (lesson.blocks) {

    try {

      blocks = JSON.parse(
        lesson.blocks
      )

    } catch (error) {

      console.warn(
        "⚠️ Failed to parse lesson blocks:",
        error
      )

      blocks = []
    }
  }

  let teachingFeedback: string[] = []
  if (lesson.teaching_feedback) {
    try {
      const parsedFeedback = JSON.parse(lesson.teaching_feedback)
      if (Array.isArray(parsedFeedback)) {
        teachingFeedback = parsedFeedback.map(String)
      }
    } catch {
      teachingFeedback = []
    }
  }

  const savedTeachingScore =
    lesson.teaching_score === null ||
    lesson.teaching_score === undefined
      ? Number.NaN
      : Number(lesson.teaching_score)

  const teachingEvaluation = Number.isFinite(savedTeachingScore)
    ? {
        score: savedTeachingScore,
        level: lesson.teaching_level || "Needs teacher support",
        feedback: teachingFeedback,
      }
    : scoreLessonForSelfStudy(
        lesson.title,
        lesson.summary,
        lesson.blocks
      )

  // Save the calculated score so it is only computed once.
  // The bundled lessons database is read-only before activation,
  // so this write can fail. The score is already calculated above,
  // so a failed save must never stop the lesson from opening.
  if (!Number.isFinite(savedTeachingScore)) {
    try {
      await db.execute(
        `
        UPDATE lessons
        SET teaching_score = ?, teaching_level = ?, teaching_feedback = ?
        WHERE id = ?
        `,
        [
          teachingEvaluation.score,
          teachingEvaluation.level,
          JSON.stringify(teachingEvaluation.feedback),
          lesson.id,
        ]
      )
    } catch (error) {
      console.warn("Could not cache teaching score:", error)
    }
  }


  return {
    ...lesson,
    blocks,
    teaching_score: teachingEvaluation.score,
    teaching_level: teachingEvaluation.level,
    teaching_feedback: teachingEvaluation.feedback,
  }
}


/**
 * ============================================================
 * GET ADJACENT LESSON
 * ============================================================
 */

export async function getAdjacentLesson(
  topicId: string,
  orderIndex: number,
  direction: "next" | "previous"
) {

  const db = await readyLessonsDB()


  const comparator =
    direction === "next"
      ? ">"
      : "<"


  const order =
    direction === "next"
      ? "ASC"
      : "DESC"


  const rows = await db.select(
    `
    SELECT
      slug,
      title
    FROM lessons
    WHERE topic_id = ?
      AND order_index ${comparator} ?
    ORDER BY order_index ${order}
    LIMIT 1
    `,
    [
      topicId,
      orderIndex
    ]
  )


  return rows[0] || null
}


/**
 * ============================================================
 * SEARCH LESSONS
 * ============================================================
 */

export async function searchLessons(
  term: string,
  limit = 20
) {

  const db = await readyLessonsDB()

  const query = term.trim()


  if (!query) {
    return []
  }


  const safeLimit =
    Math.max(
      1,
      Math.min(
        Number(limit) || 20,
        100
      )
    )


  const ftsQuery = query
    .split(/\s+/)
    .filter(Boolean)
    .map(
      (word) =>
        `"${word.replace(/"/g, '""')}"*`
    )
    .join(" ")


  try {

    return await db.select(
      `
      SELECT

        l.slug,

        l.title,

        l.summary,

        s.name AS subjectName,

        snippet(
          lessons_fts,
          2,
          '⟦',
          '⟧',
          '…',
          10
        ) AS snippet

      FROM lessons_fts

      JOIN lessons l
        ON l.rowid = lessons_fts.rowid

      JOIN subjects s
        ON s.id = l.subject_id

      WHERE lessons_fts MATCH ?

      ORDER BY rank

      LIMIT ?
      `,
      [
        ftsQuery,
        safeLimit
      ]
    )

  } catch (error) {

    console.warn(
      "⚠️ FTS search unavailable:",
      error
    )

    /**
     * Fallback to normal LIKE search.
     */
    const likeTerm = `%${query}%`

    return await db.select(
      `
      SELECT
        l.slug,
        l.title,
        l.summary,
        s.name AS subjectName,
        l.search_text AS snippet

      FROM lessons l

      JOIN subjects s
        ON s.id = l.subject_id

      WHERE
        l.title LIKE ?
        OR l.summary LIKE ?
        OR l.search_text LIKE ?

      ORDER BY l.order_index

      LIMIT ?
      `,
      [
        likeTerm,
        likeTerm,
        likeTerm,
        safeLimit
      ]
    )
  }
}


/**
 * ============================================================
 * SUBJECT EXISTS
 * ============================================================
 */

export async function subjectExists(
  subjectId: number
): Promise<boolean> {

  const database = await readyLessonsDB()

  const rows =
    await database.select<{ id: number }[]>(
      `
      SELECT id
      FROM subjects
      WHERE id = ?
      LIMIT 1
      `,
      [subjectId]
    )


  return rows.length > 0
}


/**
 * ============================================================
 * TOPIC EXISTS
 * ============================================================
 */

export async function topicExists(
  topicId: string
): Promise<boolean> {

  const database = await readyLessonsDB()

  const rows =
    await database.select<{ id: string }[]>(
      `
      SELECT id
      FROM topics
      WHERE id = ?
      LIMIT 1
      `,
      [topicId]
    )


  return rows.length > 0
}


/**
 * ============================================================
 * LESSON EXISTS
 * ============================================================
 */

export async function lessonExists(
  lessonId: number
): Promise<boolean> {

  const database = await readyLessonsDB()

  const rows =
    await database.select<{ id: number }[]>(
      `
      SELECT id
      FROM lessons
      WHERE id = ?
      LIMIT 1
      `,
      [lessonId]
    )


  return rows.length > 0
}


/**
 * ============================================================
 * MAX TOPIC NUMBER
 * ============================================================
 */

export async function getMaxTopicNumber(
  subjectId: number
): Promise<number> {

  const database = await readyLessonsDB()

  const rows =
    await database.select<{ n: number }[]>(
      `
      SELECT
        COALESCE(
          MAX(
            CAST(topic_number AS INTEGER)
          ),
          0
        ) AS n

      FROM topics

      WHERE subject_id = ?
      `,
      [subjectId]
    )


  return Number(
    rows?.[0]?.n ?? 0
  )
}


/**
 * ============================================================
 * MAX TOPIC ORDER
 * ============================================================
 */

export async function getMaxTopicOrder(
  subjectId: number
): Promise<number> {

  const database = await readyLessonsDB()

  const rows =
    await database.select<{ n: number }[]>(
      `
      SELECT
        COALESCE(
          MAX(order_index),
          -1
        ) AS n

      FROM topics

      WHERE subject_id = ?
      `,
      [subjectId]
    )


  return Number(
    rows?.[0]?.n ?? -1
  )
}


export async function debugLessonsDatabaseLocation() {
  const db = await getLessonsDB()

  const result = await db.select<{
    database: string
    name: string
    file: string | null
  }[]>(`
    PRAGMA database_list
  `)

  console.log(
    "======================================"
  )

  console.log(
    "📍 LESSONS DATABASE LOCATION"
  )

  console.log(
    "======================================"
  )

  console.log(
    JSON.stringify(result, null, 2)
  )

  return result
}
export async function inspectLessonsDatabase() {
  const db = await getLessonsDB()

  const databaseInfo = await db.select(`
    PRAGMA database_list
  `)

  const tables = await db.select(`
    SELECT name
    FROM sqlite_master
    WHERE type = 'table'
    ORDER BY name
  `)

  const subjects = await db.select(`
    SELECT *
    FROM subjects
    LIMIT 10
  `)

  const topics = await db.select(`
    SELECT *
    FROM topics
    LIMIT 10
  `)

  const lessons = await db.select(`
    SELECT *
    FROM lessons
    LIMIT 10
  `)

  console.log("======================================")
  console.log("📍 LESSONS DATABASE")
  console.log("======================================")

  console.log(
    "📍 DATABASE INFO:",
    JSON.stringify(databaseInfo, null, 2)
  )

  console.log(
    "📋 TABLES:",
    JSON.stringify(tables, null, 2)
  )

  console.log(
    "📚 SUBJECTS:",
    JSON.stringify(subjects, null, 2)
  )

  console.log(
    "📖 TOPICS:",
    JSON.stringify(topics, null, 2)
  )

  console.log(
    "📝 LESSONS:",
    JSON.stringify(lessons, null, 2)
  )

  console.log("======================================")

  return {
    databaseInfo,
    tables,
    subjects,
    topics,
    lessons
  }
}
/**
 * ============================================================
 * GET TOPIC
 * ============================================================
 */

export async function getTopic(
  topicId: string
) {

  const database = await readyLessonsDB()

  const rows =
    await database.select<{
      id: string
      subject_id: number
      topic_number: string
      title: string
      order_index: number
    }[]>(
      `
      SELECT
        id,
        subject_id,
        topic_number,
        title,
        order_index

      FROM topics

      WHERE id = ?

      LIMIT 1
      `,
      [topicId]
    )


  return rows[0] || null
}


/**
 * ============================================================
 * ENSURE TOPIC
 * ============================================================
 */

export async function ensureTopic({
  topicId,
  subjectId,
  topicNumber,
  title,
  orderIndex
}: {
  topicId: string
  subjectId: number
  topicNumber: number
  title: string
  orderIndex: number
}) {

  const database = await readyLessonsDB()


  const existing =
    await getTopic(topicId)


  if (existing) {

    await database.execute(
      `
      UPDATE topics

      SET
        subject_id = ?,
        topic_number = ?,
        title = ?,
        order_index = ?

      WHERE id = ?
      `,
      [
        subjectId,
        String(topicNumber),
        title,
        orderIndex,
        topicId
      ]
    )


    return "existing"
  }


  await database.execute(
    `
    INSERT INTO topics (
      id,
      subject_id,
      topic_number,
      title,
      order_index
    )

    VALUES (?, ?, ?, ?, ?)
    `,
    [
      topicId,
      subjectId,
      String(topicNumber),
      title,
      orderIndex
    ]
  )


  return "inserted"
}


/**
 * ============================================================
 * GET TOPIC BY TITLE
 * ============================================================
 */

export async function getTopicByTitle(
  subjectId: number,
  title: string
) {

  const database = await readyLessonsDB()

  const rows =
    await database.select<{
      id: string
      subject_id: number
      topic_number: string
      title: string
      order_index: number
    }[]>(
      `
      SELECT
        id,
        subject_id,
        topic_number,
        title,
        order_index

      FROM topics

      WHERE
        subject_id = ?

        AND lower(trim(title))
          =
        lower(trim(?))

      LIMIT 1
      `,
      [
        subjectId,
        title
      ]
    )


  return rows[0] || null
}


/**
 * ============================================================
 * MAX LESSON ORDER
 * ============================================================
 */

export async function getMaxLessonOrder(
  topicId: string
): Promise<number> {

  const database = await readyLessonsDB()

  const rows =
    await database.select<{ n: number }[]>(
      `
      SELECT
        COALESCE(
          MAX(order_index),
          -1
        ) AS n

      FROM lessons

      WHERE topic_id = ?
      `,
      [topicId]
    )


  return Number(
    rows?.[0]?.n ?? -1
  )
}


/**
 * ============================================================
 * ENSURE SUBJECT
 * ============================================================
 */

export async function ensureSubject(
  subjectName: string,
  subjectId: number,
  icon?: string | null
) {

  const database = await readyLessonsDB()


  const existing =
    await database.select<{
      id: number
      name: string
      icon: string | null
    }[]>(
      `
      SELECT
        id,
        name,
        icon

      FROM subjects

      WHERE id = ?

      LIMIT 1
      `,
      [subjectId]
    )


  if (existing.length) {

    await database.execute(
      `
      UPDATE subjects

      SET
        name = ?,
        icon = ?

      WHERE id = ?
      `,
      [
        subjectName,
        icon || null,
        subjectId
      ]
    )


    return "existing"
  }


  await database.execute(
    `
    INSERT INTO subjects (
      id,
      name,
      icon
    )

    VALUES (?, ?, ?)
    `,
    [
      subjectId,
      subjectName,
      icon || null
    ]
  )


  return "inserted"
}


/**
 * ============================================================
 * VERIFY IMPORT
 * ============================================================
 */

export async function verifyImport(
  subjectId: number
) {

  const database = await readyLessonsDB()


  const subjects =
    await database.select(
      `
      SELECT
        id,
        name,
        icon

      FROM subjects

      WHERE id = ?

      LIMIT 1
      `,
      [subjectId]
    ) as any[]


  const topics =
    await database.select(
      `
      SELECT
        id,
        subject_id,
        topic_number,
        title,
        order_index

      FROM topics

      WHERE subject_id = ?

      ORDER BY order_index ASC
      `,
      [subjectId]
    ) as any[]


  const lessons =
    await database.select(
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

      WHERE subject_id = ?

      ORDER BY
        topic_id ASC,
        order_index ASC
      `,
      [subjectId]
    ) as any[]


  const result = {

    subjectCount:
      subjects.length,

    topicCount:
      topics.length,

    lessonCount:
      lessons.length,

    subjects,

    topics,

    lessons

  }


  console.log(
    "========== SQLITE IMPORT VERIFICATION =========="
  )

  console.log(
    "Subject:",
    subjects
  )

  console.log(
    "Topics:",
    topics.length
  )

  console.log(
    "Lessons:",
    lessons.length
  )

  console.log(
    "Verification:",
    result
  )


  return result
}


/**
 * ============================================================
 * GET DATABASE TABLES
 * ============================================================
 *
 * NOTE:
 * This function intentionally does NOT call readyLessonsDB()
 * because initializeLessonsDatabase() itself uses it for
 * verification.
 */
export async function getDatabaseTables() {

  const database = await getLessonsDB()

  const tables =
    await database.select<{
      name: string
    }[]>(
      `
      SELECT name

      FROM sqlite_master

      WHERE type = 'table'

      ORDER BY name
      `
    )


  return tables
}


/**
 * ============================================================
 * GET LESSON BY ID
 * ============================================================
 */

export async function getLessonId(
  lessonId: number
) {

  const database = await readyLessonsDB()

  const rows =
    await database.select(
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

      WHERE id = ?

      LIMIT 1
      `,
      [lessonId]
    )


  return rows?.[0] || null
}


/**
 * ============================================================
 * REBUILD FTS
 * ============================================================
 */

export async function rebuildFTS(): Promise<boolean> {

  try {

    const database =
      await readyLessonsDB()


    const fts =
      await database.select(
        `
        SELECT name

        FROM sqlite_master

        WHERE type = 'table'

        AND name = 'lessons_fts'

        LIMIT 1
        `
      )


    if (!fts.length) {

      console.log(
        "ℹ️ lessons_fts does not exist. FTS rebuild skipped."
      )

      return false
    }


    await database.execute(
      `
      INSERT INTO lessons_fts(
        lessons_fts
      )

      VALUES ('rebuild')
      `
    )


    console.log(
      "✅ lessons_fts rebuilt successfully."
    )


    return true

  } catch (error) {

    console.warn(
      "⚠️ FTS rebuild skipped:",
      error
    )

    return false
  }
}


/**
 * ============================================================
 * LESSON UPSERT TYPE
 * ============================================================
 */

export interface LessonUpsertRow {

  id: number

  /**
   * topics.id is TEXT
   */
  topic_id: string

  subject_id: number

  topic_number: number

  slug: string

  title: string

  summary: string

  blocks: string

  search_text: string

  order_index: number
}


/**
 * ============================================================
 * UPSERT LESSON
 * ============================================================
 */

export async function upsertLesson(
  row: LessonUpsertRow
): Promise<
  "updated" | "inserted"
> {

  const database =
    await readyLessonsDB()


  const existing =
    await getLessonId(row.id)


  if (existing) {

    await database.execute(
      `
      UPDATE lessons

      SET

        topic_id = ?,

        subject_id = ?,

        topic_number = ?,

        slug = ?,

        title = ?,

        summary = ?,

        blocks = ?,

        search_text = ?,

        order_index = ?

      WHERE id = ?
      `,
      [

        row.topic_id,

        row.subject_id,

        row.topic_number,

        row.slug,

        row.title,

        row.summary,

        row.blocks,

        row.search_text,

        row.order_index,

        row.id

      ]
    )


    return "updated"
  }


  await database.execute(
    `
    INSERT INTO lessons (

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

    )

    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [

      row.id,

      row.topic_id,

      row.subject_id,

      row.topic_number,

      row.slug,

      row.title,

      row.summary,

      row.blocks,

      row.search_text,

      row.order_index

    ]
  )


  return "inserted"
}