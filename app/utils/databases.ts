import Database from "@tauri-apps/plugin-sql"
import { readTextFile } from "@tauri-apps/plugin-fs"
import { resolveResource } from "@tauri-apps/api/path"
import { isSoftwareActivated } from "~/composables/useSoftwareSecurity"

type DatabaseName =
  | "cbt.db"
  | "questions.db"
  | "lessons.db"
  | "dictionary.db"

type ContentDatabaseName = "questions.db" | "lessons.db"

type SqlDatabase = Awaited<
  ReturnType<typeof Database.load>
>

const databaseConnections: Partial<
  Record<DatabaseName, SqlDatabase>
> = {}

const databasePromises: Partial<
  Record<DatabaseName, Promise<SqlDatabase>>
> = {}

const bundledContentConnections: Partial<
  Record<ContentDatabaseName, SqlDatabase>
> = {}

const bundledContentPromises: Partial<
  Record<ContentDatabaseName, Promise<SqlDatabase>>
> = {}

let applicationDatabasesPromise: Promise<void> | null = null


// ============================================================
// HELPER
// Check whether a table exists
// ============================================================

async function tableExists(
  db: any,
  tableName: string
): Promise<boolean> {

  const rows = await db.select(
    `
    SELECT name
    FROM sqlite_master
    WHERE type = 'table'
      AND name = ?
    LIMIT 1
    `,
    [tableName]
  )

  return rows.length > 0
}


// ============================================================
// HELPER
// Check whether a column exists
// ============================================================

async function columnExists(
  db: any,
  tableName: string,
  columnName: string
): Promise<boolean> {

  const columns = await db.select(
    `
    PRAGMA table_info(${tableName})
    `
  )

  return columns.some(
    (column: any) =>
      column.name === columnName
  )
}


export async function migrateExamAnswers(
  db: SqlDatabase
): Promise<void> {
  const columns = await db.select<{ name: string }[]>(
    "PRAGMA table_info(exam_answers)"
  )
  const columnNames = new Set(
    columns.map((column) => column.name)
  )

  const migrations: Array<[string, string]> = [
    ["question", "TEXT"],
    ["answer", "TEXT"],
    ["userAnswer", "TEXT"],
    ["isCorrect", "INTEGER"],
    ["timeSpent", "INTEGER"],
    ["bookmarked", "INTEGER"]
  ]

  for (const [columnName, columnType] of migrations) {
    if (columnNames.has(columnName)) {
      continue
    }

    await db.execute(
      `ALTER TABLE exam_answers ADD COLUMN ${columnName} ${columnType}`
    )

    if (
      columnName === "answer" &&
      columnNames.has("correctAnswer")
    ) {
      await db.execute(`
        UPDATE exam_answers
        SET answer = correctAnswer
        WHERE answer IS NULL
      `)
    }
  }
}


// ============================================================
// CBT DATABASE
// cbt.db
// ============================================================

async function initializeCbtDatabase(db: any) {

  console.log("🔧 Checking cbt.db tables...")


  // ==========================================================
  // EXAM HISTORY
  // ==========================================================

  await db.execute(`
    CREATE TABLE IF NOT EXISTS exam_history (

      id INTEGER PRIMARY KEY AUTOINCREMENT,

      examType TEXT,
      mode TEXT,

      startTime TEXT,
      endTime TEXT,

      total INTEGER DEFAULT 0,
      answered INTEGER DEFAULT 0,
      unanswered INTEGER DEFAULT 0,

      correct INTEGER DEFAULT 0,
      wrong INTEGER DEFAULT 0,

      percentage REAL DEFAULT 0,

      aggregate REAL DEFAULT 0,
      maxAggregate REAL DEFAULT 0,

      duration INTEGER DEFAULT 0,
      durationUsed INTEGER DEFAULT 0,

      timeSpent TEXT,

      speed REAL DEFAULT 0,

      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)


  // ==========================================================
  // EXAM SUBJECTS
  // ==========================================================

  await db.execute(`
    CREATE TABLE IF NOT EXISTS exam_subjects (

      id INTEGER PRIMARY KEY AUTOINCREMENT,

      historyId INTEGER,

      subjectId TEXT,
      subjectName TEXT,

      total INTEGER DEFAULT 0,
      answered INTEGER DEFAULT 0,

      correct INTEGER DEFAULT 0,
      wrong INTEGER DEFAULT 0,

      score REAL DEFAULT 0,
      maxScore REAL DEFAULT 0,

      FOREIGN KEY(historyId)
        REFERENCES exam_history(id)
        ON DELETE CASCADE
    )
  `)


  // ==========================================================
  // EXAM ANSWERS
  // ==========================================================

  await db.execute(`
    CREATE TABLE IF NOT EXISTS exam_answers (

      id INTEGER PRIMARY KEY AUTOINCREMENT,

      historyId INTEGER,

      questionId TEXT,

      question TEXT,

      subject TEXT,

      year TEXT,

      text TEXT,

      options TEXT,

      answer TEXT,

      userAnswer TEXT,

      isCorrect INTEGER DEFAULT 0,

      timeSpent INTEGER DEFAULT 0,

      bookmarked INTEGER DEFAULT 0,

      FOREIGN KEY(historyId)
        REFERENCES exam_history(id)
        ON DELETE CASCADE
    )
  `)


  // ==========================================================
  // BOOKMARKS
  // ==========================================================

  await db.execute(`
    CREATE TABLE IF NOT EXISTS bookmarks (

      id INTEGER PRIMARY KEY AUTOINCREMENT,

      question_id TEXT NOT NULL UNIQUE,

      exam_type TEXT,

      subject TEXT,

      year TEXT,

      question_number INTEGER,

      question_text TEXT NOT NULL,

      options TEXT,

      correct_answer TEXT,

      explanation TEXT,

      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await migrateExamAnswers(db)


  // ==========================================================
  // INDEXES
  // ==========================================================

  await db.execute(`
    CREATE INDEX IF NOT EXISTS
    idx_exam_subjects_history
    ON exam_subjects(historyId)
  `)

  await db.execute(`
    CREATE INDEX IF NOT EXISTS
    idx_exam_answers_history
    ON exam_answers(historyId)
  `)

  await db.execute(`
    CREATE INDEX IF NOT EXISTS
    idx_exam_answers_question
    ON exam_answers(questionId)
  `)

  console.log("✅ cbt.db ready")
}


// ============================================================
// QUESTIONS DATABASE
// questions.db
// ============================================================

async function initializeQuestionsDatabase(db: any) {

  console.log("🔧 Checking questions.db tables...")


  // ==========================================================
  // PAST QUESTIONS
  // ==========================================================

  await db.execute(`
    CREATE TABLE IF NOT EXISTS questions (

      id TEXT PRIMARY KEY,

      examType TEXT,

      subject TEXT,

      year INTEGER,

      section TEXT,

      topic TEXT,

      category TEXT,

      difficulty TEXT,

      question TEXT,

      question_html TEXT,

      options TEXT,

      explanation TEXT,

      options_html TEXT,

      answer TEXT,

      solution TEXT,

      solution_html TEXT,

      imageUrl TEXT,

      hasPassage INTEGER DEFAULT 0,

      passage TEXT,

      passage_html TEXT,

      country TEXT,

      institution TEXT,

      state TEXT,

      source TEXT
    )
  `)


  // ==========================================================
  // QUESTIONS MIGRATIONS
  // Keep existing downloads while upgrading older DB schemas
  // to include every column used by saveQuestions().
  // ==========================================================

  const questionColumns: Array<[string, string]> = [
    ["examType", "TEXT"],
    ["subject", "TEXT"],
    ["year", "INTEGER"],
    ["section", "TEXT"],
    ["topic", "TEXT"],
    ["category", "TEXT"],
    ["difficulty", "TEXT"],
    ["question", "TEXT"],
    ["question_html", "TEXT"],
    ["options", "TEXT"],
    ["explanation", "TEXT"],
    ["options_html", "TEXT"],
    ["answer", "TEXT"],
    ["solution", "TEXT"],
    ["solution_html", "TEXT"],
    ["imageUrl", "TEXT"],
    ["hasPassage", "INTEGER DEFAULT 0"],
    ["passage", "TEXT"],
    ["passage_html", "TEXT"],
    ["country", "TEXT"],
    ["institution", "TEXT"],
    ["state", "TEXT"],
    ["source", "TEXT"],
  ]

  for (const [columnName, columnType] of questionColumns) {
    if (await columnExists(db, "questions", columnName)) {
      continue
    }

    console.info(`➕ Adding ${columnName} column to questions...`)
    await db.execute(
      `ALTER TABLE questions ADD COLUMN ${columnName} ${columnType}`
    )
  }


  // ==========================================================
  // INDEXES
  // ==========================================================

  await db.execute(`
    CREATE INDEX IF NOT EXISTS
    idx_questions_subject
    ON questions(subject)
  `)

  await db.execute(`
    CREATE INDEX IF NOT EXISTS
    idx_questions_topic
    ON questions(topic)
  `)

  await db.execute(`
    CREATE INDEX IF NOT EXISTS
    idx_questions_year
    ON questions(year)
  `)

  await db.execute(`
    CREATE INDEX IF NOT EXISTS
    idx_questions_examType
    ON questions(examType)
  `)

  await db.execute(`
    UPDATE questions
    SET subject = 'english-language'
    WHERE lower(trim(subject)) IN (
      'english',
      'english language',
      'english-language'
    )
      AND subject != 'english-language'
  `)

  console.log("✅ questions.db ready")
}


type LessonSeedPayload = {
  subjects: Array<{
    id: string
    name: string
    icon?: string | null
    description?: string | null
    order_index?: number | null
  }>
  topics: Array<{
    id: string
    subject_id: string
    topic_number: string | number | null
    title: string
    order_index?: number | null
  }>
  lessons: Array<{
    id: string
    topic_id: string
    subject_id: string
    topic_number: string | number | null
    slug?: string | null
    title: string
    summary?: string | null
    blocks?: unknown
    search_text?: string | null
    order_index?: number | null
  }>
}

async function loadBundledLessonSeed(): Promise<LessonSeedPayload | null> {
  try {
    const resourcePath = await resolveResource("resources/lessonss.json")
    const rawText = await readTextFile(resourcePath)
    const parsed = JSON.parse(rawText) as Partial<LessonSeedPayload>

    if (
      !parsed ||
      !Array.isArray(parsed.subjects) ||
      !Array.isArray(parsed.topics) ||
      !Array.isArray(parsed.lessons)
    ) {
      return null
    }

    return parsed as LessonSeedPayload
  } catch (error) {
    console.warn("Bundled starter lesson seed not found or unreadable:", error)
    return null
  }
}

function normalizeSeedText(input: unknown): string {
  if (!input) return ""

  if (typeof input === "string") {
    return input
  }

  if (input && typeof input === "object") {
    try {
      return JSON.stringify(input)
    } catch {
      return String(input)
    }
  }

  return String(input)
}

async function seedStarterLessonData(db: any): Promise<void> {
  const counts = await db.select<
    { subjects: number; topics: number; lessons: number }[]
  >(`
    SELECT
      (SELECT COUNT(*) FROM subjects) AS subjects,
      (SELECT COUNT(*) FROM topics) AS topics,
      (SELECT COUNT(*) FROM lessons) AS lessons
  `)

  const subjectCount = Number(counts?.[0]?.subjects ?? 0)
  const topicCount = Number(counts?.[0]?.topics ?? 0)
  const lessonCount = Number(counts?.[0]?.lessons ?? 0)

  if (subjectCount > 0 && topicCount > 0 && lessonCount > 0) {
    return
  }

  const seed = await loadBundledLessonSeed()
  if (!seed) {
    return
  }

  const subjectRows = seed.subjects.filter((subject) => subject?.id && subject?.name)
  const topicRows = seed.topics.filter((topic) => topic?.id && topic?.subject_id && topic?.title)

  if (!subjectRows.length || !topicRows.length) {
    return
  }

  const lessonsByTopic = new Map<string, LessonSeedPayload["lessons"][number]>()
  for (const lesson of seed.lessons) {
    if (!lesson?.topic_id || !lesson?.id) continue
    if (!lessonsByTopic.has(lesson.topic_id)) {
      lessonsByTopic.set(lesson.topic_id, lesson)
    }
  }

  const buildFallbackLesson = (topic: LessonSeedPayload["topics"][number]) => ({
    id: `${topic.id}-starter`,
    topic_id: topic.id,
    subject_id: topic.subject_id,
    topic_number: topic.topic_number,
    slug: `${topic.id}-starter`,
    title: `Getting started: ${topic.title}`,
    summary: `A short starter lesson to keep this topic available while you are offline or before a full download is activated.`,
    blocks: [
      {
        type: "heading",
        level: 2,
        text: topic.title,
      },
      {
        type: "paragraph",
        text_html: `This is a starter lesson for <strong>${topic.title}</strong>. Use it as a quick starting point while the full content is not yet available or while you are offline.`,
      },
      {
        type: "note",
        text_html: "Start here, then continue with the full lesson set when it becomes available.",
      },
    ],
    search_text: `${topic.title} starter lesson introduction overview`,
    order_index: 0,
  })

  await db.execute("BEGIN TRANSACTION")

  try {
    for (const subject of subjectRows) {
      await db.execute(
        `
        INSERT OR IGNORE INTO subjects (id, name, icon, description, order_index)
        VALUES (?, ?, ?, ?, ?)
        `,
        [
          subject.id,
          subject.name,
          subject.icon ?? null,
          subject.description ?? null,
          Number(subject.order_index ?? 0),
        ]
      )
    }

    for (const topic of topicRows) {
      await db.execute(
        `
        INSERT OR IGNORE INTO topics (id, subject_id, topic_number, title, order_index)
        VALUES (?, ?, ?, ?, ?)
        `,
        [
          topic.id,
          topic.subject_id,
          String(topic.topic_number ?? "0"),
          topic.title,
          Number(topic.order_index ?? 0),
        ]
      )
    }

    for (const topic of topicRows) {
      const draftLesson = lessonsByTopic.get(topic.id) ?? buildFallbackLesson(topic)

      const normalizedTitle = String(draftLesson.title || topic.title).trim()
      const normalizedSlug = String(draftLesson.slug || normalizedTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || topic.id).trim()
      const blocksValue = typeof draftLesson.blocks === "string" ? draftLesson.blocks : JSON.stringify(draftLesson.blocks ?? [])
      const summary = String(draftLesson.summary ?? "").trim()
      const searchText = [
        normalizedTitle,
        summary,
        normalizeSeedText(draftLesson.blocks),
        normalizeSeedText(draftLesson.search_text),
      ]
        .filter(Boolean)
        .join(" ")
        .trim()

      await db.execute(
        `
        INSERT OR IGNORE INTO lessons (
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
          draftLesson.id,
          draftLesson.topic_id,
          draftLesson.subject_id,
          String(draftLesson.topic_number ?? topic.topic_number ?? "0"),
          normalizedSlug,
          normalizedTitle,
          summary || null,
          blocksValue,
          searchText || null,
          Number(draftLesson.order_index ?? 0),
        ]
      )
    }

    await db.execute("COMMIT")
    console.log("✅ Starter lesson seed inserted from bundled curriculum")
  } catch (error) {
    await db.execute("ROLLBACK")
    console.error("Failed to seed starter lesson data:", error)
    throw error
  }
}

// ============================================================
// LESSON DATABASE
// lessons.db
// ============================================================

async function initializeLessonsSchema(db: any) {

  console.log("🔧 Checking lessons.db tables...")


  // ==========================================================
  // SUBJECTS
  // ==========================================================

  await db.execute(`
    CREATE TABLE IF NOT EXISTS subjects (

      id TEXT PRIMARY KEY,

      name TEXT NOT NULL,

      icon TEXT,

      description TEXT,

      order_index INTEGER DEFAULT 0,

      created_at TEXT DEFAULT CURRENT_TIMESTAMP,

      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)


  // ==========================================================
  // SUBJECT MIGRATION
  // Add order_index to old databases
  // ==========================================================

  const hasSubjectOrderIndex =
    await columnExists(
      db,
      "subjects",
      "order_index"
    )

  if (!hasSubjectOrderIndex) {

    console.log(
      "➕ Adding order_index to subjects..."
    )

    await db.execute(`
      ALTER TABLE subjects
      ADD COLUMN order_index INTEGER DEFAULT 0
    `)

    console.log(
      "✅ subjects.order_index added"
    )
  }

  const hasSubjectDescription = await columnExists(
    db,
    "subjects",
    "description"
  )

  if (!hasSubjectDescription) {
    await db.execute(`
      ALTER TABLE subjects
      ADD COLUMN description TEXT
    `)
  }


  // ==========================================================
  // TOPICS
  // ==========================================================

  await db.execute(`
    CREATE TABLE IF NOT EXISTS topics (

      id TEXT PRIMARY KEY,

      subject_id TEXT NOT NULL,

      topic_number INTEGER,

      title TEXT NOT NULL,

      order_index INTEGER DEFAULT 0,

      created_at TEXT DEFAULT CURRENT_TIMESTAMP,

      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY(subject_id)
        REFERENCES subjects(id)
        ON DELETE CASCADE
    )
  `)


  // ==========================================================
  // TOPIC MIGRATION
  // Add order_index to old databases
  // ==========================================================

  const hasTopicOrderIndex =
    await columnExists(
      db,
      "topics",
      "order_index"
    )

  if (!hasTopicOrderIndex) {

    console.log(
      "➕ Adding order_index to topics..."
    )

    await db.execute(`
      ALTER TABLE topics
      ADD COLUMN order_index INTEGER DEFAULT 0
    `)

    console.log(
      "✅ topics.order_index added"
    )
  }


  // ==========================================================
  // LESSONS
  // ==========================================================

  await db.execute(`
    CREATE TABLE IF NOT EXISTS lessons (

      id TEXT PRIMARY KEY,

      topic_id TEXT NOT NULL,

      subject_id TEXT,

      topic_number INTEGER,

      slug TEXT,

      title TEXT NOT NULL,

      summary TEXT,

      blocks TEXT,

      search_text TEXT,

      order_index INTEGER DEFAULT 0,

      teaching_score INTEGER,

      teaching_level TEXT,

      teaching_feedback TEXT,

      created_at TEXT DEFAULT CURRENT_TIMESTAMP,

      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY(topic_id)
        REFERENCES topics(id)
        ON DELETE CASCADE
    )
  `)


  // ==========================================================
  // LESSON MIGRATION
  // Add order_index to old databases
  // ==========================================================

  const hasLessonOrderIndex =
    await columnExists(
      db,
      "lessons",
      "order_index"
    )

  if (!hasLessonOrderIndex) {

    console.log(
      "➕ Adding order_index to lessons..."
    )

    await db.execute(`
      ALTER TABLE lessons
      ADD COLUMN order_index INTEGER DEFAULT 0
    `)

    console.log(
      "✅ lessons.order_index added"
    )
  }

  const lessonScoreColumns = [
    ["teaching_score", "INTEGER"],
    ["teaching_level", "TEXT"],
    ["teaching_feedback", "TEXT"],
  ] as const

  for (const [columnName, columnType] of lessonScoreColumns) {
    if (await columnExists(db, "lessons", columnName)) {
      continue
    }

    await db.execute(
      `ALTER TABLE lessons ADD COLUMN ${columnName} ${columnType}`
    )
  }

  // ==========================================================
  // LESSON INDEXES
  // ==========================================================

  await db.execute(`
    CREATE INDEX IF NOT EXISTS
    idx_topics_subject
    ON topics(subject_id)
  `)

  await db.execute(`
    CREATE INDEX IF NOT EXISTS
    idx_topics_order
    ON topics(subject_id, order_index)
  `)

  await db.execute(`
    CREATE INDEX IF NOT EXISTS
    idx_lessons_topic
    ON lessons(topic_id)
  `)

  await db.execute(`
    CREATE INDEX IF NOT EXISTS
    idx_lessons_subject
    ON lessons(subject_id)
  `)

  await db.execute(`
    CREATE INDEX IF NOT EXISTS
    idx_lessons_order
    ON lessons(topic_id, order_index)
  `)

  await db.execute(`
    CREATE INDEX IF NOT EXISTS
    idx_lessons_slug
    ON lessons(slug)
  `)


  // ==========================================================
  // SUBJECT ORDER INDEX
  // ==========================================================

  await db.execute(`
    CREATE INDEX IF NOT EXISTS
    idx_subjects_order
    ON subjects(order_index)
  `)


  // ==========================================================
  // LESSON FULL TEXT SEARCH
  // ==========================================================

  const ftsExists = await tableExists(
    db,
    "lessons_fts"
  )

  if (!ftsExists) {

    console.log(
      "🔎 Creating lessons_fts..."
    )

    await db.execute(`
      CREATE VIRTUAL TABLE lessons_fts
      USING fts5(
        title,
        summary,
        search_text,
        content='lessons',
        content_rowid='rowid'
      )
    `)

    console.log(
      "✅ lessons_fts created"
    )

  } else {

    console.log(
      "✅ lessons_fts already exists"
    )
  }

  console.log("✅ lessons.db ready")
}


// ============================================================
// DICTIONARY DATABASE
// dictionary.db
// ============================================================

async function initializeDictionaryDatabase(
  db: any
) {
  await db.select(`
    SELECT word, meaning, part_of_speech, example, has_definition
    FROM dictionary
    LIMIT 0
  `)

  console.info("Bundled dictionary resource is ready")
}


// ============================================================
// GET CBT DATABASE
// ============================================================

async function openAndInitializeDatabase(
  name: DatabaseName,
  initialize: (db: SqlDatabase) => Promise<void>,
  connectionString = `sqlite:${name}`,
  readOnly = false,
): Promise<SqlDatabase> {
  if (databaseConnections[name]) {
    return databaseConnections[name]!
  }

  if (!databasePromises[name]) {
    databasePromises[name] = (async () => {
      console.info("[database] opening", {
        database: name,
        mode: readOnly ? "read-only bundled" : "writable application",
      })

      try {
        const db = await Database.load(connectionString)

        if (!readOnly) {
          await db.execute("PRAGMA busy_timeout = 10000")
          await db.execute("PRAGMA journal_mode = WAL")
          await db.execute("PRAGMA synchronous = NORMAL")
        }

        await initialize(db)
        databaseConnections[name] = db
        console.info("[database] opened and validated", {
          database: name,
          mode: readOnly ? "read-only bundled" : "writable application",
        })
        return db
      } catch (error) {
        console.error("[database] open or initialization failed", {
          database: name,
          mode: readOnly ? "read-only bundled" : "writable application",
          error,
        })
        throw new Error(
          `Failed to open or initialize ${name}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        )
      }
    })().catch((error) => {
      delete databasePromises[name]
      throw error
    })
  }

  return databasePromises[name]!
}

async function openBundledContentDatabase(
  name: ContentDatabaseName
): Promise<SqlDatabase> {
  if (bundledContentConnections[name]) {
    return bundledContentConnections[name]!
  }

  if (!bundledContentPromises[name]) {
    bundledContentPromises[name] = (async () => {
      const connectionString = `sqlite:bundled-${name}?mode=ro`
      const db = await Database.load(connectionString)

      if (name === "questions.db") {
        await db.select(`
          SELECT
            id,
            question,
            question_html,
            options,
            options_html,
            answer,
            examType,
            subject,
            year,
            section,
            topic,
            category,
            difficulty,
            source,
            solution,
            solution_html,
            imageUrl,
            hasPassage,
            passage,
            passage_html,
            country,
            institution,
            state
          FROM questions
          LIMIT 0
        `)
      } else {
        await db.select(`
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
            order_index,
            teaching_score,
            teaching_level,
            teaching_feedback
          FROM lessons
          LIMIT 0
        `)

        await db.select("SELECT rowid FROM lessons_fts LIMIT 0")
      }

      bundledContentConnections[name] = db
      console.info("[database] bundled database opened read-only", {
        database: name,
      })
      return db
    })().catch((error) => {
      console.error("[database] bundled database open or validation failed", {
        database: name,
        mode: "read-only bundled",
        error,
      })
      delete bundledContentPromises[name]
      throw new Error(
        `Failed to open or validate bundled ${name}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      )
    })
  }

  return bundledContentPromises[name]!
}

function getInitializedDatabase(name: DatabaseName): Promise<SqlDatabase> {
  const db = databaseConnections[name]
  if (!db) {
    throw new Error(
      `${name} has not been initialized. Initialize application databases during desktop startup first.`
    )
  }

  return Promise.resolve(db)
}

export function getDB(): Promise<SqlDatabase> {
  return getInitializedDatabase("cbt.db")
}


// ============================================================
// GET QUESTIONS DATABASE
// ============================================================

export function getQuestionsDB(): Promise<SqlDatabase> {

  if (!isSoftwareActivated()) {
    return openBundledContentDatabase("questions.db")
  }

  return openAndInitializeDatabase(
    "questions.db",
    initializeQuestionsDatabase
  )
}


// ============================================================
// GET LESSON DATABASE
// ============================================================

export function getLessonsDB(): Promise<SqlDatabase> {
  if (!isSoftwareActivated()) {
    return openBundledContentDatabase("lessons.db")
  }

  return openAndInitializeDatabase(
    "lessons.db",
    initializeLessonsSchema
  )
}


// ============================================================
// GET DICTIONARY DATABASE
// ============================================================

export async function getDictDB(): Promise<SqlDatabase> {
  return openAndInitializeDatabase(
    "dictionary.db",
    initializeDictionaryDatabase,
    "sqlite:bundled-dictionary.db?mode=ro",
    true,
  )
}

export function getDatabase(
  connectionString: string
): Promise<SqlDatabase> {
  switch (connectionString) {
    case "sqlite:cbt.db":
    case "cbt.db":
      return getDB()
    case "sqlite:questions.db":
    case "questions.db":
      return getQuestionsDB()
    case "sqlite:lessons.db":
    case "lessons.db":
      return getLessonsDB()
    case "sqlite:dictionary.db":
    case "dictionary.db":
      return getDictDB()
    default:
      throw new Error(
        `Unsupported database connection: ${connectionString}`
      )
  }
}

export async function initializeDatabase(): Promise<void> {
  await openAndInitializeDatabase(
    "cbt.db",
    initializeCbtDatabase
  )
}

export async function initializeLessonsDatabase(): Promise<void> {
  await getLessonsDB()
}

export function initializeDatabases(): Promise<void> {
  if (!applicationDatabasesPromise) {
    applicationDatabasesPromise = (async () => {
      await openAndInitializeDatabase("cbt.db", initializeCbtDatabase)
      await getDictDB()

      if (isSoftwareActivated()) {
        await getQuestionsDB()
        await getLessonsDB()
      } else {
        await openBundledContentDatabase("questions.db")
        await openBundledContentDatabase("lessons.db")
      }
    })().catch((error) => {
      applicationDatabasesPromise = null
      throw error
    })
  }

  return applicationDatabasesPromise
}

export async function debugCBTDatabaseLocation() {
  const db = await getDB()
  const result = await db.select("PRAGMA database_list")

  console.log(
    "📍 CBT DATABASE LOCATION:",
    JSON.stringify(result, null, 2)
  )

  return result
}


// ============================================================
// DEBUG DATABASE LOCATION
// ============================================================

export async function debugDatabases() {

  const databases = [

    {
      name: "cbt.db",
      db: await getDB()
    },

    {
      name: "questions.db",
      db: await getQuestionsDB()
    },

    {
      name: "lessons.db",
      db: await getLessonsDB()
    },

    {
      name: "dictionary.db",
      db: await getDictDB()
    }

  ]


  for (
    const database of databases
  ) {

    const result =
      await database.db.select(`
        PRAGMA database_list
      `)

    console.log(
      `📍 ${database.name}:`,
      JSON.stringify(
        result,
        null,
        2
      )
    )
  }
}