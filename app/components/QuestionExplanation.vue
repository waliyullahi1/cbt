
<template>
  <section
    v-if="hasExplanation"
    class="mt-5 w-full overflow-hidden rounded-2xl border border-[#b9873b]/20 bg-[#f6f3ec] shadow-sm"
  >
    <!-- Header -->
    <button
      type="button"
      class="flex w-full items-center justify-between gap-3 px-2 py-4 text-left transition-colors duration-200 hover:bg-[#eee9df] sm:gap-4 sm:px-5 sm:py-4"
      @click="expanded = !expanded"
    >
      <!-- Left -->
      <div class="flex min-w-0 items-center gap-3">
        <!-- Icon -->
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#24304a] text-[#f6f3ec] sm:h-11 sm:w-11"
        >
          <Icon
            name="lucide:lightbulb"
            class="h-5 w-5 sm:h-5.5 sm:w-5.5"
          />
        </div>

        <!-- Title -->
        <div class="min-w-0">
          <h3
            class="truncate text-sm font-bold text-[#24304a] sm:text-base"
          >
            Explanation
          </h3>

          <p
            class="mt-0.5 line-clamp-1 text-xs text-gray-500 sm:text-sm"
          >
            Understand why this answer is correct
          </p>
        </div>
      </div>

      <!-- Arrow -->
      <div
        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#24304a] transition-colors hover:bg-white sm:h-9 sm:w-9"
      >
        <Icon
          name="lucide:chevron-down"
          class="h-5 w-5 transition-transform duration-200"
          :class="{ 'rotate-180': expanded }"
        />
      </div>
    </button>

    <!-- Content -->
    <Transition name="explanation">
      <div
        v-if="expanded"
        class="border-t border-[#b9873b]/15 px-1 pb-5 pt-5 sm:px-5 sm:pb-6"
      >
        <!-- Main Explanation -->
        <div
          v-if="explanationText"
          class="mb-5 sm:mb-6"
        >
          <div class="mb-2.5 flex items-center gap-2">
            <Icon
              name="lucide:circle-check"
              class="h-4 w-4 shrink-0 text-[#b9873b]"
            />

            <h4
              class="text-xs font-bold uppercase tracking-wide text-[#24304a] sm:text-sm"
            >
              Why this answer?
            </h4>
          </div>

          <!-- HTML Explanation -->
          <div
            class="explanation-content text-sm leading-7 text-gray-700 sm:text-[15px]"
            v-html="explanationText"
          />
        </div>

        <!-- Simple Explanation -->
        <div
          v-if="question.explanation?.simplifiedExplanation"
          class="mb-5 rounded-xl border border-blue-200 bg-blue-50 p-2 sm:mb-6 sm:p-5"
        >
          <div class="mb-2.5 flex items-center gap-2">
            <Icon
              name="lucide:book-open"
              class="h-4 w-4 shrink-0 text-blue-700"
            />

            <h4 class="text-sm font-bold text-blue-900">
              Simple Explanation
            </h4>
          </div>

          <div
            class="mistake-content text-sm font-semibold leading-6 text-gray-800"
  v-html="renderMath(mistake.mistake)"
          />
        </div>

        <!-- Common Mistakes -->
        <div
          v-if="commonMistakes.length"
          class="mb-5 sm:mb-6"
        >
          <!-- Heading -->
          <div class="mb-3 flex items-center gap-2">
            <Icon
              name="lucide:triangle-alert"
              class="h-4 w-4 shrink-0 text-red-600"
            />

            <h4 class="text-sm font-bold text-[#24304a]">
              Common Mistakes
            </h4>
          </div>

          <!-- Mistakes -->
          <div class="space-y-3">
            <div
              v-for="(mistake, index) in commonMistakes"
              :key="index"
              class="rounded-xl border border-red-100 bg-white p-2 shadow-sm sm:p-5"
            >
              <!-- Mistake -->
              <div class="flex items-start gap-3">
                <div
                  class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-50 text-xs font-bold text-red-600"
                >
                  {{ index + 1 }}
                </div>

                <div class="min-w-0 flex-1">
                  <div
                    class="mistake-content text-sm font-semibold leading-6 text-gray-800"
                    v-html="mistake.mistake"
                  />
                </div>
              </div>

              <!-- Why Wrong -->
              <div
                v-if="mistake.whyWrong"
                class="mt-3 border-t border-gray-100 pt-3"
              >
                <div class="flex items-start gap-2">
                  <Icon
                    name="lucide:x-circle"
                    class="mt-0.5 h-4 w-4 shrink-0 text-red-500"
                  />

                  <div class="min-w-0 flex-1">
                    <span
                      class="text-xs font-bold uppercase tracking-wide text-red-600"
                    >
                      Why it's wrong
                    </span>

                    <div
                        class="why-wrong-content mt-1 text-sm leading-6 text-gray-600"
                      v-html="renderMath(mistake.whyWrong)"

                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- AI Metadata -->
        <div
          v-if="showMetadata"
          class="flex flex-wrap items-center gap-2 border-t border-gray-200 pt-4"
        >
          <!-- Source -->
          <span
            v-if="question.explanation?.sourceType"
            class="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs text-gray-600"
          >
            <Icon
              name="lucide:database"
              class="h-3.5 w-3.5"
            />

            Source:
            {{ question.explanation.sourceType }}
          </span>

          <!-- Confidence -->
          <span
            v-if="question.explanation?.confidence !== undefined"
            class="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs text-green-700"
          >
            <Icon
              name="lucide:badge-check"
              class="h-3.5 w-3.5"
            />

            Confidence:
            {{ Math.round(question.explanation.confidence * 100) }}%
          </span>

          <!-- Review -->
          <span
            v-if="question.explanation?.needsReview"
            class="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs text-amber-700"
          >
            <Icon
              name="lucide:clock-3"
              class="h-3.5 w-3.5"
            />

            Needs review
          </span>
        </div>
      </div>
    </Transition>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"

const props = withDefaults(
  defineProps<{
    question: any
    defaultOpen?: boolean
    showMetadata?: boolean
  }>(),
  {
    defaultOpen: false,
    showMetadata: false
  }
)

const expanded = ref(props.defaultOpen)

/*
|--------------------------------------------------------------------------
| Explanation
|--------------------------------------------------------------------------
*/

const explanation = computed(() => {
  return props.question?.explanation ?? null
})

/*
|--------------------------------------------------------------------------
| Check whether explanation exists
|--------------------------------------------------------------------------
*/

const hasExplanation = computed(() => {
  const data = explanation.value

  if (!data) {
    return false
  }

  return Boolean(
    data.explanation ||
    data.simplifiedExplanation ||
    (
      Array.isArray(data.commonMistakes) &&
      data.commonMistakes.length > 0
    )
  )
})

/*
|--------------------------------------------------------------------------
| Main explanation
|--------------------------------------------------------------------------
*/

const explanationText = computed(() => {
  return renderMath(explanation.value?.explanation || "")
})

/*
|--------------------------------------------------------------------------
| Common mistakes
|--------------------------------------------------------------------------
*/

const commonMistakes = computed(() => {
  const mistakes = explanation.value?.commonMistakes

  return Array.isArray(mistakes)
    ? mistakes
    : []
})
</script>

<style scoped>
/*
|--------------------------------------------------------------------------
| Explanation transition
|--------------------------------------------------------------------------
*/

.explanation-enter-active,
.explanation-leave-active {
  transition:
    opacity 0.2s ease,
    max-height 0.25s ease;
  overflow: hidden;
}

.explanation-enter-from,
.explanation-leave-to {
  opacity: 0;
  max-height: 0;
}

.explanation-enter-to,
.explanation-leave-from {
  opacity: 1;
  max-height: 2000px;
}

/*
|--------------------------------------------------------------------------
| v-html content
|--------------------------------------------------------------------------
*/

.explanation-content :deep(p),
.simple-explanation-content :deep(p),
.mistake-content :deep(p),
.why-wrong-content :deep(p) {
  margin-bottom: 0.75rem;
}
.explanation-content :deep(.katex),
.simple-explanation-content :deep(.katex),
.mistake-content :deep(.katex),
.why-wrong-content :deep(.katex) {
  white-space: nowrap;
  overflow-wrap: normal;
  word-break: normal;
}

.explanation-content :deep(.katex-display),
.simple-explanation-content :deep(.katex-display),
.mistake-content :deep(.katex-display),
.why-wrong-content :deep(.katex-display) {
  overflow-x: auto;
  overflow-y: hidden;
  padding: 4px 0;
}
.explanation-content :deep(p:last-child),
.simple-explanation-content :deep(p:last-child),
.mistake-content :deep(p:last-child),
.why-wrong-content :deep(p:last-child) {
  margin-bottom: 0;
}

.explanation-content :deep(strong),
.simple-explanation-content :deep(strong),
.mistake-content :deep(strong),
.why-wrong-content :deep(strong) {
  font-weight: 700;
}

.explanation-content :deep(em),
.simple-explanation-content :deep(em) {
  font-style: italic;
}

.explanation-content :deep(ul),
.simple-explanation-content :deep(ul) {
  margin: 0.75rem 0;
  padding-left: 1.25rem;
  list-style: disc;
}

.explanation-content :deep(ol),
.simple-explanation-content :deep(ol) {
  margin: 0.75rem 0;
  padding-left: 1.25rem;
  list-style: decimal;
}

.explanation-content :deep(li),
.simple-explanation-content :deep(li) {
  margin-bottom: 0.35rem;
}

.explanation-content :deep(a),
.simple-explanation-content :deep(a) {
  color: #b9873b;
  text-decoration: underline;
}

.explanation-content :deep(img),
.simple-explanation-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 0.75rem;
  margin: 1rem 0;
}
</style>

