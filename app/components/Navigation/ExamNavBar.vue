<template>
  <div class="bg-primary sm:pt-0  ">
    <!-- ========================================= -->
    <!-- BOOKMARK SUCCESS MODAL -->
    <!-- ========================================= -->

    <BookmarkModal
      :visible="showBookmarkModal"
      :question="bookmarkedQuestion"
      @close="closeBookmarkModal"
    />

    <!-- ========================================= -->
    <!-- BOOKMARK ERROR MESSAGE -->
    <!-- ========================================= -->

    <Teleport to="body">
      <Transition name="fade">
        <p
          v-if="bookmarkError"
          class="fixed bottom-5 left-1/2 z-[10000] -translate-x-1/2 rounded-lg bg-red-600 px-4 py-3 text-center text-sm text-white shadow-xl"
        >
          {{ bookmarkError }}
        </p>
      </Transition>
    </Teleport>

    <!-- ========================================= -->
    <!-- CALCULATOR -->
    <!-- ========================================= -->

    <Teleport to="body">
      <div
        v-if="showCalculator"
        class="pointer-events-none fixed inset-0 top-0 z-[100]"
      >
        <Calculator
          class="pointer-events-auto"
          @close="openCalculator"
        />
      </div>
    </Teleport>

    <!-- ========================================= -->
    <!-- TOP HEADER -->
    <!-- ========================================= -->

    <header
      class="fixed sm:pt-0 pt-6 inset-x-0 top-0 z-50 sm:h-12 h-14 border-b border-white/10 bg-primary text-white shadow-lg"
    >
      <div
        class="mx-auto flex h-full w-full items-center justify-between px-3 sm:px-6 lg:px-8"
      >
        <!-- ================================= -->
        <!-- LEFT: EXAM TOOLS -->
        <!-- ================================= -->

        <nav class="flex h-full items-center gap-1 sm:gap-2">
          <button
            v-for="tool in examTools"
            :key="tool.label"
            type="button"
            class="exam-tool-button group"
            :aria-label="tool.label"
            :title="tool.label"
            @click="tool.onClick"
          >
            <Icon
              :name="tool.icon"
              class="shrink-0 text-lg transition-transform duration-200 group-hover:scale-110"
            />

            <span
              class="hidden text-sm font-medium md:flex"
            >
              {{ tool.label }}
            </span>
          </button>
        </nav>

        <!-- ================================= -->
        <!-- RIGHT: USER + TIMER -->
        <!-- ================================= -->

        <div class="flex items-center gap-2 sm:gap-5">
          <!-- USER -->
          <div class="hidden items-center gap-2 sm:flex">
            <div
              class="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20"
            >
              <Icon
                name="lucide:user-round"
                class="h-5 w-5"
              />
            </div>

            <span
              class="max-w-[120px] truncate text-sm font-medium capitalize sm:text-base"
            >
              {{ currentUser.firstName || "Candidate" }}
            </span>
          </div>

          <!-- TIMER -->
          <ExamTimer
            ref="timer"
            :duration="examDuration"
            :auto-start="false"
            @finished="timeFinished"
            @tick="ticking"
          />
        </div>
      </div>
    </header>

    <!-- HEADER SPACING -->
    <div class="h-12 w-full bg-primary"></div>

    <!-- ========================================= -->
    <!-- LEAVE EXAM CONFIRMATION -->
    <!-- ========================================= -->

    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="logoutNotice"
          class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 p-4"
          @click.self="logoutNotice = false"
        >
          <!-- MODAL -->
          <section
            class="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="leave-exam-title"
          >
            <!-- MODAL HEADER -->
            <header
              class="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6"
            >
              <div class="flex items-center gap-3">
                <div
                  class="flex h-11 w-11 items-center justify-center rounded-full bg-orange-50 text-orange-600"
                >
                  <Icon
                    name="lucide:log-out"
                    class="h-5 w-5"
                  />
                </div>

                <div>
                  <h2
                    id="leave-exam-title"
                    class="text-lg font-bold text-slate-900"
                  >
                    Leave Exam
                  </h2>

                  <p class="text-xs text-slate-500">
                    Exit your current examination
                  </p>
                </div>
              </div>

              <!-- CLOSE BUTTON -->
              <button
                type="button"
                aria-label="Close leave exam dialog"
                class="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                @click="logoutNotice = false"
              >
                <Icon
                  name="lucide:x"
                  class="h-5 w-5"
                />
              </button>
            </header>

            <!-- MODAL BODY -->
            <div class="px-5 py-6 sm:px-6">
              <div
                class="flex items-start gap-3 rounded-xl bg-amber-50 p-4"
              >
                <Icon
                  name="lucide:alert-triangle"
                  class="mt-0.5 h-5 w-5 shrink-0 text-amber-600"
                />

                <div>
                  <p class="text-sm font-bold text-slate-800">
                    Do you want to leave the exam?
                  </p>

                  <p
                    class="mt-1 text-sm leading-6 text-slate-600"
                  >
                    Your current exam progress may be lost. You can
                    return to the practice page.
                  </p>
                </div>
              </div>

              <!-- BUTTONS -->
              <div
                class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"
              >
                <!-- CONTINUE EXAM -->
                <button
                  type="button"
                  class="flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 active:scale-95 sm:flex-none"
                  @click="logoutNotice = false"
                >
                  <Icon
                    name="lucide:arrow-left"
                    class="h-4 w-4"
                  />

                  Continue Exam
                </button>

                <!-- LEAVE EXAM -->
                <button
                  type="button"
                  class="flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 active:scale-95 sm:flex-none"
                  @click="logout"
                >
                  <Icon
                    name="lucide:log-out"
                    class="h-4 w-4"
                  />

                  Leave Exam
                </button>
              </div>
            </div>
          </section>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, ref } from "vue"
import { useBookmarks } from "~/composables/useBookmarks"
import { durationToSeconds } from "~/utils/examTime"

const appState = useAppState()

// ==========================================
// PROPS FROM PARENT
// ==========================================

const props = defineProps({
  currentQuestion: {
    type: Object,
    default: () => ({}),
  },

  questionNumber: {
    type: Number,
    default: 0,
  },
})

// ==========================================
// EVENTS
// ==========================================

const emit = defineEmits(["timeFinished"])

// ==========================================
// STATE
// ==========================================

const logoutNotice = ref(false)
const showCalculator = ref(false)

const showBookmarkModal = ref(false)
const bookmarkedQuestion = ref({})
const bookmarkSaving = ref(false)
const bookmarkError = ref("")

const timer = ref(null)

// ==========================================
// AUTHENTICATION
// ==========================================

const auth = useExamTipsAuth()

const currentUser = computed(() => {
  return auth.user?.value || auth.user || {}
})

// ==========================================
// EXAM DURATION
// ==========================================

const examDuration = computed(() => {
  const duration = appState.value?.examSettings?.duration
  return durationToSeconds(duration)
})

// ==========================================
// LOGOUT
// ==========================================

const logout = async () => {
  try {
    logoutNotice.value = false
    await navigateTo("/")
  } catch (error) {
    console.error("Failed to leave exam:", error)
  }
}

// ==========================================
// CALCULATOR
// ==========================================

const openCalculator = () => {
  showCalculator.value = !showCalculator.value
}

// ==========================================
// BOOKMARK
// ==========================================

const { saveBookmark } = useBookmarks()

const openBookmark = async () => {
  const question = props.currentQuestion

  if (
    !question ||
    Object.keys(question).length === 0
  ) {
    bookmarkError.value =
      "No question is currently selected."

    return
  }

  if (bookmarkSaving.value) {
    return
  }

  bookmarkSaving.value = true
  bookmarkError.value = ""

  try {
    const questionToSave = {
      ...question,

      questionNumber:
        props.questionNumber ||
        question.questionNumber ||
        question.number ||
        null,
    }

    await saveBookmark(questionToSave)

    bookmarkedQuestion.value = {
      ...questionToSave,
    }

    showBookmarkModal.value = true
  } catch (error) {
    console.error(
      "Failed to save bookmark:",
      error,
    )

    bookmarkError.value =
      error?.message ||
      "Unable to save this question."

    // Automatically clear the error
    setTimeout(() => {
      bookmarkError.value = ""
    }, 4000)
  } finally {
    bookmarkSaving.value = false
  }
}

const closeBookmarkModal = () => {
  showBookmarkModal.value = false
}

// ==========================================
// OTHER TOOLS
// ==========================================

const reportError = () => {
  console.log("Report error")
}

const openDictionary = () => {
  console.log("Open dictionary")
}

const openAiTutor = () => {
  console.log("Open AI Tutor")
}

// ==========================================
// TIMER
// ==========================================

const timeFinished = () => {
  emit("timeFinished")
}

const ticking = (seconds) => {
  console.log("Time remaining:", seconds)
}

// ==========================================
// EXAM TOOLS
// ==========================================

const examTools = [
  {
    label: "Log Out",
    icon: "lucide:log-out",

    onClick: () => {
      logoutNotice.value = true
    },
  },

  {
    label: "Calculator",
    icon: "lucide:calculator",
    onClick: openCalculator,
  },

  {
    label: "Bookmark",
    icon: "lucide:bookmark",
    onClick: openBookmark,
  },

  {
    label: "Dictionary",
    icon: "lucide:book-open",
    onClick: openDictionary,
  },

  // Uncomment when needed
  // {
  //   label: "Report Error",
  //   icon: "lucide:triangle-alert",
  //   onClick: reportError,
  // },

  // {
  //   label: "AI Tutor",
  //   icon: "lucide:bot",
  //   onClick: openAiTutor,
  // },
]

// ==========================================
// EXPOSE TIMER METHODS
// ==========================================

defineExpose({
  timer,

  start: () => timer.value?.start(),

  stop: () => timer.value?.stop(),

  pause: () => timer.value?.pause(),

  resume: () => timer.value?.resume(),

  reset: (seconds) => timer.value?.reset(seconds),

  getTimeLeft: () => timer.value?.timeLeft || 0,
})
</script>

<style scoped>
@reference "tailwindcss";

.exam-tool-button {
  @apply flex h-11 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-white/90 transition-all duration-200 hover:bg-white/10 hover:text-white active:scale-95 sm:px-3;
}

/* Bookmark error animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Leave exam modal animation */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active section,
.modal-leave-active section {
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from section,
.modal-leave-to section {
  opacity: 0;
  transform: translateY(12px) scale(0.96);
}

@media (prefers-reduced-motion: reduce) {
  .fade-enter-active,
  .fade-leave-active,
  .modal-enter-active,
  .modal-leave-active,
  .modal-enter-active section,
  .modal-leave-active section {
    transition: none;
  }
}
</style>