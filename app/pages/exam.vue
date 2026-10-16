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

 
  
//   await appWindow.setDecorations(false)
//   await appWindow.setResizable(false)
//   await appWindow.setFullscreen(true)
//   await appWindow.setAlwaysOnTop(true)

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

// function pauseExam() {
//   timer.value.pause()
// }

  console.log(appState.value.examResult);

// function resumeExam() {
//   timer.value.resume()
// }


// function resetExam() {
//   timer.value.reset()
// }

// // Reset to 30 minutes
// function reset30Minutes() {
//   timer.value.reset(1800)
// }

// Reset to 5 minutes
// function reset5Minutes() {
//   timer.value.reset(300)
// }

// function addOneMinute() {
//   timer.value.timeLeft += 60
// }

// function removeOneMinute() {
//   timer.value.timeLeft -= 60
// }
// const currentTime = ref(0)

// function ticking(seconds) {
//   currentTime.value = seconds
// }

function timeFinished() {
  submitExam()
  // alert("Exam Finished!")
  
}

// import { onMounted, onBeforeUnmount } from "vue"
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
  
  // await load()
  // console.log(histories.value);
  
    // if (!appState.value.selectedSubjects?.length) return
  
     
  
   


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


const getQuestionClass = (question, index) => {
  if (Submitted.value) {
    if (question.answer === question.userAnswer) {
      return "bg-green-600 text-white"
    }

    if (
      question.userAnswer &&
      question.userAnswer !== question.answer
    ) {
      return "bg-red-500 text-white"
    }

    return "bg-orange-500 text-white"
  }

  return ""
}


///FOr Exam Summary 


</script>
<template>
  <div class="min-h-screen w-screen overflow-hidden bg-white">
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
    <NavigationExamNavBar ref="examHeader"
   
   :current-question="currentQuestion"
  :question-number="currentSubject?.currentQuestion"
  @time-finished="submitExam"
 />

    <!-- RESULT MODAL -->
    <div
      v-if="showExamReport"
      class="fixed inset-0 z-[200] flex h-dvh w-full items-center justify-center bg-black/40 p-3"
    >
      <div
        class="flex h-[90%] w-full max-w-3xl flex-col overflow-hidden rounded-lg bg-white"
      >
        <!-- REPORT HEADER -->
        <div
          class="flex h-14 shrink-0 items-center justify-between bg-primary px-4 text-white sm:px-6"
        >
          <h2 class="text-base font-semibold sm:text-lg">
            Examination Report
          </h2>

          <button
            type="button"
            @click="showExamReport = false"
            class="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/20"
          >
            <Icon
              name="lucide:x"
              class="text-2xl font-semibold text-white"
            />
          </button>
        </div>

        <!-- REPORT CONTENT -->
        <div class="flex-1 overflow-y-auto">
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

    <!-- SUBJECT TABS -->
    <div
      class="flex h-10 items-end overflow-x-auto border-b-2 border-b-primary px-3 sm:px-14"
    >
      <button
        v-for="subject in
          appState.reviewQuestions
            ? appState.selectedSubjectsView || []
            : appState.selectedSubjects || []"
        :key="subject.id"
        @click="selectSubject(subject)"
        :class="[
          'flex items-end whitespace-nowrap px-4 pb-1 pt-1 text-sm font-bld sm:px-7',
          activeSubject === subject.id
            ? 'exam-tab text-white'
            : 'text-primary'
        ]"
      >
        {{ subject?.name || "No subject" }}
      </button>
    </div>

    <!-- MAIN EXAM AREA -->
    <main
      class="flex h-[calc(100vh-104px)] w-full flex-col-reverse overflow-hidden sm:flex-row"
    >

      <!-- DESKTOP QUESTION SIDEBAR -->
      <section
        class="hidden h-full overflow-y-auto border-r border-slate-200 bg-white p-4 sm:block sm:w-1/4"
      >
        <div class="mb-6 flex justify-between text-gray-500">
          <h3 class="text-sm font-medium">
            Attempt:
            {{
              currentSubject?.questions?.filter(
                question => question.userAnswer
              ).length || 0
            }}/{{ currentSubject?.questions?.length || 0 }}
          </h3>
        </div>

        <div class="grid grid-cols-5 gap-3 pb-10">
          <button
            v-for="(question, index) in currentSubject?.questions || []"
            :key="question.id || question.sourceId || index"
            @click="goToQuestion(index)"
            :class="[
              'flex h-12 w-full cursor-pointer flex-col overflow-hidden rounded-sm text-sm transition-all',
              currentSubject?.currentQuestion === index + 1 &&
              question.userAnswer
                ? 'border-2 border-blue-500 bg-blue-200 text-primary'
                : currentSubject?.currentQuestion === index + 1
                  ? 'border-2 border-blue-500 text-blue-700'
                  : question.userAnswer
                    ? 'bg-blue-200 text-primary'
                    : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
            ]"
          >
            <!-- NUMBER -->
            <div class="flex flex-1 items-center justify-center">
              {{ index + 1 }}
            </div>

            <!-- TIME / RESULT -->
            <div
              v-if="Submitted"
              :class="[
                'mt-auto flex h-4 w-full items-center justify-center text-[10px] text-white',
                getQuestionClass(question, index)
              ]"
            >
              {{ question.timeSpent || 0 }}s
            </div>
          </button>
        </div>
      </section>

      <!-- QUESTION CONTENT -->
      <section class="flex overflow-y-auto w-full flex-1 p-2 sm:p-5">
        <div class="flex overflow-y-auto w-full flex-1 flex-col justify-between">

          <!-- QUESTION BODY -->
          <div class="w-full flex-1 overflow-y-auto pb-4">
            <div class=" flex justify-between">  
              <h3 class="mb-4 text-[clamp(17px,1vw,17px)] text-gray-700">
              Question:
              {{ currentSubject?.currentQuestion || 0 }}/{{
                currentSubject?.questions?.length || 0
              }}
            </h3>

              <button
              v-if="!Submitted"
              @click="showSubmitModal = true"
              class="rounded-sm bg-orange-800 h-fit sm:hidden block w-fit px-3 py-1 text-md text-white"
            >
              Submit
            </button>

             <button
              v-if="Submitted"
              @click="showExamReport = true"
              class="rounded-sm sm:hidden block bg-orange-800 h-fit w-fit px-3 py-1 text-md text-white"
            >
              Result
            </button>
            </div>
            

            <div class="mx-auto w-full">
            
              <!-- QUESTION IMAGE -->
              <img
                v-if="currentQuestion?.imageUrl"
                :src="currentQuestion.imageUrl"
                class="mb-3 max-h-64 max-w-full object-contain"
                alt="Question image"
              />
            <div
              v-if="currentQuestion?.section"
              v-html="currentQuestion.section"
              class="question-section"
            ></div>

            <div
              v-html="
                currentQuestion?.question ||
                currentQuestion?.text ||
                'Question not available'
              "
              class="question-content"
            ></div>

              <!-- QUESTION TEXT -->
              
             
              <!-- OPTIONS -->
              <div class="space-y-1">
                <label
                  v-for="([key, value]) in Object.entries(
                    currentQuestion?.options || {}
                  )"
                  :key="key"
                  class="flex cursor-pointer items-center gap-2 rounded-xl sm:p-2 p-1 transition-all hover:bg-slate-50"
                >
                  <input
                    v-model="currentQuestion.userAnswer"
                    type="radio"
                    :value="key"
                    class="hidden"
                    :disabled="Submitted"
                  />

                  <!-- STATUS ICON -->
                  <Icon
                    v-if="
                      Submitted &&
                      key === currentQuestion?.answer
                    "
                    name="lucide:check"
                    class="h-5 w-5 text-green-600"
                  />

                  <Icon
                    v-else-if="
                      Submitted &&
                      key === currentQuestion?.userAnswer &&
                      currentQuestion?.userAnswer !==
                        currentQuestion?.answer
                    "
                    name="lucide:x"
                    class="h-5 w-5 text-red-600"
                  />

                  <!-- OPTION LETTER -->
                  <div
                    class="flex sm:h-7 h-7 text-lg w-7 sm:w-7 shrink-0 items-center justify-center rounded-full border-2 font-medium uppercase transition-all"
                    :class="[
                      Submitted &&
                      key === currentQuestion?.answer
                        ? 'border-green-600 bg-green-600 text-white'
                        : Submitted &&
                            key === currentQuestion?.userAnswer &&
                            currentQuestion?.userAnswer !==
                              currentQuestion?.answer
                          ? 'border-red-600 bg-red-600 text-white'
                          : currentQuestion?.userAnswer === key
                            ? 'border-primary bg-primary text-white'
                            : 'border-slate-300 text-slate-600'
                    ]"
                  >
                    {{ key }}
                  </div>

                  <!-- OPTION TEXT -->
                  <span
                    class="flex-1 text-lg  font-normal text-slate-800 sm:text-[17px]"
                    :class="[
                      Submitted &&
                      key === currentQuestion?.answer
                        ? 'font-bold text-green-700'
                        : Submitted &&
                            key === currentQuestion?.userAnswer &&
                            currentQuestion?.userAnswer !==
                              currentQuestion?.answer
                          ? 'font-bold text-red-700'
                          : ''
                    ]"
                  >
                    {{ value }}
                  </span>
                </label>
              </div>

              <!-- EXPLANATION -->
              <div
                v-if="Submitted"
                class="mt-5 text-sm border-t border-slate-200 pt-4"
              >
                            <QuestionExplanation
                v-if="currentQuestion"
                :question="currentQuestion"
              />

                
              </div>
            </div>
          </div>

          <!-- BOTTOM NAVIGATION -->
          <div
            class="flex w-full items-center justify-between gap-2 border-t border-slate-100 bg-white pt-3"
          >
            <div class="flex gap-2">
              <!-- PREVIOUS -->
              <button
                @click="previous"
                :disabled="currentSubject?.currentQuestion <= 1"
                class="flex items-center gap-1 rounded-sm bg-primary px-2 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50 sm:px-3"
              >
                <Icon name="lucide:chevron-left" class="h-5 w-5" />
                <span class="hidden sm:inline">Previous</span>
              </button>

              <!-- NEXT -->
              <button
                @click="next"
                :disabled="
                  currentSubject?.currentQuestion >=
                  currentSubject?.questions?.length
                "
                class="flex items-center gap-1 rounded-sm bg-green-700 px-2 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50 sm:px-3"
              >
                <span class="hidden sm:inline">Next</span>
                <Icon name="lucide:chevron-right" class="h-5 w-5" />
              </button>

              <!-- RESULT -->
              <button
                v-if="Submitted"
                @click="showExamReport = true"
                class="rounded-sm sm:block hidden bg-orange-800 px-3 py-2 text-sm text-white"
              >
                Result
              </button>
            </div>

            <!-- SUBMIT -->
            <button
              v-if="!Submitted"
              @click="showSubmitModal = true"
              class="rounded-sm hidden sm:block bg-orange-800 px-3 py-2 text-sm text-white"
            >
              Submit
            </button>
          </div>
        </div>
      </section>
    </main>

    <!-- MOBILE FLOATING QUESTIONS BUTTON -->
    <button
      v-if="!showMobileQuestionList"
      @click="openMobileQuestionList"
      class="fixed bottom-5 right-4 z-[110] w-fit h-fit flex items-center gap-2 rounded-full bg-primary px-4 py-2 w-fit text-sm font-semibold text-white shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 sm:hidden"
    >
      <Icon name="lucide:grid-3x3" class="h-3 w-3" />

      <span class=" text-xs">Questions</span>

      <span
        class="rounded-full bg-white/20 px-2 py-0.5 text-xs"
      >
        {{ currentSubject?.currentQuestion || 0 }}/{{
          currentSubject?.questions?.length || 0
        }}
      </span>
    </button>

    <!-- MOBILE BOTTOM SHEET OVERLAY -->
    <Transition name="question-overlay">
      <div
        v-if="showMobileQuestionList"
        class="fixed inset-0 z-[120] bg-black/50 sm:hidden"
        @click="closeMobileQuestionList"
      ></div>
    </Transition>

    <!-- MOBILE OPay-STYLE BOTTOM SHEET -->
    <Transition name="question-sheet">
      <section
        v-if="showMobileQuestionList"
        class="fixed bottom-0 left-0 right-0 pb- z-[130] max-h-[70vh] overflow-hdden rounded-t-3xl bg-white shadow-2xl sm:hidden"
      >
        <!-- SHEET HANDLE -->
        <div class="flex justify-center pt-2">
          <div class="h-1.5 w-12 rounded-full bg-slate-300"></div>
        </div>

        <!-- SHEET HEADER -->
        <div
          class="flex items-center justify-between border-b border-slate-100 px-5 py-2"
        >
          <div>
            <h2 class="text-sm font-bold text-slate-800">
              Question Navigator
            </h2>

            <p class="mt-0.5 text-xs text-slate-500">
              Select a question to continue
            </p>
          </div>

          <button
            @click="closeMobileQuestionList"
            class="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
          >
            <Icon name="lucide:x" class="h-5 w-5" />
          </button>
        </div>

        <!-- ATTEMPT SUMMARY -->
        <div
          class="mx-2 mt-2 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
        >
          <span class="text-sm text-slate-500">
            Attempted
          </span>

          <span class="text-sm font-bold text-primary">
            {{
              currentSubject?.questions?.filter(
                question => question.userAnswer
              ).length || 0
            }}
            /
            {{ currentSubject?.questions?.length || 0 }}
          </span>
        </div>

        <!-- QUESTION GRID -->
        <div class="max-h-[55vh] overflow-y-auto pb-16 2 px-5 py-5">
          <div class="grid grid-cols-5 gap-3">
           <button
            v-for="(question, index) in currentSubject?.questions || []"
            :key="question.id || question.sourceId || index"
            @click="goToQuestion(index)"
            :class="[
              'flex h-12 w-full cursor-pointer flex-col overflow-hidden rounded-sm text-sm transition-all',
              currentSubject?.currentQuestion === index + 1 &&
              question.userAnswer
                ? 'border-2 border-blue-500 bg-blue-200 text-primary'
                : currentSubject?.currentQuestion === index + 1
                  ? 'border-2 border-blue-500 text-blue-700'
                  : question.userAnswer
                    ? 'bg-blue-200 text-primary'
                    : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
            ]"
          >
            <!-- NUMBER -->
            <div class="flex flex-1 items-center justify-center">
              {{ index + 1 }}
            </div>

            <!-- TIME / RESULT -->
            <div
              v-if="Submitted"
              :class="[
                'mt-auto flex h-4 w-full items-center justify-center text-[10px] text-white',
                getQuestionClass(question, index)
              ]"
            >
              {{ question.timeSpent || 0 }}s
            </div>
          </button>
          </div>
        </div>
        <div class=" h-60 w-full"></div>
        <!-- SHEET FOOTER -->
        <div
          class="border-t border-slate-100 bg-white px-5 py-4"
        >
          <button
            @click="closeMobileQuestionList"
            class="flex w-full mb-40 items-center justify-center rounded-xl bg-primary py-3 font-semibold text-white transition active:scale-[0.98]"
          >
            Continue Exam
          </button>
        </div>
      </section>
    </Transition>

  </div>
</template>
<style>
.exam-tab{
    

    background-image:url("~/assets/images/icons/tab1.svg"); 
    background-repeat:no-repeat;
    background-size:100% 100%;
    background-position:center;

    border:none;
    
   
}

/* =========================================================
   QUESTION CONTENT
   ========================================================= */

.question-section,
.question-content {
  width: 100%;
  max-width: 100%;
  color: #24304a;
  font-family: inherit;
  font-size: 17px;
  font-weight: 500;
  line-height: 1.7;
  overflow-wrap: anywhere;
  word-break: normal;
}

/* Section / instruction */
.question-section {
  margin-bottom: 10px;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.7;
}
/* Main question */
.question-content {
  margin-bottom: 8px;
  font-size: 17px;
  font-weight: 500;
  line-height: 1.7;
}

/* =========================================================
   HTML GENERATED BY v-html
   ========================================================= */

.question-section :deep(*),
.question-content :deep(*) {
  max-width: 100%;
}

/* Paragraphs */
.question-section :deep(p),
.question-content :deep(p) {
  margin: 0 0 8px;
  font-size: inherit;
  line-height: inherit;
}

/* Last paragraph should not create extra space */
.question-section :deep(p:last-child),
.question-content :deep(p:last-child) {
  margin-bottom: 0;
}

/* Bold text */
.question-section :deep(strong),
.question-section :deep(b),
.question-content :deep(strong),
.question-content :deep(b) {
  font-weight: 700;
}

/* Italic */
.question-section :deep(em),
.question-section :deep(i),
.question-content :deep(em),
.question-content :deep(i) {
  font-style: italic;
}

/* Headings inside question HTML */
.question-section :deep(h1),
.question-section :deep(h2),
.question-section :deep(h3),
.question-section :deep(h4),
.question-content :deep(h1),
.question-content :deep(h2),
.question-content :deep(h3),
.question-content :deep(h4) {
  margin: 8px 0;
  color: #24304a;
  font-size: inherit;
  font-weight: 700;
  line-height: 1.5;
}

/* =========================================================
   LISTS
   ========================================================= */

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

/* =========================================================
   IMAGES
   ========================================================= */

.question-section :deep(img),
.question-content :deep(img) {
  display: block;
  width: auto;
  max-width: 100%;
  height: auto;
  margin: 10px auto;
  object-fit: contain;
}

/* =========================================================
   TABLES
   ========================================================= */

.question-section :deep(table),
.question-content :deep(table) {
  width: 100%;
  max-width: 100%;
  margin: 10px 0;
  border-collapse: collapse;
  overflow-x: auto;
  font-size: 14px;
}

.question-section :deep(th),
.question-section :deep(td),
.question-content :deep(th),
.question-content :deep(td) {
  padding: 7px 9px;
  border: 1px solid #d9dde5;
  text-align: left;
  vertical-align: top;
}

.question-section :deep(th),
.question-content :deep(th) {
  font-weight: 700;
  background: #f6f3ec;
}

/* =========================================================
   SUPERSCRIPT / SUBSCRIPT
   ========================================================= */

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

/* =========================================================
   CODE / PRE
   ========================================================= */

.question-section :deep(code),
.question-content :deep(code) {
  font-family: "IBM Plex Mono", monospace;
  font-size: 0.9em;
  overflow-wrap: anywhere;
}

.question-section :deep(pre),
.question-content :deep(pre) {
  max-width: 100%;
  margin: 10px 0;
  padding: 10px;
  overflow-x: auto;
  border-radius: 8px;
  background: #f4f4f4;
}

/* =========================================================
   MOBILE
   ========================================================= */

@media (max-width: 640px) {
  .question-section {
    font-size: 16px;
    line-height: 1.55;
  }

  .question-content {
    font-size: 17px;
    line-height: 1.65;
  }

  .question-section :deep(p),
  .question-content :deep(p) {
    margin-bottom: 6px;
  }

  .question-section :deep(table),
  .question-content :deep(table) {
    display: block;
    overflow-x: auto;
    white-space: normal;
  }

  .question-section :deep(img),
  .question-content :deep(img) {
    max-width: 100%;
    height: auto;
  }
}

/* =========================================================
   LARGER SCREENS
   ========================================================= */

@media (min-width: 640px) {
  .question-section {
    font-size: 16px;
  }

  .question-content {
    font-size: 16px;
    line-height: 1.7;
  }
}
</style>
