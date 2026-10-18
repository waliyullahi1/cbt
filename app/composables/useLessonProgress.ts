import { ref, computed } from 'vue'

const STORAGE_KEY = 'lesson-progress'

export const useLessonProgress = () => {
  const lessonProgress = ref<Record<string, any>>({})

  const pendingSeconds = ref(0)
  const lastStorageSave = ref(0)

  const readingSeconds = ref(0)
  const estimatedReadingMinutes = ref(1)
  const readingTimer = ref<ReturnType<typeof setInterval> | null>(null)
  const lastActiveTickAt = ref(0)
  const readingCompleted = ref(false)

  /*
  |--------------------------------------------------------------------------
  | READING CALCULATIONS
  |--------------------------------------------------------------------------
  */

  const requiredReadingSeconds = computed(() => {
    return Math.max(
      60,
      Math.ceil(estimatedReadingMinutes.value * 60 * 0.8)
    )
  })

  const requiredReadingMinutes = computed(() => {
    return Math.ceil(requiredReadingSeconds.value / 60)
  })

  const readingProgressPercent = computed(() => {
    if (!requiredReadingSeconds.value) return 0

    return Math.min(
      100,
      Math.round(
        (readingSeconds.value / requiredReadingSeconds.value) * 100
      )
    )
  })

  const remainingReadingSeconds = computed(() => {
    return Math.max(
      0,
      requiredReadingSeconds.value - readingSeconds.value
    )
  })

  const remainingReadingMinutes = computed(() => {
    return Math.ceil(remainingReadingSeconds.value / 60)
  })

  /*
  |--------------------------------------------------------------------------
  | LESSON KEY
  |--------------------------------------------------------------------------
  */

  const lessonKeys = (lesson: any): string[] => {
    return [
      lesson?.slug,
      lesson?.id,
      lesson?._id,
      lesson?.lessonId,
    ]
      .map((value) => String(value ?? '').trim())
      .filter((value, index, keys) => value && keys.indexOf(value) === index)
  }

  const lessonKey = (lesson: any) => {
    return lessonKeys(lesson)[0] || ''
  }

  /*
  |--------------------------------------------------------------------------
  | LOAD PROGRESS
  |--------------------------------------------------------------------------
  */

  const loadLessonProgress = () => {
    if (!import.meta.client) return

    try {
      const saved = localStorage.getItem(STORAGE_KEY)

      lessonProgress.value = saved
        ? JSON.parse(saved)
        : {}
    } catch (error) {
      console.error('Failed to load lesson progress:', error)
      lessonProgress.value = {}
    }
  }

  /*
  |--------------------------------------------------------------------------
  | SAVE PROGRESS
  |--------------------------------------------------------------------------
  */

  const saveLessonProgress = () => {
    if (!import.meta.client) return

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(lessonProgress.value)
      )

      lastStorageSave.value = Date.now()
    } catch (error) {
      console.error('Failed to save lesson progress:', error)
    }
  }

  /*
  |--------------------------------------------------------------------------
  | SUBJECT RECORD
  |--------------------------------------------------------------------------
  */

  const getSubjectRecord = (subjectSlug: string) => {
    if (!subjectSlug) return null

    if (!lessonProgress.value[subjectSlug]) {
      lessonProgress.value[subjectSlug] = {
        totalSubjectProgress: 0,
        lessons: {},
      }
    }

    if (!lessonProgress.value[subjectSlug].lessons) {
      lessonProgress.value[subjectSlug].lessons = {}
    }

    return lessonProgress.value[subjectSlug]
  }

  /*
  |--------------------------------------------------------------------------
  | LESSON RECORD
  |--------------------------------------------------------------------------
  */

  const getLessonRecord = (
    subjectSlug: string,
    lesson: any
  ) => {
    const key = lessonKey(lesson)

    if (!subjectSlug || !key) return null

    const subject = getSubjectRecord(subjectSlug)

    const savedRecord = lessonKeys(lesson)
      .map((lessonId) => subject?.lessons?.[lessonId])
      .find(Boolean)

    return (
      savedRecord || {
        read: false,
        timeSpent: 0,
        lastRead: null,
      }
    )
  }

  const ensureLessonRecord = (
    subjectSlug: string,
    lesson: any
  ) => {
    const key = lessonKey(lesson)

    if (!subjectSlug || !key) return null

    const subject = getSubjectRecord(subjectSlug)

    if (!subject) return null

    if (!subject.lessons[key]) {
      const previousRecord = lessonKeys(lesson)
        .slice(1)
        .map((lessonId) => subject.lessons[lessonId])
        .find(Boolean)

      subject.lessons[key] = previousRecord || {
        read: false,
        timeSpent: 0,
        lastRead: null,
      }

      for (const lessonId of lessonKeys(lesson).slice(1)) {
        delete subject.lessons[lessonId]
      }
    }

    return subject.lessons[key]
  }

  /*
  |--------------------------------------------------------------------------
  | LESSON HELPERS
  |--------------------------------------------------------------------------
  */

  const getLessonTime = (
    subjectSlug: string,
    lesson: any
  ) => {
    return Number(
      getLessonRecord(subjectSlug, lesson)?.timeSpent || 0
    )
  }

  const isLessonRead = (
    subjectSlug: string,
    lesson: any
  ) => {
    return Boolean(
      getLessonRecord(subjectSlug, lesson)?.read
    )
  }

  /*
  |--------------------------------------------------------------------------
  | SUBJECT PROGRESS
  |--------------------------------------------------------------------------
  | Reads the already saved totalSubjectProgress.
  | It does not recalculate the percentage.
  |--------------------------------------------------------------------------
  */

  const getSubjectProgress = (subjectSlug: string) => {
    return Math.round(
      Number(
        lessonProgress.value[subjectSlug]?.totalSubjectProgress || 0
      )
    )
  }

  const getLastReadLessonSlug = (
    subjectSlug: string,
    availableLessons: any[] = [],
  ): string | null => {
    const subjectProgress = lessonProgress.value[subjectSlug]
    const progressLessons = subjectProgress?.lessons

    const lessonsByIdentifier = new Map<string, any>()
    for (const lesson of availableLessons) {
      for (const identifier of lessonKeys(lesson)) {
        lessonsByIdentifier.set(identifier, lesson)
      }
    }

    const savedLastLessonSlug = String(
      subjectProgress?.lastOpenedLessonSlug || '',
    ).trim()
    const savedLastLesson = lessonsByIdentifier.get(savedLastLessonSlug)
    if (savedLastLesson?.slug) {
      return String(savedLastLesson.slug)
    }
    if (savedLastLessonSlug) {
      return savedLastLessonSlug
    }

    if (!progressLessons || typeof progressLessons !== 'object') {
      return null
    }

    const lastReadLesson = Object.entries(progressLessons)
      .filter(([, record]: [string, any]) => record?.read === true)
      .map(([key, record]: [string, any]) => {
        const identifiers = [
          record?.slug,
          record?.lessonSlug,
          key,
        ]
          .map((value) => String(value ?? '').trim())
          .filter(Boolean)
        const matchingLesson = identifiers
          .map((identifier) => lessonsByIdentifier.get(identifier))
          .find(Boolean)

        return {
          slug: String(matchingLesson?.slug || record?.slug || record?.lessonSlug || '').trim(),
          lastRead: Date.parse(String(record?.lastRead || '')) || 0,
        }
      })
      .filter((record) => record.slug)
      .sort((a, b) => b.lastRead - a.lastRead)[0]

    return lastReadLesson?.slug || null
  }

  const recordLastOpenedLesson = (
    subjectSlug: string,
    lesson: any,
  ) => {
    const slug = String(lesson?.slug || '').trim()
    if (!subjectSlug || !slug) return

    const subject = getSubjectRecord(subjectSlug)
    if (!subject) return

    subject.lastOpenedLessonSlug = slug
    subject.lastOpenedAt = new Date().toISOString()
    saveLessonProgress()
  }

  /*
  |--------------------------------------------------------------------------
  | SAVE LESSON PROGRESS
  |--------------------------------------------------------------------------
  | When a lesson changes from unread to read:
  | totalSubjectProgress increases by 100 / totalLessons.
  |--------------------------------------------------------------------------
  */

  const saveLessonProgressRecord = (
    subjectSlug: string,
    lesson: any,
    progressData: {
      read?: boolean
      timeSpent?: number
      lastRead?: string | null
    },
    totalLessons: number
  ) => {
    const subject = getSubjectRecord(subjectSlug)

    if (!subject) return

    const id = lessonKey(lesson)

    if (!id) return

    const previousRecord = subject.lessons[id]

    const wasAlreadyRead = previousRecord?.read === true

    subject.lessons[id] = {
      ...previousRecord,
      ...progressData,
    }

    /*
     * Increase only once when lesson becomes read.
     */
    if (
      progressData.read === true &&
      !wasAlreadyRead &&
      totalLessons > 0
    ) {
      const increase = 100 / totalLessons

      subject.totalSubjectProgress = Math.min(
        100,
        Number(subject.totalSubjectProgress || 0) + increase
      )
    }

    saveLessonProgress()
  }

  /*
  |--------------------------------------------------------------------------
  | ADD READING TIME
  |--------------------------------------------------------------------------
  */

  const addReadingTime = (
    subjectSlug: string,
    lesson: any,
    seconds = 1
  ) => {
    if (!subjectSlug || !lesson || seconds <= 0) return

    const record = ensureLessonRecord(
      subjectSlug,
      lesson
    )

    if (!record) return

    record.timeSpent =
      Number(record.timeSpent || 0) + seconds

    record.lastRead = new Date().toISOString()

    pendingSeconds.value += seconds

    if (
      pendingSeconds.value >= 5 ||
      Date.now() - lastStorageSave.value >= 10000
    ) {
      saveLessonProgress()
      pendingSeconds.value = 0
    }
  }

  const flushReadingTime = () => {
    if (!pendingSeconds.value) return

    saveLessonProgress()
    pendingSeconds.value = 0
  }

  /*
  |--------------------------------------------------------------------------
  | MARK LESSON AS READ
  |--------------------------------------------------------------------------
  */

  const markLessonAsRead = (
    subjectSlug: string,
    lesson: any,
    totalLessons: number
  ) => {
    const record = ensureLessonRecord(
      subjectSlug,
      lesson
    )

    if (!record) return

    const wasAlreadyRead = record.read === true

    record.read = true
    record.slug = String(lesson?.slug || lessonKey(lesson))
    record.lastRead = new Date().toISOString()

    /*
     * Update total subject percentage only once.
     */
    if (
      !wasAlreadyRead &&
      totalLessons > 0
    ) {
      const subject = getSubjectRecord(subjectSlug)

      if (subject) {
        const increase = 100 / totalLessons

        subject.totalSubjectProgress = Math.min(
          100,
          Number(subject.totalSubjectProgress || 0) + increase
        )
      }
    }

    readingCompleted.value = true

    saveLessonProgress()
    pendingSeconds.value = 0

    stopReadingTimer()
  }

  /*
  |--------------------------------------------------------------------------
  | READING TEXT
  |--------------------------------------------------------------------------
  */

  const getLessonText = (lesson: any) => {
    if (!lesson) return ''

    const blocks = Array.isArray(lesson.blocks)
      ? lesson.blocks
          .map((block: any) => {
            if (typeof block === 'string') {
              return block
            }

            return [
              block?.content,
              block?.text,
              block?.body,
              block?.description,
              block?.title,
            ]
              .filter(Boolean)
              .join(' ')
          })
          .join(' ')
      : ''

    return [
      lesson.title,
      lesson.content,
      lesson.body,
      lesson.description,
      blocks,
    ]
      .filter(Boolean)
      .join(' ')
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  const calculateReadingTime = (lesson: any) => {
    const textContent = getLessonText(lesson)

    const wordCount = textContent
      ? textContent.split(/\s+/).filter(Boolean).length
      : 180

    estimatedReadingMinutes.value = Math.max(
      1,
      Math.ceil(wordCount / 150)
    )
  }

  /*
  |--------------------------------------------------------------------------
  | TIMER
  |--------------------------------------------------------------------------
  */

  const stopReadingTimer = () => {
    if (readingTimer.value) {
      clearInterval(readingTimer.value)
      readingTimer.value = null
    }

    lastActiveTickAt.value = 0
    flushReadingTime()
  }

  const isReadingPageActive = () => {
    return (
      import.meta.client &&
      document.visibilityState === 'visible' &&
      document.hasFocus()
    )
  }

  const startReadingTimer = (
    subjectSlug: string,
    lesson: any
  ) => {
    if (
      !import.meta.client ||
      !lesson ||
      readingTimer.value ||
      readingCompleted.value
    ) {
      return
    }

    if (isLessonRead(subjectSlug, lesson)) {
      readingCompleted.value = true
      return
    }

    readingTimer.value = setInterval(() => {
      if (readingCompleted.value) {
        return
      }

      if (!isReadingPageActive()) {
        lastActiveTickAt.value = 0
        return
      }

      const now = Date.now()
      const elapsedSeconds = lastActiveTickAt.value
        ? Math.floor((now - lastActiveTickAt.value) / 1000)
        : 1

      if (elapsedSeconds <= 0) {
        return
      }

      lastActiveTickAt.value = now
      readingSeconds.value += elapsedSeconds

      addReadingTime(
        subjectSlug,
        lesson,
        elapsedSeconds
      )

    }, 1000)
  }

  const resetReadingTracker = (
    subjectSlug: string,
    lesson: any
  ) => {
    stopReadingTimer()

    pendingSeconds.value = 0
    readingCompleted.value = false

    calculateReadingTime(lesson)

    readingSeconds.value = getLessonTime(
      subjectSlug,
      lesson
    )

    if (isLessonRead(subjectSlug, lesson)) {
      readingCompleted.value = true

      readingSeconds.value = Math.max(
        readingSeconds.value,
        requiredReadingSeconds.value
      )

      return
    }

    startReadingTimer(
      subjectSlug,
      lesson
    )
  }

  /*
  |--------------------------------------------------------------------------
  | FORMAT TIME
  |--------------------------------------------------------------------------
  */

  const formatReadingTime = (seconds = 0) => {
    const totalSeconds = Math.max(
      0,
      Math.floor(seconds)
    )

    const hours = Math.floor(totalSeconds / 3600)

    const minutes = Math.floor(
      (totalSeconds % 3600) / 60
    )

    const remainingSeconds = totalSeconds % 60

    if (hours > 0) {
      return [
        hours,
        minutes,
        remainingSeconds,
      ]
        .map((value) =>
          String(value).padStart(2, '0')
        )
        .join(':')
    }

    return [
      minutes,
      remainingSeconds,
    ]
      .map((value) =>
        String(value).padStart(2, '0')
      )
      .join(':')
  }


 const pruneLessonProgress = (subjects: any[]) => {
  const normalize = (value: unknown) =>
    String(value ?? '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')

  // Build what is valid now: subject -> its lesson identifiers and lesson count
  const valid = new Map<string, { ids: Set<string>; total: number }>()

  for (const subject of subjects) {
    const ids = new Set<string>()
    let total = 0

    for (const topic of subject.topics ?? []) {
      for (const lesson of topic.lessons ?? []) {
        lessonKeys(lesson).forEach((key) => ids.add(key))
        total++
      }
    }

    const entry = { ids, total }
    valid.set(String(subject.id), entry)
    valid.set(normalize(subject.name), entry)
  }

  for (const subjectSlug of Object.keys(lessonProgress.value)) {
    const entry = valid.get(subjectSlug)

    // Subject no longer exists: remove all its progress
    if (!entry) {
      delete lessonProgress.value[subjectSlug]
      continue
    }

    const record = lessonProgress.value[subjectSlug]
    record.lessons = record.lessons ?? {}

    // Remove records of lessons that no longer exist
    for (const key of Object.keys(record.lessons)) {
      if (!entry.ids.has(key)) delete record.lessons[key]
    }

    // Recalculate the total from what is really read
    const readCount = Object.values(record.lessons)
      .filter((item: any) => item?.read === true).length

    record.totalSubjectProgress = entry.total
      ? Math.min(100, (readCount / entry.total) * 100)
      : 0

    // Clear "continue reading" if that lesson is gone
    if (
      record.lastOpenedLessonSlug &&
      !entry.ids.has(record.lastOpenedLessonSlug)
    ) {
      delete record.lastOpenedLessonSlug
      delete record.lastOpenedAt
    }
  }

  saveLessonProgress()
}
  return {
    lessonProgress,

    readingSeconds,
    estimatedReadingMinutes,
    readingCompleted,

    requiredReadingSeconds,
    requiredReadingMinutes,
    readingProgressPercent,
    remainingReadingSeconds,
    remainingReadingMinutes,

    lessonKey,

    loadLessonProgress,
    saveLessonProgress,

    getSubjectRecord,
    getLessonRecord,
    ensureLessonRecord,

    getLessonTime,
    isLessonRead,
    getSubjectProgress,
    getLastReadLessonSlug,
    recordLastOpenedLesson,

    saveLessonProgressRecord,

    addReadingTime,
    flushReadingTime,
    markLessonAsRead,

    startReadingTimer,
    stopReadingTimer,
    resetReadingTracker,

    formatReadingTime,
    pruneLessonProgress
  }
}

