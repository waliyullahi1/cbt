import { ref, computed, watch } from 'vue'
import platform from '~/platforms'

/* =========================================================
   TYPES
========================================================= */

export interface ClassroomSubject {
  id: string | number
  slug?: string
  name: string
  icon?: string
  color?: string
  topicCount?: number
  lessonCount?: number
  [key: string]: any
}

export interface SubjectProgress {
  totalLessons: number
  completedLessons: string[]
}

interface ClassroomStorage {
  subjects: ClassroomSubject[]
  progress: Record<string, SubjectProgress>
}

/* =========================================================
   SHARED STATE
   Nuxt useState keeps the state shared across pages
========================================================= */

const currentUser = useState<string>(
  'classroom-current-user',
  () => 'default-user'
)

const studySubjects = useState<ClassroomSubject[]>(
  'classroom-study-subjects',
  () => []
)

const progressData = useState<Record<string, SubjectProgress>>(
  'classroom-progress-data',
  () => ({})
)

const isLoaded = useState<boolean>(
  'classroom-is-loaded',
  () => false
)

const availableSubjects = useState<ClassroomSubject[]>(
  'classroom-available-subjects',
  () => []
)

const availableSubjectsLoading = useState<boolean>(
  'classroom-available-subjects-loading',
  () => false
)

const availableSubjectsError = useState<string>(
  'classroom-available-subjects-error',
  () => ''
)

/* =========================================================
   HELPERS
========================================================= */

const normalizeUser = (user: unknown): string => {
  const value = String(user || '').trim()

  return value || 'default-user'
}

const normalizeId = (id: unknown): string => {
  return String(id ?? '').trim()
}

const storageKey = (user: string): string => {
  const safeUser = normalizeUser(user)
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')

  return `cbt-classroom-${safeUser}`
}

const emptyProgress = (): SubjectProgress => ({
  totalLessons: 0,
  completedLessons: []
})

const getSubjectId = (subject: any): string => {
  return normalizeId(subject?.id || subject?._id || subject?.slug)
}

/* =========================================================
   EXTRACT LESSONS FROM A SUBJECT
   Supports different subject structures
========================================================= */

const getLessonsFromSubject = (subject: any): any[] => {
  if (!subject) return []

  if (Array.isArray(subject.lessons)) {
    return subject.lessons
  }

  if (Array.isArray(subject.topics)) {
    return subject.topics.flatMap((topic: any) => {
      if (Array.isArray(topic.lessons)) {
        return topic.lessons
      }

      if (Array.isArray(topic.contents)) {
        return topic.contents
      }

      return []
    })
  }

  if (Array.isArray(subject.chapters)) {
    return subject.chapters.flatMap((chapter: any) => {
      if (Array.isArray(chapter.lessons)) {
        return chapter.lessons
      }

      return []
    })
  }

  return []
}

export const getSubjectLessonCount = (subject: any): number => {
  if (!subject) return 0

  const lessons = getLessonsFromSubject(subject)

  if (Array.isArray(lessons) && lessons.length > 0) {
    return lessons.length
  }

  const lessonCount = Number(subject?.lessonCount ?? subject?.questionCount)
  if (Number.isFinite(lessonCount) && lessonCount > 0) {
    return lessonCount
  }

  if (Array.isArray(subject?.topics)) {
    return subject.topics.reduce((total: number, topic: any) => {
      const topicLessons = Array.isArray(topic?.lessons)
        ? topic.lessons.length
        : Array.isArray(topic?.contents)
          ? topic.contents.length
          : 0
      return total + topicLessons
    }, 0)
  }

  return 0
}

/* =========================================================
   SAVE CURRENT USER DATA
========================================================= */

const saveClassroom = (): void => {
  if (!import.meta.client) return

  const payload: ClassroomStorage = {
    subjects: studySubjects.value,
    progress: progressData.value
  }

  localStorage.setItem(
    storageKey(currentUser.value),
    JSON.stringify(payload)
  )
}

/* =========================================================
   LOAD A USER'S CLASSROOM
========================================================= */

const loadUserClassroom = (user: string): void => {
  if (!import.meta.client) return

  const normalizedUser = normalizeUser(user)

  currentUser.value = normalizedUser

  const savedData = localStorage.getItem(
    storageKey(normalizedUser)
  )

  if (!savedData) {
    studySubjects.value = []
    progressData.value = {}
    isLoaded.value = true
    return
  }

  try {
    const parsed: ClassroomStorage = JSON.parse(savedData)

    studySubjects.value = Array.isArray(parsed.subjects)
      ? parsed.subjects
      : []

    progressData.value =
      parsed.progress && typeof parsed.progress === 'object'
        ? parsed.progress
        : {}

    isLoaded.value = true
  } catch (error) {
    console.error('Failed to load classroom data:', error)

    studySubjects.value = []
    progressData.value = {}
    isLoaded.value = true
  }
}

/* =========================================================
   MAIN COMPOSABLE
========================================================= */

export const useClassroom = () => {
  const appState = useAppState()

  const loadAvailableSubjects = async (): Promise<void> => {
    availableSubjectsLoading.value = true
    availableSubjectsError.value = ''

    try {
      const subjects = await platform.lesson.getSubjects()
      console.log(subjects, 'subjectssubjectssubjects');
      
      availableSubjects.value = subjects

      const subjectsById = new Map(
        subjects.map((subject) => [normalizeId(subject.id), subject])
      )

      studySubjects.value = studySubjects.value.map((selectedSubject) => {
        const availableSubject = subjectsById.get(
          getSubjectId(selectedSubject)
        )
        return availableSubject
          ? { ...selectedSubject, ...availableSubject }
          : selectedSubject
      })

      studySubjects.value.forEach((subject) => {
        const count = getSubjectLessonCount(subject)
        if (count > 0) {
          setSubjectTotalLessons(getSubjectId(subject), count)
        }
      })
    } catch (error) {
      console.error('Failed to load subjects from lessons database:', error)
      availableSubjects.value = []
      availableSubjectsError.value =
        error instanceof Error ? error.message : String(error)
    } finally {
      availableSubjectsLoading.value = false
    }
  }

  /* ---------------------------------------------
     Keep classroom synced with selected user
  --------------------------------------------- */

  if (import.meta.client) {
    watch(
      () => appState.currentsuser,
      (newUser) => {
        const normalizedUser = normalizeUser(newUser)

        if (normalizedUser !== currentUser.value) {
          saveClassroom()
          loadUserClassroom(normalizedUser)
        }
      },
      {
        immediate: true
      }
    )
  }

  /* ---------------------------------------------
     Automatically save selected subjects
  --------------------------------------------- */

  if (import.meta.client) {
    watch(
      studySubjects,
      () => {
        if (isLoaded.value) {
          saveClassroom()
        }
      },
      {
        deep: true
      }
    )

    watch(
      progressData,
      () => {
        if (isLoaded.value) {
          saveClassroom()
        }
      },
      {
        deep: true
      }
    )
  }

  /* =========================================================
     LOAD CLASSROOM
  ========================================================= */

  const loadClassroom = (): void => {
    const user = normalizeUser(
      appState.currentsuser || currentUser.value
    )

    loadUserClassroom(user)
  }

  /* =========================================================
     CHANGE USER
  ========================================================= */

  const setCurrentUser = (user: string): void => {
    const normalizedUser = normalizeUser(user)

    if (normalizedUser === currentUser.value) return

    saveClassroom()
    loadUserClassroom(normalizedUser)
  }

  /* =========================================================
     SAVE SUBJECTS DIRECTLY
  ========================================================= */

  const setSubjects = (
    subjects: ClassroomSubject[]
  ): void => {
    studySubjects.value = Array.isArray(subjects)
      ? subjects
      : []

    saveClassroom()
  }

  /* =========================================================
     ADD SUBJECTS
     Prevent duplicate subjects
  ========================================================= */

  const addSubjects = (
    subjects: ClassroomSubject[]
  ): void => {
    if (!Array.isArray(subjects)) return

    const existingIds = new Set(
      studySubjects.value.map((subject) =>
        getSubjectId(subject)
      )
    )

    const newSubjects = subjects.filter((subject) => {
      const id = getSubjectId(subject)

      if (!id || existingIds.has(id)) {
        return false
      }

      existingIds.add(id)
      return true
    })

    studySubjects.value.push(...newSubjects)

    saveClassroom()
  }

  /* =========================================================
     ADD ONE SUBJECT
  ========================================================= */

  const addSubject = (
    subject: ClassroomSubject
  ): void => {
    if (!subject) return

    addSubjects([subject])
  }

  /* =========================================================
     REMOVE SUBJECT
  ========================================================= */

  const removeSubject = (
    subjectId: string | number
  ): void => {
    const id = normalizeId(subjectId)

    studySubjects.value = studySubjects.value.filter(
      (subject) => getSubjectId(subject) !== id
    )

    /*
      Keep progress saved even if subject is removed.
      This allows the progress to return if the subject
      is selected again later.
    */

    saveClassroom()
  }

  /* =========================================================
     REORDER SUBJECTS
  ========================================================= */

  const reorderSubject = (
    subjectId: string | number,
    direction: 'up' | 'down'
  ): void => {
    const index = studySubjects.value.findIndex(
      (subject) => getSubjectId(subject) === normalizeId(subjectId)
    )

    if (index === -1) return

    const targetIndex =
      direction === 'up'
        ? index - 1
        : index + 1

    if (
      targetIndex < 0 ||
      targetIndex >= studySubjects.value.length
    ) {
      return
    }

    const subjects = [...studySubjects.value]

    const [selectedSubject] = subjects.splice(index, 1)

    subjects.splice(targetIndex, 0, selectedSubject)

    studySubjects.value = subjects

    saveClassroom()
  }

  /* =========================================================
     FIND SUBJECT
  ========================================================= */

  const findSubject = (
    subjectId: string | number
  ): ClassroomSubject | undefined => {
    const id = normalizeId(subjectId)

    return studySubjects.value.find(
      (subject) => getSubjectId(subject) === id
    )
  }

  /* =========================================================
     SET TOTAL LESSONS FOR A SUBJECT
  ========================================================= */

  const setSubjectTotalLessons = (
    subjectId: string | number,
    totalLessons: number
  ): void => {
    const id = normalizeId(subjectId)

    if (!id) return

    if (!progressData.value[id]) {
      progressData.value[id] = emptyProgress()
    }

    progressData.value[id].totalLessons = Math.max(
      0,
      Number(totalLessons) || 0
    )

    saveClassroom()
  }

  /* =========================================================
     MARK LESSON AS READ
  ========================================================= */

  const markLessonAsRead = (
    subjectId: string | number,
    lesson: any,
    totalLessons?: number
  ): void => {
    const subjectKey = normalizeId(subjectId)

    if (!subjectKey || !lesson) return

    const lessonId = normalizeId(
      lesson.id ||
      lesson._id ||
      lesson.slug ||
      lesson.lessonId ||
      lesson.title
    )

    if (!lessonId) return

    if (!progressData.value[subjectKey]) {
      progressData.value[subjectKey] = emptyProgress()
    }

    const subjectProgress = progressData.value[subjectKey]

    if (
      typeof totalLessons === 'number' &&
      totalLessons > 0
    ) {
      subjectProgress.totalLessons = totalLessons
    }

    if (
      !subjectProgress.completedLessons.includes(lessonId)
    ) {
      subjectProgress.completedLessons.push(lessonId)
    }

    saveClassroom()
  }

  /* =========================================================
     CHECK LESSON READ STATUS
  ========================================================= */

  const isLessonRead = (
    subjectId: string | number,
    lesson: any
  ): boolean => {
    const subjectKey = normalizeId(subjectId)

    const lessonId = normalizeId(
      lesson?.id ||
      lesson?._id ||
      lesson?.slug ||
      lesson?.lessonId ||
      lesson?.title
    )

    return Boolean(
      progressData.value[subjectKey]?.completedLessons?.includes(
        lessonId
      )
    )
  }

  /* =========================================================
     GET SUBJECT PROGRESS
  ========================================================= */

  const progressFor = (
    subjectId: string | number
  ): number => {
    const id = normalizeId(subjectId)

    const subject = findSubject(id)

    const savedProgress = progressData.value[id]

    let totalLessons =
      savedProgress?.totalLessons || 0

    /*
      If total lessons were not saved yet,
      try calculating from the subject object.
    */

    if (!totalLessons && subject) {
      totalLessons = getSubjectLessonCount(subject)
    }

    const completedLessons =
      savedProgress?.completedLessons?.length || 0

    if (!totalLessons) return 0

    return Math.min(
      100,
      Math.round((completedLessons / totalLessons) * 100)
    )
  }

  /* =========================================================
     GET PROGRESS OBJECT
  ========================================================= */

  const progressForSubject = (
    subjectId: string | number
  ): SubjectProgress => {
    const id = normalizeId(subjectId)

    return (
      progressData.value[id] || {
        totalLessons: 0,
        completedLessons: []
      }
    )
  }

  /* =========================================================
     CALCULATE ALL PROGRESS
  ========================================================= */

  const loadAllProgress = (): void => {
    studySubjects.value.forEach((subject) => {
      const id = getSubjectId(subject)

      if (!id) return

      const lessonCount = getSubjectLessonCount(subject)

      if (lessonCount > 0) {
        setSubjectTotalLessons(id, lessonCount)
      }
    })

    saveClassroom()
  }

  /* =========================================================
     TOTAL LESSONS
  ========================================================= */

  const totalLessons = computed(() => {
    return studySubjects.value.reduce((total, subject) => {
      const id = getSubjectId(subject)

      const savedTotal =
        progressData.value[id]?.totalLessons || 0

      const calculatedTotal = getSubjectLessonCount(subject)

      return total + Math.max(savedTotal, calculatedTotal)
    }, 0)
  })

  /* =========================================================
     COMPLETED LESSONS
  ========================================================= */

  const completedLessons = computed(() => {
    return Object.values(progressData.value).reduce(
      (total, progress) => {
        return total + (
          progress.completedLessons?.length || 0
        )
      },
      0
    )
  })

  /* =========================================================
     OVERALL PROGRESS
  ========================================================= */

  const overallProgress = computed(() => {
    if (!totalLessons.value) return 0

    return Math.min(
      100,
      Math.round(
        (completedLessons.value / totalLessons.value) * 100
      )
    )
  })

  /* =========================================================
     ADD USER
  ========================================================= */

  const addUser = (name: string): boolean => {
    const cleanName = String(name || '').trim()

    if (!cleanName) return false

    if (!Array.isArray(appState.users)) {
      appState.users = []
    }

    const exists = appState.users.some(
      (user: string) =>
        normalizeUser(user).toLowerCase() ===
        cleanName.toLowerCase()
    )

    if (!exists) {
      appState.users.push(cleanName)
    }

    appState.currentsuser = cleanName

    setCurrentUser(cleanName)

    return true
  }

  return {
    currentUser,
    studySubjects,
    availableSubjects,
    availableSubjectsLoading,
    availableSubjectsError,
    progressData,
    isLoaded,

    loadAvailableSubjects,
    loadClassroom,
    loadAllProgress,
    saveClassroom,

    setCurrentUser,
    setSubjects,
    addSubjects,
    addSubject,
    addUser,

    findSubject,
    removeSubject,
    reorderSubject,

    setSubjectTotalLessons,
    markLessonAsRead,
    isLessonRead,

    progressFor,
    progressForSubject,

    getLessonsFromSubject,

    overallProgress,
    totalLessons,
    completedLessons
  }
}