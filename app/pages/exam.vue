<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue"
import { getCurrentWindow } from "@tauri-apps/api/window"
import { durationToSeconds, secondsToDuration } from "~/utils/examTime"
import { isMobileTauri } from "~/utils/isMobileTauri"

const appState = useAppState()
const { save } = useExamHistory()

// ==========================================
// SAFE HELPERS
// ==========================================

const isTauri = () =>
  typeof window !== "undefined" && !!window.__TAURI_INTERNALS__

// Never call getCurrentWindow() outside Tauri, it throws in a browser
let appWindow = null
const getWindow = () => {
  if (appWindow) return appWindow
  if (!isTauri()) return null
  try {
    appWindow = getCurrentWindow()
  } catch {
    appWindow = null
  }
  return appWindow
}

// renderMath that can never break the page
const safeRender = (value) => {
  if (value === null || value === undefined || value === "") return ""
  try {
    return renderMath(String(value))
  } catch (error) {
    console.error("renderMath failed:", error)
    return String(value)
  }
}

// ==========================================
// STATE
// ==========================================

const questionStartTime = ref(0)
const currentSubject = ref(null)
const currentQuestion = ref(null)
const Submitted = ref(false)
const isSubmitting = ref(false)
const showExamReport = ref(false)
const showSubmitModal = ref(false)
const examHeader = ref(null)
const groupedSubjects = ref([])
const activeSubject = ref(null)
const startingDate = ref(null)
const loadError = ref("")

const showMobileQuestionList = ref(false)
const showBookmarkModal = ref(false)
const bookmarkedQuestion = ref({})

const hasQuestions = computed(
  () =>
    groupedSubjects.value.length > 0 &&
    !!currentSubject.value &&
    !!currentQuestion.value
)

const openMobileQuestionList = () => (showMobileQuestionList.value = true)
const closeMobileQuestionList = () => (showMobileQuestionList.value = false)

// ==========================================
// QUESTION TIMER
// ==========================================

const startQuestionTimer = () => {
  questionStartTime.value = Date.now()
}

const saveQuestionTime = () => {
  if (!currentQuestion.value || Submitted.value) return

  const seconds = Math.floor((Date.now() - questionStartTime.value) / 1000)

  currentQuestion.value.timeSpent =
    (currentQuestion.value.timeSpent || 0) + Math.max(0, seconds)
}

// ==========================================
// NAVIGATION
// ==========================================

const setCurrent = (subject, questionNumber = 1) => {
  const list = subject?.questions || []
  if (!list.length) return false

  const number = Math.min(Math.max(1, questionNumber), list.length)

  currentSubject.value = subject
  currentSubject.value.currentQuestion = number
  currentQuestion.value = list[number - 1]
  activeSubject.value = subject.id
  return true
}

const selectSubject = (subject) => {
  if (!subject) return

  const target = groupedSubjects.value.find((item) => item.id === subject.id)
  if (!target) return

  saveQuestionTime()
  setCurrent(target, target.currentQuestion || 1)
  startQuestionTimer()
}

const goToQuestion = (index) => {
  try {
    if (!currentSubject.value?.questions?.[index]) return

    saveQuestionTime()
    setCurrent(currentSubject.value, index + 1)
    startQuestionTimer()
    showMobileQuestionList.value = false
  } catch (error) {
    console.error("goToQuestion failed:", error)
  }
}

const previous = () => {
  if (!currentSubject.value) return
  if (currentSubject.value.currentQuestion <= 1) return

  saveQuestionTime()
  setCurrent(currentSubject.value, currentSubject.value.currentQuestion - 1)
  startQuestionTimer()
}

const next = () => {
  if (!currentSubject.value) return

  saveQuestionTime()

  const total = currentSubject.value.questions?.length || 0

  // still questions left in this subject
  if (currentSubject.value.currentQuestion < total) {
    setCurrent(currentSubject.value, currentSubject.value.currentQuestion + 1)
    startQuestionTimer()
    return
  }

  // last question: move to the next subject that has questions
  const currentIndex = groupedSubjects.value.findIndex(
    (subject) => subject.id === currentSubject.value.id
  )

  const nextSubject = groupedSubjects.value
    .slice(currentIndex + 1)
    .find((subject) => subject.questions?.length)

  if (!nextSubject) return

  setCurrent(nextSubject, 1)
  startQuestionTimer()
}

const isLastQuestion = computed(() => {
  if (!currentSubject.value) return false

  const subjectIndex = groupedSubjects.value.findIndex(
    (subject) => subject.id === currentSubject.value.id
  )

  return (
    subjectIndex === groupedSubjects.value.length - 1 &&
    currentSubject.value.currentQuestion >=
      (currentSubject.value.questions?.length || 0)
  )
})

// ==========================================
// BOOKMARK
// ==========================================

const bookmarkQuestion = async () => {
  const question = currentQuestion.value
  if (!question) return

  try {
    await saveBookmark(question)
  } catch (error) {
    console.error("Bookmark failed:", error)
  }

  bookmarkedQuestion.value = {
    examType: question.examType || "objective",
    subject: question.subject || currentSubject.value?.name || "Unknown subject",
    year: question.year || "",
    questionNumber:
      question.questionNumber ||
      question.number ||
      currentSubject.value?.currentQuestion ||
      1,
  }

  showBookmarkModal.value = true
}

// ==========================================
// FLOATING QUESTION BUTTON (drag)
// ==========================================

const questionButtonHidden = ref(false)
const questionButtonPosition = ref({ right: 16, bottom: 20 })
const isDraggingQuestionButton = ref(false)

let dragStartX = 0
let dragStartY = 0
let initialRight = 16
let initialBottom = 20

const startQuestionButtonDrag = (event) => {
  isDraggingQuestionButton.value = true
  const touch = event.touches?.[0] || event
  dragStartX = touch.clientX
  dragStartY = touch.clientY
  initialRight = questionButtonPosition.value.right
  initialBottom = questionButtonPosition.value.bottom
}

const moveQuestionButtonDrag = (event) => {
  if (!isDraggingQuestionButton.value) return
  const touch = event.touches?.[0] || event

  questionButtonPosition.value = {
    right: Math.max(
      0,
      Math.min(window.innerWidth - 70, initialRight + (dragStartX - touch.clientX))
    ),
    bottom: Math.max(
      0,
      Math.min(window.innerHeight - 70, initialBottom - (dragStartY - touch.clientY))
    ),
  }
}

const endQuestionButtonDrag = () => {
  if (!isDraggingQuestionButton.value) return
  isDraggingQuestionButton.value = false
  if (questionButtonPosition.value.bottom < 35) questionButtonHidden.value = true
}

const restoreQuestionButton = () => {
  questionButtonHidden.value = false
  questionButtonPosition.value = { right: 16, bottom: 20 }
}

// ==========================================
// LEAVE
// ==========================================

const leave = async () => {
  try {
    await navigateTo("/")
  } catch (error) {
    console.error("Navigation failed:", error)
  }
}

// ==========================================
// SUBMIT
// ==========================================

const submitExam = async () => {
  if (isSubmitting.value || Submitted.value) return
  if (!groupedSubjects.value.length) return

  isSubmitting.value = true

  try {
    saveQuestionTime()

    const questions = groupedSubjects.value.flatMap(
      (subject) => subject.questions || []
    )

    appState.value.examQuestions = questions
    Submitted.value = true

    const total = questions.length
    let answered = 0
    let correct = 0
    let wrong = 0

    groupedSubjects.value.forEach((subject) => {
      subject.total = subject.questions.length
      subject.answered = 0
      subject.correct = 0
      subject.wrong = 0
      subject.score = 0
      subject.maxScore = 0
    })

    questions.forEach((question) => {
      const subject = groupedSubjects.value.find((s) => s.id === question.subject)
      if (!subject || !question.userAnswer) return

      answered++
      subject.answered++

      if (question.userAnswer === question.answer) {
        correct++
        subject.correct++
      } else {
        wrong++
        subject.wrong++
      }
    })

    // JAMB marks: every subject is out of 100
    let aggregate = 0
    let maxAggregate = 0

    groupedSubjects.value.forEach((subject) => {
      const jambQuestions = ["english", "english-language"].includes(subject.id)
        ? 60
        : 40

      subject.score = Number(((subject.correct / jambQuestions) * 100).toFixed(2))
      subject.maxScore = Number(
        ((subject.questions.length / jambQuestions) * 100).toFixed(2)
      )

      aggregate += subject.score
      maxAggregate += subject.maxScore
    })

    aggregate = Number(aggregate.toFixed(2))
    maxAggregate = Number(maxAggregate.toFixed(2))

    const percentage = Number(((correct / Math.max(total, 1)) * 100).toFixed(2))

    // time
    try {
      examHeader.value?.stop?.()
    } catch (error) {
      console.error("Timer stop failed:", error)
    }

    const totalDuration =
      durationToSeconds(appState.value.examSettings?.duration) || 0

    const remaining = Number(examHeader.value?.getTimeLeft?.())
    const timeLeft = Number.isFinite(remaining)
      ? Math.max(0, Math.min(totalDuration, remaining))
      : totalDuration

    const durationUsed = Math.max(0, totalDuration - timeLeft)
    const timeSpent = secondsToDuration(durationUsed)
    const speed = Number((correct / Math.max(durationUsed / 60, 1)).toFixed(2))
    const timePercent =
      totalDuration > 0
        ? Math.min(Math.round((durationUsed / totalDuration) * 100), 100)
        : 0

    const result = {
      total,
      answered,
      unanswered: total - answered,
      correct,
      wrong,
      percentage,
      timestart: startingDate.value,
      aggregate,
      maxAggregate,
      subjects: groupedSubjects.value,
      totalDuration,
      durationUsed,
      timeSpent,
      timePercent,
      speed,
    }

    appState.value.examResult = result

    // A failed save must never block the report
    try {
      await save({
        result,
        questions: appState.value.examQuestions,
        settings: appState.value.examSettings,
      })
    } catch (error) {
      console.error("Saving exam history failed:", error)
    }

    showExamReport.value = true
  } catch (error) {
    console.error("Submit failed:", error)
    Submitted.value = false
    alert("Something went wrong while submitting. Please try again.")
  } finally {
    isSubmitting.value = false
  }
}

// ==========================================
// ANSWERS + KEYBOARD
// ==========================================

const selectAnswer = (letter) => {
  if (!currentQuestion.value || Submitted.value) return

  const options = currentQuestion.value.options || {}
  const key = Object.keys(options).find(
    (k) => k.toLowerCase() === letter.toLowerCase()
  )

  if (key) currentQuestion.value.userAnswer = key
}

const handleKeyboard = (event) => {
  const element = document.activeElement
  const tag = element?.tagName

  if (tag === "INPUT" || tag === "TEXTAREA" || element?.isContentEditable) return
  if (!hasQuestions.value) return

  switch (event.key.toLowerCase()) {
    case "n":
    case "arrowright":
      next()
      break
    case "p":
    case "arrowleft":
      previous()
      break
    case "a":
    case "b":
    case "c":
    case "d":
    case "e":
      selectAnswer(event.key)
      break
  }
}

const blockShortcuts = (event) => {
  const key = event.key.toLowerCase()

  if (
    event.key === "F5" ||
    event.key === "F12" ||
    (event.ctrlKey && ["r", "u", "s", "p"].includes(key))
  ) {
    event.preventDefault()
  }
}

const blockEvent = (event) => event.preventDefault()

// ==========================================
// BUILD THE EXAM FROM APP STATE
// ==========================================

const buildGroups = (subjects, questions) => {
  const subjectList = Array.isArray(subjects) ? subjects : []
  const questionList = Array.isArray(questions) ? questions : []
  let globalIndex = 1

  return (
    subjectList
      .map((subject) => ({
        ...subject,
        currentQuestion: 1,
        answered: 0,
        questions: questionList
          .filter((question) => question?.subject === subject.id)
          .map((question) => ({
            ...question,
            index: globalIndex++,
            answered: false,
          })),
      }))
      // a subject with no questions would only create empty tabs
      .filter((subject) => subject.questions.length > 0)
  )
}

const initExam = () => {
  try {
    const state = appState.value
    const review = !!state.reviewQuestions

    const groups = review
      ? buildGroups(state.selectedSubjectsView, state.examQuestionsView)
      : buildGroups(state.selectedSubjects, state.examQuestions)

    Submitted.value = review
    groupedSubjects.value = groups
    startingDate.value = new Date().toISOString()

    if (!groups.length) {
      loadError.value = "No questions were found for this exam."
      return
    }

    setCurrent(groups[0], 1)
    startQuestionTimer()
    examHeader.value?.start?.()
  } catch (error) {
    console.error("Failed to prepare the exam:", error)
    loadError.value = "We could not load this exam. Please go back and try again."
  }
}

// ==========================================
// LIFECYCLE
// ==========================================

onMounted(async () => {
  window.addEventListener("keydown", handleKeyboard)
  window.addEventListener("keydown", blockShortcuts)
  document.addEventListener("contextmenu", blockEvent)
  document.addEventListener("dragstart", blockEvent)

  initExam()

  if (!isMobileTauri() && isTauri()) {
    try {
      await getWindow()?.setFullscreen(true)
    } catch (error) {
      console.error("Failed to enter exam fullscreen:", error)
    }
  }
})

onBeforeUnmount(async () => {
  window.removeEventListener("keydown", handleKeyboard)
  window.removeEventListener("keydown", blockShortcuts)
  document.removeEventListener("contextmenu", blockEvent)
  document.removeEventListener("dragstart", blockEvent)

  if (isMobileTauri() || !isTauri()) return

  try {
    const win = getWindow()
    if (!win) return

    await win.setFullscreen(false)
    await win.setDecorations(true)
    await win.setResizable(true)
    await win.setAlwaysOnTop(false)
    await win.maximize()
  } catch (error) {
    console.error("Failed to restore the application window:", error)
  }
})

// ==========================================
// DISPLAY HELPERS
// ==========================================

const tabSubjects = computed(() => groupedSubjects.value)

const attemptedCount = computed(
  () =>
    currentSubject.value?.questions?.filter((question) => question.userAnswer)
      .length || 0
)

const totalCount = computed(() => currentSubject.value?.questions?.length || 0)

const progressPercent = computed(() =>
  totalCount.value
    ? Math.round((attemptedCount.value / totalCount.value) * 100)
    : 0
)

const optionState = (key) => {
  const question = currentQuestion.value
  if (!question) return "idle"

  if (Submitted.value) {
    if (key === question.answer) return "correct"
    if (key === question.userAnswer) return "wrong"
    return "idle"
  }

  return question.userAnswer === key ? "selected" : "idle"
}

const tileClass = (question, index) => {
  const isCurrent = currentSubject.value?.currentQuestion === index + 1
  const answered = Boolean(question?.userAnswer)

  if (isCurrent) {
    return answered
      ? "bg-blue-100 text-[#0B2F6B] ring-2 ring-[#0A6CFF]"
      : "bg-white text-[#0A6CFF] ring-2 ring-[#0A6CFF]"
  }

  return answered
    ? "bg-blue-100 text-[#0B2F6B]"
    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
}

const getQuestionClass = (question) => {
  if (!Submitted.value) return ""

  if (question.answer === question.userAnswer) return "bg-[#0A6CFF] text-white"
  if (question.userAnswer && question.userAnswer !== question.answer)
    return "bg-[#0B2F6B] text-white"

  return "bg-slate-400 text-white"
}
</script>

<template>
  <div
    class="flex h-[100dvh] w-full select-none flex-col overflow-hidden bg-[#F3F8FF] text-[#0B2F6B] font-['Inter',system-ui,sans-serif]"
  >
    <BookmarkModal
      :visible="showBookmarkModal"
      :question="bookmarkedQuestion"
      @close="showBookmarkModal = false"
    />

    <!-- TOP RIGHT CONTROLS -->
    <div
      v-if="hasQuestions"
      class="fixed right-0 top-2 z-[100] flex h-12 items-center justify-end px-2 sm:px-6 lg:px-8"
    >
      <ExamSubmitModal v-model="showSubmitModal" @submit="submitExam" />
    </div>

    <!-- NAVBAR -->
    <div class="shrink-0">
      <NavigationExamNavBar
        ref="examHeader"
        :current-question="currentQuestion"
        :question-number="currentSubject?.currentQuestion"
        @time-finished="submitExam"
      />
    </div>

    <!-- ========================================= -->
    <!-- EMPTY / ERROR STATE -->
    <!-- ========================================= -->
    <div
      v-if="!hasQuestions"
      class="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-6 text-center"
    >
      <div
        class="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#0A6CFF]"
      >
        <Icon name="lucide:file-question" class="h-7 w-7" />
      </div>

      <h2 class="text-base font-bold text-[#0B2F6B]">No questions to show</h2>

      <p class="max-w-xs text-sm text-slate-500">
        {{ loadError || "There are no questions for this exam." }}
      </p>

      <button
        type="button"
        class="h-11 rounded-2xl bg-[#0A6CFF] px-5 text-sm font-bold text-white transition active:scale-95"
        @click="leave"
      >
        Go back
      </button>
    </div>

    <!-- ========================================= -->
    <!-- RESULT (dialog on desktop, sheet on mobile) -->
    <!-- ========================================= -->
    <div
      v-if="showExamReport"
      class="fixed inset-0 z-[200] flex h-dvh w-full items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4"
    >
      <div
        class="flex h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl sm:h-[90dvh] sm:rounded-3xl"
      >
        <div
          class="flex h-14 shrink-0 items-center justify-between bg-[#0B2F6B] px-2 text-white sm:px-6"
        >
          <h2 class="text-base font-bold">Examination Report</h2>

          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20 active:scale-95"
            @click="showExamReport = false"
          >
            <Icon name="lucide:x" class="h-5 w-5" />
          </button>
        </div>

        <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <ExamSummarySection
            :score="Math.round(appState.examResult?.aggregate || 0)"
            :total="Math.round(appState.examResult?.maxAggregate || 0)"
            :time="appState.examResult?.timeSpent || '00:00:00'"
            :time-percent="appState.examResult?.timePercent || 0"
            :speed="appState.examResult?.speed || 0"
          />

          <ExamResultSlip
            username="WAHEED"
            :examDetails="appState.examResult || {}"
            :startingDate="startingDate"
            :subjects="appState.examResult?.subjects || []"
          />

          <ExamTopicRort :questions="appState.examResult?.subjects || []" />
        </div>
      </div>
    </div>

    <!-- ========================================= -->
    <!-- SUBJECT TABS + PROGRESS BAR -->
    <!-- ========================================= -->
    <div
      v-if="hasQuestions"
      class="relative z-10 shrink-0 bg-white shadow-[0_2px_10px_rgba(20,49,109,0.06)]"
    >
      <div
        class="flex overflow-x-auto px-2 [scrollbar-width:none] sm:px-10 [&::-webkit-scrollbar]:hidden"
      >
        <button
          v-for="subject in tabSubjects"
          :key="subject.id"
          type="button"
          class="relative h-11 shrink-0 whitespace-nowrap px-2 text-xs font-bold transition active:bg-blue-50 sm:px-6"
          :class="
            activeSubject === subject.id ? 'text-[#0A6CFF]' : 'text-slate-500'
          "
          @click="selectSubject(subject)"
        >
          {{ subject?.name || "No subject" }}

          <span
            v-if="activeSubject === subject.id"
            class="absolute inset-x-3 bottom-0 h-[3px] rounded-t-full bg-[#0A6CFF]"
          ></span>
        </button>
      </div>

      <div class="h-1 w-full bg-blue-100">
        <div
          class="h-full rounded-r-full bg-[#0A6CFF] transition-all duration-300"
          :style="{ width: progressPercent + '%' }"
        ></div>
      </div>
    </div>

    <!-- ========================================= -->
    <!-- MAIN EXAM AREA -->
    <!-- ========================================= -->
    <main v-if="hasQuestions" class="flex min-h-0 flex-1 overflow-hidden">
      <!-- DESKTOP QUESTION NAVIGATOR -->
      <aside
        class="hidden shrink-0 px-2 py-3 pr-0 sm:flex sm:w-56 sm:pl-3 md:w-64 lg:w-72"
      >
        <div
          class="flex min-h-0 w-full flex-col overflow-hidden rounded-3xl bg-white shadow-[0_8px_24px_rgba(20,49,109,0.07)] ring-1 ring-blue-50"
        >
          <div class="shrink-0 border-b border-blue-50 px-2 py-3 sm:px-4">
            <h3 class="text-xs font-bold text-slate-500">
              Attempt: {{ attemptedCount }}/{{ totalCount }}
            </h3>
          </div>

          <div
            class="grid min-h-0 flex-1 grid-cols-5 content-start gap-2 overflow-y-auto overscroll-contain px-2 py-3 sm:pl-3 sm:pr-3"
          >
            <button
              v-for="(question, index) in currentSubject?.questions || []"
              :key="question.id || question.sourceId || index"
              type="button"
              class="flex h-12 w-full cursor-pointer flex-col overflow-hidden rounded-xl text-xs font-bold transition active:scale-95"
              :class="tileClass(question, index)"
              @click="goToQuestion(index)"
            >
              <div class="flex flex-1 items-center justify-center">
                {{ index + 1 }}
              </div>

              <div
                v-if="Submitted"
                class="flex h-4 w-full items-center justify-center text-[10px] font-semibold"
                :class="getQuestionClass(question, index)"
              >
                {{ question.timeSpent || 0 }}s
              </div>
            </button>
          </div>
        </div>
      </aside>

      <!-- QUESTION CARD -->
      <section class="flex min-w-0 flex-1 px-2 py-3 sm:p-4">
        <div
          class="flex min-h-0 w-full flex-col overflow-hidden rounded-3xl bg-white shadow-[0_8px_24px_rgba(20,49,109,0.07)] ring-1 ring-blue-50"
        >
          <!-- card header -->
          <div
            class="flex shrink-0 items-center justify-between gap-2 px-2 pt-4 sm:px-6"
          >
            <span
              class="rounded-full bg-blue-50 px-2 py-1 text-xs font-bold text-[#0A6CFF] sm:px-3"
            >
              Question:
              {{ currentSubject?.currentQuestion || 0 }}/{{
                currentSubject?.questions?.length || 0
              }}
            </span>

            <button
              v-if="!Submitted"
              type="button"
              :disabled="isSubmitting"
              class="block h-8 rounded-xl bg-[#0B2F6B] px-2 text-xs font-bold text-white transition active:scale-95 disabled:opacity-50 sm:hidden sm:px-3"
              @click="showSubmitModal = true"
            >
              Submit
            </button>

            <button
              v-else
              type="button"
              class="block h-8 rounded-xl bg-[#0B2F6B] px-2 text-xs font-bold text-white transition active:scale-95 sm:hidden sm:px-3"
              @click="showExamReport = true"
            >
              Result
            </button>
          </div>

          <!-- scrolling question + options -->
          <div
            class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-24 pt-3 sm:px-6 sm:pb-4"
          >
            <div class="mx-auto w-full max-w-3xl">
              <img
                v-if="currentQuestion?.imageUrl"
                :src="currentQuestion.imageUrl"
                class="mb-3 max-h-64 max-w-full rounded-2xl object-contain"
                alt="Question image"
              />

              <!-- passage / instruction (only when it exists) -->
              <div
                v-if="currentQuestion?.section"
                class="question-section"
                v-html="safeRender(currentQuestion.section)"
              ></div>

              <div
                class="question-content"
                v-html="
                  safeRender(
                    currentQuestion?.question ||
                      currentQuestion?.text ||
                      'Question not available'
                  )
                "
              ></div>

              <!-- OPTIONS -->
              <div class="mt-4 flex flex-col gap-2">
                <label
                  v-for="[key, value] in Object.entries(
                    currentQuestion?.options || {}
                  )"
                  :key="key"
                  class="flex cursor-pointer items-center gap-3 rounded-2xl border-[1.5px] px-2 py-3 transition active:scale-[0.99] sm:pl-3 sm:pr-3"
                  :class="{
                    'border-blue-100 bg-white hover:bg-blue-50/60':
                      optionState(key) === 'idle',
                    'border-[#0A6CFF] bg-blue-50':
                      optionState(key) === 'selected' ||
                      optionState(key) === 'correct',
                    'border-[#0B2F6B] bg-slate-100':
                      optionState(key) === 'wrong',
                  }"
                >
                  <input
                    v-model="currentQuestion.userAnswer"
                    type="radio"
                    :value="key"
                    class="hidden"
                    :disabled="Submitted"
                  />

                  <!-- letter -->
                  <div
                    class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold uppercase transition"
                    :class="{
                      'border-2 border-blue-200 bg-white text-slate-500':
                        optionState(key) === 'idle',
                      'bg-[#0A6CFF] text-white':
                        optionState(key) === 'selected' ||
                        optionState(key) === 'correct',
                      'bg-[#0B2F6B] text-white': optionState(key) === 'wrong',
                    }"
                  >
                    {{ key }}
                  </div>

                  <!-- text -->
                  <span
                    class="min-w-0 flex-1 break-words text-[15px] leading-snug text-[#201F22] sm:text-base"
                    :class="
                      optionState(key) === 'correct' ||
                      optionState(key) === 'wrong'
                        ? 'font-bold'
                        : 'font-normal'
                    "
                    v-html="safeRender(value)"
                  ></span>

                  <!-- status -->
                  <Icon
                    v-if="optionState(key) === 'correct'"
                    name="lucide:check-circle-2"
                    class="h-5 w-5 shrink-0 text-[#0A6CFF]"
                  />

                  <Icon
                    v-else-if="optionState(key) === 'wrong'"
                    name="lucide:x-circle"
                    class="h-5 w-5 shrink-0 text-[#0B2F6B]"
                  />
                </label>
              </div>

              <!-- EXPLANATION -->
              <div
                v-if="Submitted && currentQuestion"
                class="mt-5 rounded-2xl bg-blue-50 px-2 py-0 text-sm sm:pl-3 sm:pr-3"
              >
                <QuestionExplanation :question="currentQuestion" />
              </div>
            </div>
          </div>

          <!-- BOTTOM ACTION BAR -->
          <div
            class="flex shrink-0 items-center justify-between gap-2 border-t border-blue-50 bg-white px-2 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3 sm:px-6 sm:pb-3"
          >
            <div class="flex gap-2">
              <button
                type="button"
                class="flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-2xl bg-blue-50 px-2 text-sm font-bold text-[#0A6CFF] transition hover:bg-blue-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 sm:px-4"
                :disabled="(currentSubject?.currentQuestion || 0) <= 1"
                @click="previous"
              >
                <Icon name="lucide:chevron-left" class="h-5 w-5" />
                <span class="hidden sm:inline">Previous</span>
              </button>

              <button
                type="button"
                class="flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-2xl bg-[#0A6CFF] px-2 text-sm font-bold text-white shadow-[0_6px_14px_rgba(10,108,255,0.35)] transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none sm:px-4"
                :disabled="isLastQuestion"
                @click="next"
              >
                <span class="hidden sm:inline">Next</span>
                <Icon name="lucide:chevron-right" class="h-5 w-5" />
              </button>
            </div>

            <div class="hidden gap-2 sm:flex">
              <button
                v-if="Submitted"
                type="button"
                class="h-11 rounded-2xl bg-[#0B2F6B] px-2 text-sm font-bold text-white transition hover:brightness-125 active:scale-95 sm:px-4"
                @click="showExamReport = true"
              >
                Result
              </button>

              <button
                v-else
                type="button"
                :disabled="isSubmitting"
                class="h-11 rounded-2xl bg-[#0B2F6B] px-2 text-sm font-bold text-white transition hover:brightness-125 active:scale-95 disabled:opacity-50 sm:px-4"
                @click="showSubmitModal = true"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- MOBILE FLOATING "QUESTIONS" BUTTON -->
    <button
      v-if="hasQuestions && !showMobileQuestionList"
      type="button"
      class="fixed bottom-[calc(env(safe-area-inset-bottom)+22px)] right-4 z-[110] flex h-12 items-center gap-2 rounded-2xl bg-[#0A6CFF] px-2 text-white shadow-[0_8px_20px_rgba(10,108,255,0.45)] transition active:scale-95 sm:hidden sm:px-4"
      @click="openMobileQuestionList"
    >
      <Icon name="lucide:grid-3x3" class="h-4 w-4" />

      <span class="text-xs font-bold">Questions</span>

      <span class="rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold">
        {{ currentSubject?.currentQuestion || 0 }}/{{
          currentSubject?.questions?.length || 0
        }}
      </span>
    </button>

    <!-- MOBILE SHEET OVERLAY -->
    <Transition name="question-overlay">
      <div
        v-if="hasQuestions && showMobileQuestionList"
        class="fixed inset-0 z-[120] bg-black/50 sm:hidden"
        @click="closeMobileQuestionList"
      ></div>
    </Transition>

    <!-- MOBILE BOTTOM SHEET -->
    <Transition name="question-sheet">
      <section
        v-if="hasQuestions && showMobileQuestionList"
        class="fixed inset-x-0 bottom-0 z-[130] flex max-h-[80dvh] flex-col rounded-t-[28px] bg-white shadow-2xl sm:hidden"
      >
        <div class="flex shrink-0 justify-center pt-2">
          <div class="h-1.5 w-12 rounded-full bg-slate-200"></div>
        </div>

        <div
          class="flex shrink-0 items-center justify-between px-2 py-3 sm:px-5"
        >
          <div>
            <h2 class="text-sm font-bold text-[#0B2F6B]">Question Navigator</h2>

            <p class="mt-0.5 text-xs text-slate-500">
              Select a question to continue
            </p>
          </div>

          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition active:bg-slate-200"
            @click="closeMobileQuestionList"
          >
            <Icon name="lucide:x" class="h-5 w-5" />
          </button>
        </div>

        <!-- attempted card -->
        <div class="mx-4 shrink-0 rounded-2xl bg-blue-50 px-2 py-3 sm:px-4">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-500">Attempted</span>

            <span class="text-sm font-bold text-[#0A6CFF]">
              {{ attemptedCount }} / {{ totalCount }}
            </span>
          </div>

          <div
            class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-blue-100"
          >
            <div
              class="h-full rounded-full bg-[#0A6CFF] transition-all duration-300"
              :style="{ width: progressPercent + '%' }"
            ></div>
          </div>
        </div>

        <!-- grid -->
        <div
          class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-4 sm:px-5"
        >
          <div class="grid grid-cols-5 gap-2.5">
            <button
              v-for="(question, index) in currentSubject?.questions || []"
              :key="question.id || question.sourceId || index"
              type="button"
              class="flex h-12 w-full cursor-pointer flex-col overflow-hidden rounded-xl text-xs font-bold transition active:scale-95"
              :class="tileClass(question, index)"
              @click="goToQuestion(index)"
            >
              <div class="flex flex-1 items-center justify-center">
                {{ index + 1 }}
              </div>

              <div
                v-if="Submitted"
                class="flex h-4 w-full items-center justify-center text-[10px] font-semibold"
                :class="getQuestionClass(question, index)"
              >
                {{ question.timeSpent || 0 }}s
              </div>
            </button>
          </div>
        </div>

        <!-- footer -->
        <div
          class="shrink-0 border-t border-blue-50 bg-white px-2 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-3 sm:px-5"
        >
          <button
            type="button"
            class="flex h-12 w-full items-center justify-center rounded-2xl bg-[#0A6CFF] text-sm font-bold text-white shadow-[0_6px_14px_rgba(10,108,255,0.35)] transition active:scale-[0.98]"
            @click="closeMobileQuestionList"
          >
            Continue Exam
          </button>
        </div>
      </section>
    </Transition>
  </div>
</template>
<style scoped>
/* native-app feel */
button {
  -webkit-tap-highlight-color: transparent;
}

/* =========================================================
   TYPE SCALE (one scale for the whole page)
   10px  captions on tiles
   12px  labels, tabs, chips, small buttons
   14px  action buttons, explanation
   15px  reading text on phones   (question + options)
   16px  reading text on desktop  (question + options)
   ========================================================= */

.question-section,
.question-content {
  width: 100%;
  max-width: 100%;
  color: #0b2f6b;
  font-family: inherit;
  font-size: 15px;
  line-height: 1.65;
  overflow-wrap: anywhere;
}

.question-content {
  font-weight: 600;
}

/* passage / instruction above the question */
.question-section {
  margin-bottom: 12px;
  padding: 12px 8px;
  border-radius: 16px;
  background: #f3f8ff;
  font-weight: 500;
}

@media (min-width: 640px) {
  .question-section,
  .question-content {
    font-size: 16px;
    line-height: 1.7;
  }

  .question-section {
    padding: 12px;
  }
}

/* =========================================================
   HTML COMING FROM THE DATABASE (v-html)
   Scoped styles need :deep() to reach these elements.
   ========================================================= */

.question-section :deep(*),
.question-content :deep(*) {
  max-width: 100%;
}

.question-section :deep(p),
.question-content :deep(p) {
  margin: 0 0 8px;
  font-size: inherit;
  line-height: inherit;
}

.question-section :deep(p:last-child),
.question-content :deep(p:last-child) {
  margin-bottom: 0;
}

.question-section :deep(strong),
.question-section :deep(b),
.question-content :deep(strong),
.question-content :deep(b) {
  font-weight: 700;
}

.question-section :deep(em),
.question-section :deep(i),
.question-content :deep(em),
.question-content :deep(i) {
  font-style: italic;
}

.question-section :deep(h1),
.question-section :deep(h2),
.question-section :deep(h3),
.question-section :deep(h4),
.question-content :deep(h1),
.question-content :deep(h2),
.question-content :deep(h3),
.question-content :deep(h4) {
  margin: 8px 0;
  color: #0b2f6b;
  font-size: inherit;
  font-weight: 700;
  line-height: 1.5;
}

.question-section :deep(ul),
.question-content :deep(ul) {
  margin: 8px 0;
  padding-left: 24px;
  list-style: disc;
}

.question-section :deep(ol),
.question-content :deep(ol) {
  margin: 8px 0;
  padding-left: 24px;
  list-style: decimal;
}

.question-section :deep(li),
.question-content :deep(li) {
  margin-bottom: 4px;
  padding-left: 2px;
}

.question-section :deep(img),
.question-content :deep(img) {
  display: block;
  width: auto;
  max-width: 100%;
  height: auto;
  margin: 10px auto;
  border-radius: 12px;
  object-fit: contain;
}

.question-section :deep(table),
.question-content :deep(table) {
  display: block;
  width: 100%;
  max-width: 100%;
  margin: 10px 0;
  overflow-x: auto;
  border-collapse: collapse;
  font-size: 14px;
}

.question-section :deep(th),
.question-section :deep(td),
.question-content :deep(th),
.question-content :deep(td) {
  padding: 7px 8px;
  border: 1px solid #dbeafe;
  text-align: left;
  vertical-align: top;
}

.question-section :deep(th),
.question-content :deep(th) {
  background: #eff6ff;
  font-weight: 700;
}

.question-section :deep(sup),
.question-content :deep(sup) {
  font-size: 0.7em;
  vertical-align: super;
}

.question-section :deep(sub),
.question-content :deep(sub) {
  font-size: 0.7em;
  vertical-align: sub;
}

.question-section :deep(code),
.question-content :deep(code) {
  font-family: ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace;
  font-size: 0.9em;
  overflow-wrap: anywhere;
}

.question-section :deep(pre),
.question-content :deep(pre) {
  max-width: 100%;
  margin: 10px 0;
  padding: 10px 8px;
  overflow-x: auto;
  border-radius: 12px;
  background: #eff6ff;
}

/* =========================================================
   MOBILE SHEET ANIMATIONS
   ========================================================= */

.question-overlay-enter-active,
.question-overlay-leave-active {
  transition: opacity 0.2s ease;
}

.question-overlay-enter-from,
.question-overlay-leave-to {
  opacity: 0;
}

.question-sheet-enter-active,
.question-sheet-leave-active {
  transition: transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.question-sheet-enter-from,
.question-sheet-leave-to {
  transform: translateY(100%);
}

@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
    animation: none !important;
  }
}
</style>