<script setup>
import { computed, ref, watch } from 'vue'
import katex from 'katex'
import 'katex/dist/katex.min.css'

const props = defineProps({
  questions: {
    type: Array,
    required: true,
    default: () => []
  }
})

const currentIndex = ref(0)
const selectedAnswer = ref(null)
const checked = ref(false)

/*
|--------------------------------------------------------------------------
| TEST POPUP
|--------------------------------------------------------------------------
*/

const showTest = ref(false)

function openTest() {
  showTest.value = true
}

function closeTest() {
  showTest.value = false
}

/*
|--------------------------------------------------------------------------
| CURRENT QUESTION
|--------------------------------------------------------------------------
*/

const currentQuestion = computed(() => {
  return props.questions[currentIndex.value] || null
})

/*
|--------------------------------------------------------------------------
| CHECK ANSWER
|--------------------------------------------------------------------------
*/

const isCorrect = computed(() => {
  if (!currentQuestion.value || !selectedAnswer.value) {
    return false
  }

  return (
    selectedAnswer.value.toUpperCase() ===
    String(currentQuestion.value.answer || '').toUpperCase()
  )
})

/*
|--------------------------------------------------------------------------
| PROGRESS
|--------------------------------------------------------------------------
*/

const progress = computed(() => {
  if (!props.questions.length) return 0

  return Math.round(
    ((currentIndex.value + 1) / props.questions.length) * 100
  )
})

/*
|--------------------------------------------------------------------------
| SELECT ANSWER
|--------------------------------------------------------------------------
*/

function selectAnswer(key) {
  if (checked.value) return

  selectedAnswer.value = key
}

/*
|--------------------------------------------------------------------------
| CHECK ANSWER
|--------------------------------------------------------------------------
*/

function checkAnswer() {
  if (!selectedAnswer.value) return

  checked.value = true
}

/*
|--------------------------------------------------------------------------
| NEXT QUESTION
|--------------------------------------------------------------------------
*/

function nextQuestion() {
  if (currentIndex.value >= props.questions.length - 1) {
    return
  }

  currentIndex.value++
  selectedAnswer.value = null
  checked.value = false
}

/*
|--------------------------------------------------------------------------
| PREVIOUS QUESTION
|--------------------------------------------------------------------------
*/

function previousQuestion() {
  if (currentIndex.value <= 0) return

  currentIndex.value--
  selectedAnswer.value = null
  checked.value = false
}

/*
|--------------------------------------------------------------------------
| RESTART QUIZ
|--------------------------------------------------------------------------
*/

function restartQuiz() {
  currentIndex.value = 0
  selectedAnswer.value = null
  checked.value = false
}

/*
|--------------------------------------------------------------------------
| WATCH QUESTIONS
|--------------------------------------------------------------------------
*/

watch(
  () => props.questions,
  () => {
    currentIndex.value = 0
    selectedAnswer.value = null
    checked.value = false
  }
)

/*
|--------------------------------------------------------------------------
| KATEX
|--------------------------------------------------------------------------
*/

function renderMath(latex, displayMode = true) {
  if (!latex) return ''

  try {
    return katex.renderToString(String(latex), {
      throwOnError: false,
      displayMode,
      strict: false
    })
  } catch (error) {
    console.error('KaTeX rendering error:', error)

    return `
      <span class="text-[#0B2F6B] text-sm">
        ${String(latex)}
      </span>
    `
  }
}

/*
|--------------------------------------------------------------------------
| RENDER TEXT + OPTIONAL MATH
|--------------------------------------------------------------------------
|
| Supports:
|
| {
|   text: "Find the matrix",
|   math: {
|     latex: "\\begin{bmatrix}..."
|   }
| }
|
*/

function renderMathObject(value, display = true) {
  if (!value) return ''

  if (typeof value === 'string') {
    return renderMath(value, display)
  }

  if (typeof value === 'object' && value.latex) {
    return renderMath(
      value.latex,
      value.display !== false
    )
  }

  return ''
}

/*
|--------------------------------------------------------------------------
| OPTION HELPERS
|--------------------------------------------------------------------------
*/

function optionText(value) {
  if (value == null) return ''

  if (typeof value === 'string') {
    return value
  }

  return value.text_html || value.text || ''
}

function optionMath(value) {
  if (!value || typeof value !== 'object') {
    return null
  }

  if (value.math?.latex) {
    return value.math
  }

  if (value.latex) {
    return value
  }

  return null
}

/*
|--------------------------------------------------------------------------
| QUESTION TEXT
|--------------------------------------------------------------------------
*/

function questionText(question) {
  return (
    question?.text_html ||
    question?.question_html ||
    question?.question ||
    question?.text ||
    ''
  )
}

/*
|--------------------------------------------------------------------------
| QUESTION MATH
|--------------------------------------------------------------------------
*/

function questionMath(question) {
  if (!question) return null

  if (question.question_math?.latex) {
    return question.question_math
  }

  if (question.math?.latex) {
    return question.math
  }

  return null
}

/*
|--------------------------------------------------------------------------
| SOLUTION / EXPLANATION
|--------------------------------------------------------------------------
*/

function solutionText(question) {
  if (!question) return ''

  return (
    question.explanation ||
    question.solution ||
    question.explanation_html ||
    question.solution_html ||
    ''
  )
}

function solutionMath(question) {
  if (!question) return null

  if (question.explanation_math?.latex) {
    return question.explanation_math
  }

  if (question.solution_math?.latex) {
    return question.solution_math
  }

  return null
}
</script>


<template>
  <!-- ========================================================= -->
  <!-- EMPTY -->
  <!-- ========================================================= -->

  <div
    v-if="!questions.length"
    class="rounded-2xl bg-blue-50 p-5 text-center text-sm text-slate-500"
  >
    No practice questions available.
  </div>


  <!-- ========================================================= -->
  <!-- QUIZ BUTTON -->
  <!-- ========================================================= -->

  <button
    v-else
    type="button"
    class="flex h-10 items-center gap-2 rounded-2xl bg-[#0A6CFF] px-4 text-sm font-bold text-white shadow-[0_6px_14px_rgba(10,108,255,0.35)] transition hover:brightness-110 active:scale-95"
    @click="openTest"
  >
    <Icon name="lucide:clipboard-check" class="h-4 w-4" />

    Test
  </button>


  <!-- ========================================================= -->
  <!-- TEST POPUP (bottom sheet on phones, dialog on desktop) -->
  <!-- ========================================================= -->

  <Teleport to="body">
    <Transition name="test-modal">
      <div
        v-if="showTest && currentQuestion"
        class="fixed inset-0 z-[9999] flex items-end justify-center sm:items-center sm:p-4"
      >
        <!-- BACKDROP -->
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          @click="closeTest"
        ></div>

        <!-- MODAL -->
        <div
          class="test-panel relative z-10 flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[10px] bg-white font-['Inter',system-ui,sans-serif] shadow-2xl sm:max-h-[90dvh] sm:rounded-3xl"
        >
          <!-- HEADER -->
          <div
            class="flex shrink-0 items-center justify-between bg-[#0B2F6B] px-4 py-3 text-white sm:px-5 sm:py-4"
          >
            <div>
              <p class="text-[10px] font-bold uppercase tracking-widest text-white/65">
                Test
              </p>

              <h2 class="mt-0.5 text-base font-bold tabular-nums">
                Question {{ currentIndex + 1 }}
                of
                {{ questions.length }}
              </h2>
            </div>

            <!-- CLOSE -->
            <button
              type="button"
              class="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20 active:scale-95"
              aria-label="Close test"
              @click="closeTest"
            >
              <Icon name="lucide:x" class="h-5 w-5" />
            </button>
          </div>

          <!-- PROGRESS -->
          <div class="h-1 shrink-0 bg-blue-100">
            <div
              class="h-full rounded-r-full bg-[#0A6CFF] transition-all duration-300"
              :style="{ width: `${progress}%` }"
            ></div>
          </div>

          <!-- MODAL CONTENT (this is the part that scrolls) -->
          <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 sm:p-5">
            <!-- QUESTION -->
            <div class="mb-5">
              <!-- Question text -->
              <div
                v-if="questionText(currentQuestion)"
                class="rich break-words text-base font-semibold leading-relaxed text-[#0B2F6B] sm:text-lg"
                v-html="questionText(currentQuestion)"
              ></div>

              <!-- Question matrix / formula -->
              <div
                v-if="questionMath(currentQuestion)"
                class="mt-4 overflow-x-auto rounded-2xl bg-blue-50 px-3 py-5"
              >
                <div
                  class="flex min-w-max justify-center text-[#0B2F6B]"
                  v-html="renderMathObject(questionMath(currentQuestion))"
                ></div>
              </div>
            </div>

            <!-- OPTIONS -->
            <div class="space-y-2">
              <button
                v-for="([key, value]) in Object.entries(
                  currentQuestion.options || {}
                )"
                :key="key"
                type="button"
                :disabled="checked"
                class="flex w-full items-start gap-3 rounded-2xl border-[1.5px] p-3 text-left transition active:scale-[0.99]"
                :class="[
                  checked && key === currentQuestion.answer
                    ? 'border-[#0A6CFF] bg-blue-50'
                    : checked &&
                        key === selectedAnswer &&
                        key !== currentQuestion.answer
                      ? 'border-[#0B2F6B] bg-slate-100'
                      : selectedAnswer === key
                        ? 'border-[#0A6CFF] bg-blue-50'
                        : 'border-blue-100 bg-white hover:bg-blue-50/60'
                ]"
                @click="selectAnswer(key)"
              >
                <!-- OPTION LETTER -->
                <span
                  class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                  :class="[
                    checked && key === currentQuestion.answer
                      ? 'bg-[#0A6CFF] text-white'
                      : checked &&
                          key === selectedAnswer &&
                          key !== currentQuestion.answer
                        ? 'bg-[#0B2F6B] text-white'
                        : selectedAnswer === key
                          ? 'bg-[#0A6CFF] text-white'
                          : 'border-2 border-blue-200 bg-white text-slate-500'
                  ]"
                >
                  {{ key }}
                </span>

                <!-- OPTION CONTENT -->
                <div class="min-w-0 flex-1">
                  <!-- Normal option text -->
                  <div
                    v-if="optionText(value)"
                    class="rich break-words text-[15px] leading-snug text-[#201F22]"
                    v-html="optionText(value)"
                  ></div>

                  <!-- Option matrix / formula -->
                  <div
                    v-if="optionMath(value)"
                    class="mt-3 overflow-x-auto rounded-xl bg-white px-3 py-4"
                  >
                    <div
                      class="flex min-w-max justify-center text-[#0B2F6B]"
                      v-html="renderMathObject(optionMath(value))"
                    ></div>
                  </div>
                </div>

                <!-- CORRECT -->
                <Icon
                  v-if="checked && key === currentQuestion.answer"
                  name="lucide:check-circle-2"
                  class="mt-1 h-5 w-5 shrink-0 text-[#0A6CFF]"
                />

                <!-- WRONG -->
                <Icon
                  v-else-if="
                    checked &&
                    key === selectedAnswer &&
                    key !== currentQuestion.answer
                  "
                  name="lucide:x-circle"
                  class="mt-1 h-5 w-5 shrink-0 text-[#0B2F6B]"
                />
              </button>
            </div>

            <!-- SOLUTION -->
            <div
              v-if="checked"
              class="mt-5 rounded-2xl p-3 sm:p-4"
              :class="isCorrect ? 'bg-blue-50' : 'bg-slate-100'"
            >
              <div class="flex items-start gap-3">
                <!-- ICON -->
                <div
                  class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white"
                  :class="isCorrect ? 'bg-[#0A6CFF]' : 'bg-[#0B2F6B]'"
                >
                  <Icon
                    v-if="isCorrect"
                    name="lucide:check"
                    class="h-5 w-5"
                  />

                  <Icon
                    v-else
                    name="lucide:x"
                    class="h-5 w-5"
                  />
                </div>

                <!-- SOLUTION CONTENT -->
                <div class="min-w-0 flex-1">
                  <p class="font-bold text-[#0B2F6B]">
                    {{ isCorrect ? 'Correct!' : 'Incorrect' }}
                  </p>

                  <!-- CORRECT ANSWER -->
                  <div class="mt-1 break-words text-sm text-slate-700">
                    <span>Correct Answer:</span>

                    <strong class="ml-1 text-[#0B2F6B]">
                      {{ currentQuestion.answer }}
                    </strong>

                    <!-- Correct answer text -->
                    <template
                      v-if="currentQuestion.options?.[currentQuestion.answer]"
                    >
                      <span class="ml-1">—</span>

                      <span
                        v-if="
                          typeof currentQuestion.options[
                            currentQuestion.answer
                          ] === 'string'
                        "
                        class="ml-1"
                      >
                        {{ currentQuestion.options[currentQuestion.answer] }}
                      </span>
                    </template>
                  </div>

                  <!-- Correct answer matrix -->
                  <div
                    v-if="
                      optionMath(
                        currentQuestion.options?.[currentQuestion.answer]
                      )
                    "
                    class="mt-3 overflow-x-auto rounded-xl bg-white px-3 py-4"
                  >
                    <div
                      class="flex min-w-max justify-center text-[#0B2F6B]"
                      v-html="
                        renderMathObject(
                          optionMath(
                            currentQuestion.options?.[currentQuestion.answer]
                          )
                        )
                      "
                    ></div>
                  </div>

                  <!-- EXPLANATION -->
                  <div
                    v-if="
                      solutionText(currentQuestion) ||
                      solutionMath(currentQuestion)
                    "
                    class="mt-4 border-t border-black/10 pt-4"
                  >
                    <p class="mb-2 font-bold text-[#0B2F6B]">Solution</p>

                    <!-- Explanation text -->
                    <div
                      v-if="solutionText(currentQuestion)"
                      class="rich break-words text-sm leading-6 text-slate-700"
                      v-html="solutionText(currentQuestion)"
                    ></div>

                    <!-- Explanation formula -->
                    <div
                      v-if="solutionMath(currentQuestion)"
                      class="mt-3 overflow-x-auto rounded-xl bg-white px-3 py-4"
                    >
                      <div
                        class="flex min-w-max justify-center text-[#0B2F6B]"
                        v-html="renderMathObject(solutionMath(currentQuestion))"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- FOOTER -->
          <div
            class="flex shrink-0 items-center justify-between gap-2 border-t border-blue-50 bg-white px-3 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3 sm:gap-3 sm:px-5 sm:pb-4"
          >
            <!-- PREVIOUS -->
            <button
              type="button"
              :disabled="currentIndex === 0"
              class="flex h-11 items-center gap-1.5 rounded-2xl bg-blue-50 px-3 text-sm font-bold text-[#0A6CFF] transition hover:bg-blue-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 sm:px-4"
              @click="previousQuestion"
            >
              <Icon name="lucide:chevron-left" class="h-4 w-4" />

              Previous
            </button>

            <div class="flex flex-1 justify-end">
              <!-- CHECK -->
              <button
                v-if="!checked"
                type="button"
                :disabled="!selectedAnswer"
                class="flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#0A6CFF] px-5 text-sm font-bold text-white shadow-[0_6px_14px_rgba(10,108,255,0.35)] transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none sm:flex-none"
                @click="checkAnswer"
              >
                <Icon name="lucide:check-circle-2" class="h-4 w-4" />

                Check Answer
              </button>

              <!-- NEXT -->
              <button
                v-else-if="currentIndex < questions.length - 1"
                type="button"
                class="flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#0A6CFF] px-5 text-sm font-bold text-white shadow-[0_6px_14px_rgba(10,108,255,0.35)] transition hover:brightness-110 active:scale-95 sm:flex-none"
                @click="nextQuestion"
              >
                Next Question

                <Icon name="lucide:chevron-right" class="h-4 w-4" />
              </button>

              <!-- FINISH -->
              <button
                v-else
                type="button"
                class="flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#0B2F6B] px-5 text-sm font-bold text-white transition hover:brightness-125 active:scale-95 sm:flex-none"
                @click="restartQuiz"
              >
                <Icon name="lucide:rotate-ccw" class="h-4 w-4" />

                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>


<style scoped>
button {
  -webkit-tap-highlight-color: transparent;
}

/*
|--------------------------------------------------------------------------
| MODAL ANIMATION
| phones: sheet slides up   |   desktop: dialog fades and scales
|--------------------------------------------------------------------------
*/

.test-modal-enter-active,
.test-modal-leave-active {
  transition: opacity 0.2s ease;
}

.test-modal-enter-active .test-panel,
.test-modal-leave-active .test-panel {
  transition: transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.test-modal-enter-from,
.test-modal-leave-to {
  opacity: 0;
}

.test-modal-enter-from .test-panel,
.test-modal-leave-to .test-panel {
  transform: translateY(100%);
}

@media (min-width: 640px) {
  .test-modal-enter-from .test-panel,
  .test-modal-leave-to .test-panel {
    transform: scale(0.96);
  }
}

@media (prefers-reduced-motion: reduce) {
  .test-modal-enter-active,
  .test-modal-leave-active,
  .test-modal-enter-active .test-panel,
  .test-modal-leave-active .test-panel {
    transition: none;
  }
}

/*
|--------------------------------------------------------------------------
| TEXT FROM THE DATABASE (v-html): never wider than the screen
|--------------------------------------------------------------------------
*/

.rich :deep(*) {
  max-width: 100%;
}

.rich :deep(p) {
  margin: 0 0 0.5rem;
}

.rich :deep(p:last-child) {
  margin-bottom: 0;
}

.rich :deep(img) {
  display: block;
  height: auto;
  margin: 0.5rem auto;
  border-radius: 0.75rem;
}

.rich :deep(table) {
  display: block;
  width: 100%;
  overflow-x: auto;
  border-collapse: collapse;
}

.rich :deep(th),
.rich :deep(td) {
  padding: 0.35rem 0.5rem;
  border: 1px solid #dbeafe;
}

.rich :deep(ul) {
  padding-left: 1.25rem;
  list-style: disc;
}

.rich :deep(ol) {
  padding-left: 1.25rem;
  list-style: decimal;
}

/*
|--------------------------------------------------------------------------
| KATEX
|--------------------------------------------------------------------------
*/

:deep(.katex-display) {
  margin: 0 !important;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0.5rem 0;
}

:deep(.katex) {
  font-size: 1.1em;
}

/* LARGE MATRICES */
:deep(.katex-display .katex) {
  max-width: 100%;
}

/* MOBILE */
@media (max-width: 640px) {
  :deep(.katex) {
    font-size: 1em;
  }

  :deep(.katex-display) {
    padding-left: 0.25rem;
    padding-right: 0.25rem;
  }
}
</style>