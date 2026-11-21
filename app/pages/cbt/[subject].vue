
<script setup lang="ts">


const route = useRoute()

const subjectId = String(route.params.subject || "")

const subject = ref<CbtSubject | null>(null)

const loading = ref(true)
const error = ref("")
const showAnswers = ref(true)
const answers = ref<Record<string, string | string[]>>({})
const submitting = ref(false)

const attemptResult = ref<{
  score: number
  possible: number
  percentage: number
} | null>(null)

onMounted(async () => {
  try {
    subject.value = await getCbtSubject(subjectId)
  } catch (err: any) {
    error.value = err?.message || "Unable to load past questions."
  } finally {
    loading.value = false
  }
})

type NumberedBlock = CbtBlock & {
  number?: string
  questionNumber?: string
}

function getQuestionNumber(block: CbtBlock): string {
  const item = block as NumberedBlock
  return item.number || item.questionNumber || ""
}

/**
 * Convert answers into HTML.
 * HTML strings are preserved.
 * Plain text is converted into paragraphs with line breaks.
 */
function formatHtml(
  value: string | number | string[] | undefined
): string {
  if (value === undefined || value === null) return ""

  if (Array.isArray(value)) {
    return value.map(item => `<p>${escapeHtml(String(item))}</p>`).join("")
  }

  const content = String(value)

  // Preserve existing HTML content.
  if (/<\/?[a-z][\s\S]*>/i.test(content)) {
    return content
  }

  // Convert plain text to safe HTML.
  return content
    .split(/\n{2,}/)
    .map(paragraph => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("")
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

function hasAnswer(block: CbtBlock): boolean {
  return (
    block.answer !== undefined &&
    block.answer !== null &&
    block.answer !== ""
  )
}

// Show "A. text" without doubling the letter if the option already has one.
function formatOption(option: string, index: number): string {
  const text = String(option)

  if (/^[A-Za-z][.)]\s/.test(text)) return text

  return `${String.fromCharCode(65 + index)}. ${text}`
}

// async function submitAttempt() {
//   if (!subject.value) return

//   if (auth.value.user?.role !== "student") {
//     error.value = "Sign in as a student to submit an attempt."
//     return
//   }

//   submitting.value = true
//   error.value = ""

//   try {
//     const response = await submitCbtAttempt(
//       subject.value.id,
//       answers.value
//     )

//     attemptResult.value = response.data
//   } catch (err: any) {
//     error.value =
//       err?.data?.message ||
//       err?.message ||
//       "Unable to submit your attempt."
//   } finally {
//     submitting.value = false
//   }
// }
</script>

<template>
  <div class=" relative  overflow-scroll h-[100dvh]  bg-white text-black">

    <NavigationNavbar />

    <main class="mx-auto max-w-4xl px-5 pb-20 pt-7 sm:pt-20">

      <p v-if="loading">
        Loading past questions...
      </p>

      <p v-else-if="error && !subject" class="text-red-600">
        {{ error }}
      </p>

      <template v-else-if="subject">

        <!-- Paper Header -->
        <header class="mb-8 border-b border-gray-300 pb-5">

          <div class="mb-5 flex items-center justify-between">
            <NuxtLink
              to="/"
              class="text-sm text-blue-700 underline"
            >
              ← Back to subjects
            </NuxtLink>

           
            
          </div>

          <h1 class="text-center text-xl font-bold uppercase">
            {{ subject.board }} {{ subject.year }}
          </h1>

          <h2 class="mt-2 text-center text-lg font-bold uppercase">
            {{ subject.name }}
          </h2>

          <p class="mt-2 text-center text-sm">
            {{ subject.paper || "Past Questions" }}
          </p>

          <div class="mt-5 flex justify-between gap-4 text-sm">
            <span>{{ subject.code }}</span>

            <span v-if="subject.durationMinutes">
              Duration: {{ subject.durationMinutes }} minutes
            </span>
          </div>

          <label class="mt-5 flex items-center gap-2 text-sm">
            <input
              v-model="showAnswers"
              type="checkbox"
            />
            Show model answers
          </label>

        </header>

        <!-- General Instructions -->
        <div
          v-if="subject.instructions"
          class="mb-7 text-sm leading-7"
        >
          <strong>INSTRUCTIONS:</strong>
          {{ subject.instructions }}
        </div>

        <!-- Sections -->
        <section
          v-for="section in subject.sections"
          :key="section.id"
          class="mb-10"
        >

          <h2
            class="mb-5 text-center text-base font-bold uppercase underline"
          >
            {{ section.name }}
          </h2>

          <template
            v-for="block in section.blocks"
            :key="block.id"
          >

            <!-- Heading -->
            <h3
              v-if="block.type === 'heading'"
              class="my-5 font-bold underline"
              v-html="formatHtml(block.text || block.title)"
            />

            <!-- Paragraph -->
            <div
              v-else-if="block.type === 'paragraph'"
              class="my-3 text-sm leading-7 question-html"
              v-html="formatHtml(block.text)"
            />

            <!-- Instruction -->
            <div
              v-else-if="block.type === 'instruction'"
              class="my-4 text-sm leading-7 question-html"
            >
              <strong>Instruction: </strong>
              <span v-html="formatHtml(block.text)" />
            </div>

            <!-- Image -->
            <figure
              v-else-if="block.type === 'image'"
              class="my-6"
            >
              <img
                :src="block.src"
                :alt="block.alt || block.caption || 'Examination image'"
                loading="lazy"
                class="mx-auto max-h-[600px] max-w-full object-contain"
              />

              <figcaption
                v-if="block.caption"
                class="mt-2 text-center text-sm"
              >
                {{ block.caption }}
              </figcaption>

              <div
                v-if="block.explanation"
                class="mt-2 text-sm question-html"
                v-html="formatHtml(block.explanation)"
              />
            </figure>

            <!-- Questions -->
            <article
              v-else-if="block.type === 'question'"
              class="my-5"
            >

              <div class="flex items-start gap-2 text-sm leading-7">

                <strong
                  v-if="getQuestionNumber(block)"
                  class="shrink-0"
                >
                  {{ getQuestionNumber(block) }}.
                </strong>

                <div class="min-w-0 flex-1">

                  <div
                    class="question-html"
                    v-html="formatHtml(block.text)"
                  />

                  <span
                    v-if="block.marks"
                    class="ml-2 whitespace-nowrap text-sm"
                  >
                    [{{ block.marks }}
                    mark{{ block.marks > 1 ? "s" : "" }}]
                  </span>

                </div>
              </div>

              <!-- Objective Options -->
              <div
                v-if="block.options?.length"
                class="ml-6 mt-2 space-y-2 text-sm"
              >
                <label
                  v-for="(option, index) in block.options"
                  :key="index"
                  class="flex items-start gap-2 rounded-md p-1"
                  :class="{
                    'cursor-pointer hover:bg-slate-50': !showAnswers
                  }"
                >

                  <input
                    v-if="!showAnswers"
                    v-model="answers[block.id]"
                    type="radio"
                    :name="block.id"
                    :value="option"
                    class="mt-1"
                  />

                  <span>
                    {{ formatOption(option, index) }}
                  </span>

                </label>
              </div>

              <!-- Theory Answer Input -->
              <textarea
                v-else-if="!showAnswers"
                v-model="answers[block.id]"
                rows="4"
                class="ml-6 mt-3 block w-[calc(100%-1.5rem)] rounded-md border border-gray-300 p-3 text-sm"
                placeholder="Write your answer here..."
              />

              <!-- Model Answer -->
              <div
                v-if="showAnswers && hasAnswer(block)"
                class="ml-6 mt-3 text-sm leading-7"
              >

                <div class="mb-2 font-bold text-green-700">
                  MODEL ANSWER
                </div>

                <div
                  class="question-html answer-html"
                  v-html="formatHtml(block.answer)"
                />

                <div
                  v-if="block.explanation"
                  class="mt-3 border-l-2 border-blue-300 pl-3 text-gray-700 question-html"
                  v-html="formatHtml(block.explanation)"
                />

              </div>

            </article>

            <!-- Standalone Answer -->
            <div
              v-else-if="block.type === 'answer'"
              class="my-3 ml-6 text-sm leading-7 question-html"
              v-html="formatHtml(block.text)"
            />

            <!-- Table -->
            <div
              v-else-if="block.type === 'table' && block.headers"
              class="my-5 overflow-x-auto"
            >
              <table class="w-full border-collapse text-sm">

                <thead>
                  <tr>
                    <th
                      v-for="header in block.headers"
                      :key="header"
                      class="border border-black px-3 py-2 text-left"
                    >
                      {{ header }}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr
                    v-for="(row, rowIndex) in block.rows || []"
                    :key="rowIndex"
                  >
                    <td
                      v-for="(cell, cellIndex) in row"
                      :key="cellIndex"
                      class="border border-black px-3 py-2"
                    >
                      {{ cell }}
                    </td>
                  </tr>
                </tbody>

              </table>
            </div>

          </template>

        </section>

        <!-- Submit -->
        <div
          v-if="!showAnswers"
          class="mt-8"
        >
          <button
            type="button"
            :disabled="submitting"
            class="rounded-lg bg-blue-700 px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
            @click="submitAttempt"
          >
            {{
              submitting
                ? "Submitting..."
                : "Submit objective answers"
            }}
          </button>

          <p
            v-if="attemptResult"
            class="mt-3 font-semibold text-emerald-700"
          >
            Objective score:
            {{ attemptResult.score }} /
            {{ attemptResult.possible }}
            ({{ attemptResult.percentage }}%)
          </p>

          <p
            v-if="error"
            class="mt-3 text-sm text-red-600"
          >
            {{ error }}
          </p>
        </div>

        <!-- Footer -->
        <footer
          class="mt-12 border-t border-gray-300 pt-5 text-center text-sm"
        >
          END OF {{ subject.name }} PAST QUESTIONS
        </footer>

      </template>

      <div v-else-if="!loading">
        Subject not found.
      </div>

    </main>
  </div>
</template>

<style scoped>
.question-html :deep(p) {
  margin-bottom: 0.65rem;
}

.question-html :deep(ol) {
  list-style-type: decimal;
  padding-left: 1.75rem;
  margin: 0.5rem 0;
}

.question-html :deep(ul) {
  list-style-type: disc;
  padding-left: 1.75rem;
  margin: 0.5rem 0;
}

.question-html :deep(li) {
  margin-bottom: 0.35rem;
}

.question-html :deep(strong),
.question-html :deep(b) {
  font-weight: 700;
}

.question-html :deep(u) {
  text-decoration: underline;
}

.question-html :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 0.75rem 0;
}

.question-html :deep(th),
.question-html :deep(td) {
  border: 1px solid #333;
  padding: 0.5rem;
  text-align: left;
}

.answer-html {
  line-height: 1.8;
}
</style>
