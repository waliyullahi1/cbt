<script setup>
import { onMounted, onBeforeUnmount } from "vue"
import { getCurrentWindow } from "@tauri-apps/api/window"
import { durationToSeconds, secondsToDuration } from "~/utils/examTime"
import { isMobileTauri } from "~/utils/isMobileTauri"

const appWindow = getCurrentWindow()
const appState = useAppState()
const questionStartTime = ref(0)
const currentSubject = ref({})
const currentQuestion  = ref({})
const Submitted =  ref(false)
const showExamReport = ref(false)
const showSubmitModal = ref(false)
const examHeader = ref(null)
const { save, load, histories } = useExamHistory()
const activeSubject = ref(
  appState.selectedSubjects?.[0]?.id || null
)

const showMobileQuestionList = ref(false)

function openMobileQuestionList() {
  showMobileQuestionList.value = true
}

function closeMobileQuestionList() {
  showMobileQuestionList.value = false
}
const groupedSubjects = ref([])


function startQuestionTimer() {
  questionStartTime.value = Date.now()
}
function saveQuestionTime() {
  if (!currentQuestion.value || Submitted.value) return

  const seconds = Math.floor(
    (Date.now() - questionStartTime.value) / 1000
  )

  console.log(
    "Saving",
    currentQuestion.value.index,
    seconds
  )

  currentQuestion.value.timeSpent =
    (currentQuestion.value.timeSpent || 0) + seconds
}
const selectSubject = (subject) => {
  activeSubject.value = subject.id

  const selectedSubject =
    groupedSubjects.value.find(
      item => item.id === subject.id
    )
  
  currentSubject.value =  selectedSubject ?? null
    currentQuestion.value =  currentSubject.value.questions[ currentSubject.value.currentQuestion -1 ] 
    
}
const goToQuestion = (index) => {
  try {
    saveQuestionTime()

    if (!currentSubject.value?.questions?.[index]) return

    currentQuestion.value = currentSubject.value.questions[index]

    currentSubject.value.currentQuestion = index + 1

    startQuestionTimer()

    // Close mobile question popup after selecting a question
    showMobileQuestionList.value = false
  } catch (error) {
    console.log(error)
  }
}


const showBookmarkModal = ref(false)

const bookmarkedQuestion = ref({})

const bookmarkQuestion = async () => {
  // Use your existing bookmark function here
  await saveBookmark(currentQuestion.value)

  // Store the exact question that was bookmarked
  bookmarkedQuestion.value = {
    examType:
      currentQuestion.value.examType ||
      examType.value ||
      'objective',

    subject:
      currentQuestion.value.subject ||
      currentSubject.value?.name ||
      currentSubject.value ||
      'Unknown subject',

    year:
      currentQuestion.value.year ||
      examYear.value ||
      '',

    questionNumber:
      currentQuestion.value.questionNumber ||
      currentQuestion.value.number ||
      currentQuestionIndex.value + 1,
  }

  // Open the modal
  showBookmarkModal.value = true
}

const previous = () => {
  if (currentSubject.value.currentQuestion <= 1) {
    return
  }
   saveQuestionTime()

  currentSubject.value.currentQuestion--

  currentQuestion.value =
    currentSubject.value.questions[
      currentSubject.value.currentQuestion - 1
    ]
     startQuestionTimer()
}

const next = () => {
  saveQuestionTime()

  // Still have questions in this subject
  if (
    currentSubject.value.currentQuestion <
    currentSubject.value.questions.length
  ) {
    currentSubject.value.currentQuestion++

    currentQuestion.value =
      currentSubject.value.questions[
        currentSubject.value.currentQuestion - 1
      ]

    startQuestionTimer()
    return
  }

  // ===========================
  // Last question reached
  // Move to next subject
  // ===========================

  const currentIndex = groupedSubjects.value.findIndex(
    subject => subject.id === currentSubject.value.id
  )

  const nextSubject =
    groupedSubjects.value[currentIndex + 1]

  if (!nextSubject) {
    // No more subjects
    return
    // or submitExam()
  }

  activeSubject.value = nextSubject.id
  currentSubject.value = nextSubject
  currentSubject.value.currentQuestion = 1
  currentQuestion.value = nextSubject.questions[0]

  startQuestionTimer()
}

const isLastQuestion = computed(() => {
  const subjectIndex = groupedSubjects.value.findIndex(
    s => s.id === currentSubject.value.id
  )

  return (
    subjectIndex === groupedSubjects.value.length - 1 &&
    currentSubject.value.currentQuestion >=
      currentSubject.value.questions.length
  )
})



  const questionButtonHidden = ref(false)
const questionButtonPosition = ref({
  right: 16,
  bottom: 20,
})

const isDraggingQuestionButton = ref(false)

let dragStartY = 0
let dragStartX = 0
let initialRight = 16
let initialBottom = 20

function startQuestionButtonDrag(event) {
  isDraggingQuestionButton.value = true

  const touch = event.touches?.[0] || event
  dragStartX = touch.clientX
  dragStartY = touch.clientY

  initialRight = questionButtonPosition.value.right
  initialBottom = questionButtonPosition.value.bottom
}

function moveQuestionButtonDrag(event) {
  if (!isDraggingQuestionButton.value) return

  const touch = event.touches?.[0] || event

  const deltaX = dragStartX - touch.clientX
  const deltaY = dragStartY - touch.clientY

  questionButtonPosition.value = {
    right: Math.max(
      0,
      Math.min(window.innerWidth - 70, initialRight + deltaX)
    ),
    bottom: Math.max(
      0,
      Math.min(window.innerHeight - 70, initialBottom - deltaY)
    ),
  }
}

function endQuestionButtonDrag() {
  if (!isDraggingQuestionButton.value) return

  isDraggingQuestionButton.value = false

  // Drag close to the bottom edge to hide the button.
  if (questionButtonPosition.value.bottom < 35) {
    questionButtonHidden.value = true
  }
}

function restoreQuestionButton() {
  questionButtonHidden.value = false

  questionButtonPosition.value = {
    right: 16,
    bottom: 20,
  }
}

const leave = async ()=> {
     await navigateTo('/')
}


/////// For Time Calculation
const timer = ref(null)

const examDuration = ref(null)
function formatTime(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60

  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}
function startExam() {
  if (!Submitted.value) {
    examHeader.value?.start()
  }
 
}



const submitExam = async () => {
  // Save latest question time
  saveQuestionTime()

  // Flatten all questions
  appState.value.examQuestions = groupedSubjects.value.flatMap(
    subject => subject.questions
  )
console.log(appState.value.examQuestions);

  Submitted.value = true

  const questions = appState.value.examQuestions

  let total = questions.length
  let answered = 0
  let correct = 0
  let wrong = 0

  // Reset subject statistics
  groupedSubjects.value.forEach(subject => {
    subject.total = subject.questions.length
    subject.answered = 0
    subject.correct = 0
    subject.wrong = 0
    subject.score = 0
    subject.maxScore = 0
  })

  // Calculate statistics
  questions.forEach(question => {
    const subject = groupedSubjects.value.find(
      s => s.id === question.subject
    )

    if (!subject) return

    if (question.userAnswer) {
      answered++
      subject.answered++

      if (question.userAnswer === question.answer) {
        correct++
        subject.correct++
      } else {
        wrong++
        subject.wrong++
      }
    }
  })

  const unanswered = total - answered

  // ==================================
  // JAMB MARK CaALCULATION (2.5 marks/question)
  // ==================================

  let aggregate = 0
  let maxAggregate = 0

  groupedSubjects.value.forEach(subject => {
     // JAMB total questions for this subject
  const jambQuestions =
      ["english", "english-language"].includes(subject.id) ? 60 : 40
      
        
    // Score out of 100
    subject.score = Number(
      ((subject.correct / jambQuestions) * 100).toFixed(2)
    )

    
    subject.maxScore = Number(
      ((subject.questions.length / jambQuestions) * 100).toFixed(2)
    )

    aggregate += subject.score
    maxAggregate += subject.maxScore
  })


aggregate = Number(aggregate.toFixed(2))
maxAggregate = Number(maxAggregate.toFixed(2))

  // Overall percentage (optional)
  const percentage = Number(
    ((correct / Math.max(total, 1)) * 100).toFixed(2)
  )

  // ==================================
  // TIME CALCULATIONS
  // ==================================

  examHeader.value?.stop()

  const totalDuration = durationToSeconds(
    appState.value.examSettings.duration
  )

  const remainingTime = Number(examHeader.value?.getTimeLeft?.())
  const timeLeft = Number.isFinite(remainingTime)
    ? Math.max(0, Math.min(totalDuration, remainingTime))
    : totalDuration

  const durationUsed = Math.max(0, totalDuration - timeLeft)
  const timeSpent = secondsToDuration(durationUsed)

  const speed = Number(
    (
      correct /
      Math.max(durationUsed / 60, 1)
    ).toFixed(2)
  )

  const timePercent = totalDuration > 0
    ? Math.min(Math.round((durationUsed / totalDuration) * 100), 100)
    : 0
  
  const result = {
    total,
    answered,
    unanswered,
    correct,
    wrong,

    // Overall percentage
    percentage,
    timestart: groupedSubjects.value.startingDate,
    // Total score and maximum possible score
    aggregate,
    maxAggregate,

    // Subjects with individual scores
    subjects: groupedSubjects.value,

    totalDuration,
    durationUsed,
    timeSpent,
    timePercent,
    speed
  }



await save({

    result,

    questions: appState.value.examQuestions,

    settings: appState.value.examSettings

})
  appState.value.examResult = result

  
  showExamReport.value = true
}

console.log(appState.value.examResult);

function timeFinished() {
  submitExam()
  // alert("Exam Finished!")
  
}

function selectAnswer(letter) {
  if (!currentQuestion.value) return

  const options = currentQuestion.value.options || {}

  const key = Object.keys(options).find(
    k => k.toLowerCase() === letter.toLowerCase()
  )

  if (key) {
    currentQuestion.value.userAnswer = key
  }
}
///KEY HANDLING
function preventRefresh(e) {
  if (
    e.key === "F5" ||
    (e.ctrlKey && e.key.toLowerCase() === "r")
  ) {
    e.preventDefault()
  }
}


function handleKeyboard(event) {
  // Don't trigger shortcuts while typing
  const tag = document.activeElement?.tagName

  if (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    document.activeElement?.isContentEditable
  ) {
    return
  }

  const key = event.key.toLowerCase()

  
  switch (key) {
    case "n":
      next()
      break

    case "p":
      previous()
      break
    case "arrowright":
      next()
      break
    case "arrowleft":
      previous()
      break

    case "a":
      selectAnswer("A")
      break

    case "b":
      selectAnswer("B")
      break

    case "c":
      selectAnswer("C")
      break

    case "d":
      selectAnswer("D")
      break

    case "e":
      selectAnswer("E")
      break
  }
}



///KEY HANDLING
onMounted(async () => {
  if (
    !isMobileTauri() &&
    window.__TAURI_INTERNALS__
  ) {
    try {
      await appWindow.setFullscreen(true)
    } catch (error) {
      console.error("Failed to enter exam fullscreen:", error)
    }
  }

  window.addEventListener("keydown", handleKeyboard)
   window.addEventListener("keydown", preventRefresh)
    document.addEventListener("contextmenu", e => {
    e.preventDefault()
  })

  document.addEventListener("dragstart", e => {
  e.preventDefault()
})

function preventShortcuts(e) {
  const key = e.key.toLowerCase()

  if (
    e.key === "F5" ||
    (e.ctrlKey && ["r", "u", "s", "p"].includes(key)) ||
    e.key === "F12"
  ) {
    e.preventDefault()
  }
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
   
  }
})


})

const startingDate = ref(null)

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeyboard)
   window.removeEventListener("keydown", preventRefresh)
})
const currentTime = ref(0)

function ticking(seconds) {
  currentTime.value = seconds
}
onMounted( async () => {

    let globalIndex = 1
      if (appState.value.selectedSubjects?.length> 0 &&  !appState.value.reviewQuestions) {
         activeSubject.value =  appState.value.selectedSubjects[0].id
         groupedSubjects.value = appState.value.selectedSubjects.map(subject => {

        const subjectQuestions =   appState.value.examQuestions.filter(q => q.subject === subject.id).map(question => ({
              ...question,
              index: globalIndex++,
              answered: false,
              
            }))

        return {
          ...subject,
          currentQuestion: 1,
          answered: 0,
         
          questions: subjectQuestions
        }
      })
      }

       if (appState.value.selectedSubjectsView?.length >0 &&  appState.value.reviewQuestions) {
         activeSubject.value =  appState.value.selectedSubjectsView[0].id
         groupedSubjects.value = appState.value.selectedSubjectsView.map(subject => {

        const subjectQuestions =   appState.value.examQuestionsView.filter(q => q.subject === subject.id).map(question => ({
              ...question,
              index: globalIndex++,
              answered: false,
              
            }))
             Submitted.value = true

        return {
          ...subject,
          currentQuestion: 1,
          answered: 0,
         
          questions: subjectQuestions
        }
      })
      }
     
     startingDate.value =   new Date().toISOString(),
      currentSubject.value = groupedSubjects.value[0] 
      currentQuestion.value = currentSubject.value.questions[0]
    startQuestionTimer()
      examHeader.value?.start()
      
})
onBeforeUnmount(async () => {
  if (
    isMobileTauri() ||
    !window.__TAURI_INTERNALS__
  ) {
    return
  }

  try {
    await appWindow.setFullscreen(false)
    await appWindow.setDecorations(true)
    await appWindow.setResizable(true)
    await appWindow.setAlwaysOnTop(false)
    await appWindow.maximize()
  } catch (error) {
    console.error("Failed to restore the application window:", error)
  }
})

// ==========================================
// DISPLAY HELPERS (new: keep the template short)
// ==========================================

const attemptedCount = computed(() => {
  return (
    currentSubject.value?.questions?.filter(
      (question) => question.userAnswer
    ).length || 0
  )
})

const totalCount = computed(() => {
  return currentSubject.value?.questions?.length || 0
})

const progressPercent = computed(() => {
  return totalCount.value
    ? Math.round((attemptedCount.value / totalCount.value) * 100)
    : 0
})

// idle | selected | correct | wrong
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

// Tile style in the question navigator (one blue hue only)
const tileClass = (question, index) => {
  const isCurrent = currentSubject.value?.currentQuestion === index + 1
  const answered = Boolean(question.userAnswer)

  if (isCurrent) {
    return answered
      ? "bg-blue-100 text-[#0B2F6B] ring-2 ring-[#0A6CFF]"
      : "bg-white text-[#0A6CFF] ring-2 ring-[#0A6CFF]"
  }

  return answered
    ? "bg-blue-100 text-[#0B2F6B]"
    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
}

// Result strip under each tile after submitting
const getQuestionClass = (question, index) => {
  if (Submitted.value) {
    if (question.answer === question.userAnswer) {
      return "bg-[#0A6CFF] text-white"
    }

    if (
      question.userAnswer &&
      question.userAnswer !== question.answer
    ) {
      return "bg-[#0B2F6B] text-white"
    }

    return "bg-slate-400 text-white"
  }

  return ""
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
      class="fixed right-0 top-2 z-[100] flex h-12 items-center justify-end px-2 sm:px-6 lg:px-8"
    >
      <ExamSubmitModal
        v-model="showSubmitModal"
        @submit="submitExam"
      />
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
          class="flex h-14 shrink-0 items-center justify-between bg-[#0B2F6B] px-4 text-white sm:px-6"
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

          <ExamTopicRort
            :questions="appState.examResult?.subjects || []"
          />
        </div>
      </div>
    </div>

    <!-- ========================================= -->
    <!-- SUBJECT TABS + PROGRESS BAR -->
    <!-- ========================================= -->
    <div
      class="relative z-10 shrink-0 bg-white shadow-[0_2px_10px_rgba(20,49,109,0.06)]"
    >
      <div
        class="flex overflow-x-auto px-2 [scrollbar-width:none] sm:px-10 [&::-webkit-scrollbar]:hidden"
      >
        <button
          v-for="subject in (appState.reviewQuestions
            ? appState.selectedSubjectsView || []
            : appState.selectedSubjects || [])"
          :key="subject.id"
          type="button"
          class="relative h-11 shrink-0 whitespace-nowrap px-4 text-xs font-bold transition active:bg-blue-50 sm:px-6"
          :class="
            activeSubject === subject.id
              ? 'text-[#0A6CFF]'
              : 'text-slate-500'
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
    <main class="flex min-h-0 flex-1 overflow-hidden">
      <!-- DESKTOP QUESTION NAVIGATOR -->
      <aside class="hidden shrink-0 p-3 pr-0 sm:flex sm:w-56 md:w-64 lg:w-72">
        <div
          class="flex min-h-0 w-full flex-col overflow-hidden rounded-3xl bg-white shadow-[0_8px_24px_rgba(20,49,109,0.07)] ring-1 ring-blue-50"
        >
          <div class="shrink-0 border-b border-blue-50 px-4 py-3">
            <h3 class="text-xs font-bold text-slate-500">
              Attempt: {{ attemptedCount }}/{{ totalCount }}
            </h3>
          </div>

          <div
            class="grid min-h-0 flex-1 grid-cols-5 content-start gap-2 overflow-y-auto overscroll-contain p-3"
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
      <section class="flex min-w-0 flex-1 p-3 sm:p-4">
        <div
          class="flex min-h-0 w-full flex-col overflow-hidden rounded-3xl bg-white shadow-[0_8px_24px_rgba(20,49,109,0.07)] ring-1 ring-blue-50"
        >
          <!-- card header -->
          <div class="flex shrink-0 items-center justify-between gap-2 px-4 pt-4 sm:px-6">
            <span
              class="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#0A6CFF]"
            >
              Question:
              {{ currentSubject?.currentQuestion || 0 }}/{{
                currentSubject?.questions?.length || 0
              }}
            </span>

            <button
              v-if="!Submitted"
              type="button"
              class="block h-8 rounded-xl bg-[#0B2F6B] px-3 text-xs font-bold text-white transition active:scale-95 sm:hidden"
              @click="showSubmitModal = true"
            >
              Submit
            </button>

            <button
              v-if="Submitted"
              type="button"
              class="block h-8 rounded-xl bg-[#0B2F6B] px-3 text-xs font-bold text-white transition active:scale-95 sm:hidden"
              @click="showExamReport = true"
            >
              Result
            </button>
          </div>

          <!-- scrolling question + options -->
          <div
            class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-24 pt-3 sm:px-6 sm:pb-4"
          >
            <div class="mx-auto w-full max-w-3xl">
              <img
                v-if="currentQuestion?.imageUrl"
                :src="currentQuestion.imageUrl"
                class="mb-3 max-h-64 max-w-full rounded-2xl object-contain"
                alt="Question image"
              />

              <div
                v-if="currentQuestion?.section"
                class="question-section"
                v-html="currentQuestion.section"
              ></div>

              <div
                class="question-content"
                v-html="
                  currentQuestion?.question ||
                  currentQuestion?.text ||
                  'Question not available'
                "
              ></div>

              <!-- OPTIONS (Flutter-style selectable tiles) -->
              <div class="mt-4 flex flex-col gap-2">
                <label
                  v-for="([key, value]) in Object.entries(
                    currentQuestion?.options || {}
                  )"
                  :key="key"
                  class="flex cursor-pointer items-center gap-3 rounded-2xl border-[1.5px] p-3 transition active:scale-[0.99]"
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
                      'bg-[#0B2F6B] text-white':
                        optionState(key) === 'wrong',
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
                  >
                    {{ value }}
                  </span>

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
                v-if="Submitted"
                class="mt-5 rounded-2xl bg-blue-50 p-3 text-sm"
              >
                <QuestionExplanation
                  v-if="currentQuestion"
                  :question="currentQuestion"
                />
              </div>
            </div>
          </div>

          <!-- BOTTOM ACTION BAR -->
          <div
            class="flex shrink-0 items-center justify-between gap-2 border-t border-blue-50 bg-white px-3 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3 sm:px-6 sm:pb-3"
          >
            <div class="flex gap-2">
              <button
                type="button"
                class="flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-2xl bg-blue-50 px-3 text-sm font-bold text-[#0A6CFF] transition hover:bg-blue-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 sm:px-4"
                :disabled="currentSubject?.currentQuestion <= 1"
                @click="previous"
              >
                <Icon name="lucide:chevron-left" class="h-5 w-5" />
                <span class="hidden sm:inline">Previous</span>
              </button>

              <button
                type="button"
                class="flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-2xl bg-[#0A6CFF] px-3 text-sm font-bold text-white shadow-[0_6px_14px_rgba(10,108,255,0.35)] transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none sm:px-4"
                :disabled="
                  currentSubject?.currentQuestion >=
                  currentSubject?.questions?.length
                "
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
                class="h-11 rounded-2xl bg-[#0B2F6B] px-4 text-sm font-bold text-white transition hover:brightness-125 active:scale-95"
                @click="showExamReport = true"
              >
                Result
              </button>

              <button
                v-if="!Submitted"
                type="button"
                class="h-11 rounded-2xl bg-[#0B2F6B] px-4 text-sm font-bold text-white transition hover:brightness-125 active:scale-95"
                @click="showSubmitModal = true"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- MOBILE FLOATING "QUESTIONS" BUTTON (extended FAB) -->
    <button
      v-if="!showMobileQuestionList"
      type="button"
      class="fixed bottom-[calc(env(safe-area-inset-bottom)+22px)] right-4 z-[110] flex h-12 items-center gap-2 rounded-2xl bg-[#0A6CFF] px-4 text-white shadow-[0_8px_20px_rgba(10,108,255,0.45)] transition active:scale-95 sm:hidden"
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
        v-if="showMobileQuestionList"
        class="fixed inset-0 z-[120] bg-black/50 sm:hidden"
        @click="closeMobileQuestionList"
      ></div>
    </Transition>

    <!-- MOBILE BOTTOM SHEET -->
    <Transition name="question-sheet">
      <section
        v-if="showMobileQuestionList"
        class="fixed inset-x-0 bottom-0 z-[130] flex max-h-[80dvh] flex-col rounded-t-[28px] bg-white shadow-2xl sm:hidden"
      >
        <div class="flex shrink-0 justify-center pt-2">
          <div class="h-1.5 w-12 rounded-full bg-slate-200"></div>
        </div>

        <div class="flex shrink-0 items-center justify-between px-5 py-3">
          <div>
            <h2 class="text-sm font-bold text-[#0B2F6B]">
              Question Navigator
            </h2>

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
        <div class="mx-4 shrink-0 rounded-2xl bg-blue-50 px-4 py-3">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-500">Attempted</span>

            <span class="text-sm font-bold text-[#0A6CFF]">
              {{ attemptedCount }} / {{ totalCount }}
            </span>
          </div>

          <div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-blue-100">
            <div
              class="h-full rounded-full bg-[#0A6CFF] transition-all duration-300"
              :style="{ width: progressPercent + '%' }"
            ></div>
          </div>
        </div>

        <!-- grid -->
        <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
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
          class="shrink-0 border-t border-blue-50 bg-white px-5 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-3"
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
  padding: 12px;
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
  padding: 7px 9px;
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
  padding: 10px;
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