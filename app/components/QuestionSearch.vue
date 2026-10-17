<template>
  <div
    ref="pageRoot"
    class="relative flex h-[100dvh] min-h-0 w-full flex-col overflow-hidden bg-[#F3F8FF] text-[#0B2F6B] font-['Inter',system-ui,sans-serif]"
  >
    <!-- DECORATIVE BACKGROUND (non-interactive) -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <Icon name="lucide:book-open" class="absolute right-[-10px] top-[260px] h-14 w-14 rotate-12 text-blue-200/60" />
      <Icon name="lucide:flask-conical" class="absolute bottom-[110px] left-3 h-10 w-10 -rotate-12 text-blue-200/60" />
      <Icon name="lucide:pencil" class="absolute bottom-[130px] right-4 h-12 w-12 text-blue-200/60" />
      <Icon name="lucide:atom" class="absolute bottom-6 left-5 h-12 w-12 text-blue-200/60" />
    </div>

    <!-- ========================================= -->
    <!-- APP BAR -->
    <!-- ========================================= -->
    

        <header
      class="relative z-10 shrink-0 sm:bg-[#0B2F6B]  bg-transparent  sm:text-white text-[#5B6E8F] sm:shadow-[0_4px_16px_rgba(11,47,107,0.25)]  shadow-[0_1px_2px_rgba(36 sm:backdrop-blur-[4px] sm:backdrop-saturate-[180%]"
    >
      <div class="flex min-h-12 items-center justify-between gap-3 sm:px-4  px-2 py-2">
        <div class="flex min-w-0 items-center gap-3">
         <button
          type="button"
          class="flex sm:hidden h-9 p-0.5 w-9 bg-primary/10 shadow-[0_2px_8px_rgba(20,49,109,0.09)] rounded-full bg-primry   shrink-0 items-center justify-center  active:bg-white/10"
          aria-label="Open menu"
          @click="menuOpen = true"
        > 
          <img src="/images/logos.svg"   class=" w"  >
        </button>
          <span
            class="sm:flex hidden  sm:h-10 sm:w-10 w-8 h-8 shrink-0 items-center justify-center rounded-xl bg-[#0A6CFF] shadow-[0_4px_10px_rgba(10,108,255,0.45)]"
          >
            <Icon name="lucide:search-check" class="sm:h-5 h-3 w-3 sm:w-5" />
          </span>

          <div class="min-w-0">
            <h1 class="truncate  text-[15px] font-bold leading-tight tracking-tight">
              Question Bank
            </h1>
            <p class="mt-0.5 truncate  text-[11px]  leading-tight  sm:text-white/65">
               Search by topic, subject, or any words
            </p>
          </div>
        </div>

        <button
          type="button"
          class="flex sm:h-11 h-9 w-9 sm:w-11 shrink-0 items-center justify-center rounded-full sm:bg-[#0A6CFF] bg-white sm:shadow-[0_4px_10px_rgba(10,108,255,0.45)] shadow-[0_1px_2px_rgba(36,48,74,0.04)] transition active:scale-95"
          aria-label="Go home"
          @click="goHome"
        >
          <Icon name="lucide:house" class="h-5  w-5" />
        </button>
      </div>
    </header>


    

    

    <!-- ========================================= -->
    <!-- MAIN (this is the part that scrolls) -->
    <!-- ========================================= -->
    <main
      class="relative z-10 min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-1 pb-[calc(env(safe-area-inset-bottom)+24px)] pt-4 md:px-8 md:pt-6"
    >
      <div class="mx-auto w-full max-w-5xl">
        <!-- SEARCH BOX -->
        <div
          class="mx-auto flex h-12 w-full max-w-3xl items-center gap-2 rounded-2xl border border-blue-100 bg-white px-3.5 shadow-[0_8px_28px_rgba(20,49,109,0.08)] transition focus-within:border-[#0A6CFF] focus-within:ring-2 focus-within:ring-[#0A6CFF]/20"
        >
          <Icon name="lucide:search" class="h-5 w-5 shrink-0 text-[#0B2F6B]" />

          <input
            v-model="query"
            type="text"
            class="min-w-0 flex-1 bg-transparent text-[13px] font-medium text-[#0B2F6B] outline-none placeholder:font-normal placeholder:text-slate-400 md:text-sm"
            placeholder="Search questions..."
            autocomplete="off"
            @input="onInput"
            @keydown.enter="runSearch"
          />

          <button
            v-if="query"
            type="button"
            class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#0A6CFF] transition active:scale-90"
            aria-label="Clear search"
            title="Clear search"
            @click="onClear"
          >
            <Icon name="lucide:x" class="h-4 w-4" />
          </button>
        </div>

        <!-- SUBJECT FILTER CHIPS -->
        <div
          v-if="subjects.length"
          class="-mx-3 mt-3 overflow-x-auto px-3 [scrollbar-width:none] md:mx-auto md:max-w-3xl md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden"
        >
          <div class="flex w-max gap-2 pb-1 md:w-auto md:flex-wrap">
            <button
              type="button"
              class="inline-flex h-8 shrink-0 items-center whitespace-nowrap rounded-full px-3.5 text-[11px] font-bold transition active:scale-95"
              :class="
                !activeSubject
                  ? 'bg-[#0A6CFF] text-white shadow-[0_4px_10px_rgba(10,108,255,0.3)]'
                  : 'bg-white text-[#0B2F6B] ring-1 ring-blue-100 hover:bg-blue-50'
              "
              @click="setSubject(null)"
            >
              All subjects
            </button>

            <button
              v-for="subject in subjects"
              :key="subject.subject"
              type="button"
              class="inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-[11px] font-bold transition active:scale-95"
              :class="
                activeSubject === subject.subject
                  ? 'bg-[#0A6CFF] text-white shadow-[0_4px_10px_rgba(10,108,255,0.3)]'
                  : 'bg-white text-[#0B2F6B] ring-1 ring-blue-100 hover:bg-blue-50'
              "
              @click="setSubject(subject.subject)"
            >
              {{ formatLabel(subject.subject) }}
              <span
                class="rounded-full px-1.5 py-0.5 text-[10px] tabular-nums"
                :class="
                  activeSubject === subject.subject
                    ? 'bg-white/20 text-white'
                    : 'bg-blue-50 text-[#0A6CFF]'
                "
              >
                {{ subject.questionCount }}
              </span>
            </button>
          </div>
        </div>

        <div
          v-else-if="subjectsLoading"
          class="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500"
          role="status"
        >
          <Icon name="lucide:loader-2" class="h-4 w-4 animate-spin" />
          <span>Loading subjects...</span>
        </div>

        <!-- ERROR -->
        <div
          v-if="error"
          class="mx-auto mt-4 w-full max-w-3xl break-words rounded-2xl border border-blue-200 bg-blue-50 px-2 py-3 text-xs text-[#0B2F6B]"
          role="alert"
        >
          Unable to load questions from the local database.
          {{ error.message || String(error) }}
        </div>

        <!-- LOADING -->
        <div
          v-if="loading && !currentQuestion"
          class="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500"
          role="status"
          aria-live="polite"
        >
          <Icon name="lucide:loader-2" class="h-4 w-4 animate-spin" />
          <span>Searching...</span>
        </div>

        <!-- EMPTY / IDLE -->
        <div
          v-if="!query && !currentQuestion"
          class="mx-auto flex min-h-[45vh] w-full max-w-[420px] flex-col items-center justify-center px-3 text-center"
        >
          <div
            class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#0A6CFF] shadow-[0_6px_18px_rgba(20,49,109,0.10)]"
          >
            <Icon name="lucide:layers" class="h-7 w-7" />
          </div>

          <h2 class="text-base font-semibold text-[#0B2F6B]">
            Search the question bank
          </h2>

          <p class="mt-1.5 max-w-[300px] text-xs leading-relaxed text-slate-500">
            Try a topic, a keyword, or part of a question.
          </p>
        </div>

        <!-- NO RESULTS -->
        <div
          v-else-if="
            query &&
            !loading &&
            !error &&
            !results.length &&
            !currentQuestion
          "
          class="mx-auto flex min-h-[45vh] w-full max-w-[420px] flex-col items-center justify-center px-3 text-center"
        >
          <div
            class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#0A6CFF] shadow-[0_6px_18px_rgba(20,49,109,0.10)]"
          >
            <Icon name="lucide:file-question" class="h-7 w-7" />
          </div>

          <h2 class="text-base font-semibold text-[#0B2F6B]">
            No matching questions
          </h2>

          <p class="mt-1.5 max-w-[300px] text-xs leading-relaxed text-slate-500">
            Try fewer or different words.
          </p>
        </div>

        <!-- RESULTS LIST -->
        <ul
          v-if="!currentQuestion && results.length"
          class="m-0 mt-4 grid list-none grid-cols-1 gap-3 p-0 md:grid-cols-2 md:gap-4"
        >
          <li
            v-for="row in results"
            :key="row.id"
            class="flex min-w-0 cursor-pointer flex-col rounded-3xl bg-white p-4 shadow-[0_8px_24px_rgba(20,49,109,0.07)] outline-none ring-1 ring-blue-50 transition hover:shadow-[0_12px_28px_rgba(20,49,109,0.12)] focus-visible:ring-2 focus-visible:ring-[#0A6CFF] active:scale-[0.99]"
            tabindex="0"
            role="button"
            @click="openQuestion(row.id)"
            @keydown.enter="openQuestion(row.id)"
            @keydown.space.prevent="openQuestion(row.id)"
          >
            <div class="mb-2.5 flex flex-wrap gap-1.5">
              <span
                class="max-w-full truncate rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#0A6CFF]"
              >
                {{ formatLabel(row.subject) }}
              </span>

              <span
                v-if="row.year"
                class="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500"
              >
                {{ row.year }}
              </span>

              <span
                v-if="row.topic"
                class="max-w-full truncate rounded-full border border-blue-100 px-2.5 py-1 text-[10px] font-bold text-[#0B2F6B]"
              >
                {{ row.topic }}
              </span>
            </div>

            <p
              class="snippet m-0 flex-1 break-words text-[13px] leading-relaxed text-[#201F22] md:text-sm"
              v-html="renderSnippet(row.snippet)"
            ></p>

            <div class="mt-3 flex items-center justify-end gap-1 text-[11px] font-bold text-[#0A6CFF]">
              <span>View question</span>
              <Icon name="lucide:arrow-up-right" class="h-4 w-4" />
            </div>
          </li>
        </ul>

        <!-- FULL QUESTION DETAIL -->
        <article
          v-if="currentQuestion"
          class="mx-auto mt-4 w-full max-w-3xl rounded-3xl bg-white p-2 shadow-[0_8px_24px_rgba(20,49,109,0.07)] ring-1 ring-blue-50 md:p-6"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex min-w-0 flex-wrap gap-1.5">
              <span
                class="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#0A6CFF]"
              >
                {{ formatLabel(currentQuestion.subject) }}
              </span>

              <span
                v-if="currentQuestion.year"
                class="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500"
              >
                {{ currentQuestion.year }}
              </span>

              <span
                v-if="currentQuestion.examType"
                class="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500"
              >
                {{ currentQuestion.examType.toUpperCase() }}
              </span>
            </div>

            <button
              type="button"
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 active:bg-slate-200"
              aria-label="Back to results"
              title="Back to results"
              @click="closeQuestion"
            >
              <Icon name="lucide:x" class="h-4 w-4" />
            </button>
          </div>

          <p class="m-0 mt-4 whitespace-pre-line break-words text-base font-semibold leading-relaxed text-[#0B2F6B] md:text-lg">
            {{ currentQuestion.question }}
          </p>

          <ul class="m-0 mt-5 flex list-none flex-col gap-2 p-0">
            <li
              v-for="(text, letter) in currentQuestion.options"
              :key="letter"
              class="flex min-w-0 items-start gap-3 rounded-2xl border p-3"
              :class="
                letter === currentQuestion.answer
                  ? 'border-[#0A6CFF] bg-blue-50'
                  : 'border-blue-100 bg-[#F3F8FF]'
              "
            >
              <span
                class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                :class="
                  letter === currentQuestion.answer
                    ? 'bg-[#0A6CFF] text-white'
                    : 'bg-white text-slate-500 ring-1 ring-blue-100'
                "
              >
                {{ letter }}
              </span>

              <span class="min-w-0 flex-1 break-words pt-1 text-[13px] leading-snug text-[#201F22] md:text-sm">
                {{ text }}
              </span>

              <Icon
                v-if="letter === currentQuestion.answer"
                name="lucide:check-circle-2"
                class="mt-1 h-5 w-5 shrink-0 text-[#0A6CFF]"
              />
            </li>
          </ul>

          <div v-if="explanationHtml" class="mt-5 rounded-2xl bg-blue-50 p-4">
            <span class="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[#0A6CFF]">
              <Icon name="lucide:lightbulb" class="h-4 w-4" />
              Explanation
            </span>

            <div
              class="explanation-text whitespace-pre-line break-words text-xs leading-relaxed text-slate-600 md:text-sm"
              v-html="explanationHtml"
            />
          </div>
        </article>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, nextTick, ref, onMounted, onBeforeUnmount } from 'vue'
import DOMPurify from 'dompurify'
import { toHtml } from '../composables/formatHtml'

const emit = defineEmits(['gohome'])

const {
  results,
  currentQuestion,
  subjects,
  subjectsLoading,
  loading,
  error,
  search,
  loadQuestion,
  loadSubjects,
  clear,
} = useQuestionSearch()

const query = ref('')
const activeSubject = ref(null)

let debounceTimer = null

const explanationHtml = computed(() => {
  const question = currentQuestion.value
  if (!question) return ''

  const explanation = question.explanation
  const simpleExplanation =
    typeof explanation === 'string'
      ? explanation
      : explanation?.simplifiedExplanation
  const detailedExplanation =
    explanation?.explanation ||
    question.solution_html ||
    question.solution ||
    question.explanation_html ||
    question.explaination
  const content = [simpleExplanation, detailedExplanation]
    .find((value) => typeof value === 'string' && value.trim())

  if (!content) return ''

  const hasHtml = /<\/?[a-z][^>]*>/i.test(content)
  const html = hasHtml ? content : toHtml(content)

  return DOMPurify.sanitize(html)
})

// =========================================
// SELF-FITTING HEIGHT
// Makes the page exactly as tall as the free space between its top
// and the bottom tab bar, so <main> always has something to scroll
// inside, whatever the parent layout does.
// =========================================

const pageRoot = ref(null)
let resizeObserver = null

const fitHeight = () => {
  const el = pageRoot.value
  if (!el) return

  const top = el.getBoundingClientRect().top
  let bottom = window.innerHeight

  // Is something (a bottom tab bar) pinned to the bottom edge of the screen?
  let node = document.elementFromPoint(
    window.innerWidth / 2,
    window.innerHeight - 2
  )

  while (node && node !== document.body && node !== document.documentElement) {
    if (!el.contains(node)) {
      const r = node.getBoundingClientRect()

      if (
        r.bottom >= window.innerHeight - 2 &&
        r.height < window.innerHeight * 0.3 &&
        r.top > top
      ) {
        bottom = Math.min(bottom, r.top)
      }
    }

    node = node.parentElement
  }

  el.style.height = `${Math.max(240, Math.floor(bottom - top))}px`
}

onMounted(async () => {
  fitHeight()
  void nextTick(fitHeight)
  setTimeout(fitHeight, 150)
  setTimeout(fitHeight, 600)

  window.addEventListener('resize', fitHeight)
  window.addEventListener('orientationchange', fitHeight)

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(fitHeight)
    resizeObserver.observe(document.body)
  }

  await loadSubjects()
})

onBeforeUnmount(() => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  window.removeEventListener('resize', fitHeight)
  window.removeEventListener('orientationchange', fitHeight)
  resizeObserver?.disconnect()
})

// =========================================
// SEARCH
// =========================================

const runSearch = () => {
  const searchText = query.value.trim()

  if (!searchText) {
    clear()
    return
  }

  search(searchText, {
    subject: activeSubject.value,
  })
}

const onInput = () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  if (!query.value.trim()) {
    clear()
    return
  }

  debounceTimer = setTimeout(() => {
    runSearch()
  }, 250)
}

const setSubject = (subject) => {
  activeSubject.value = subject

  if (query.value.trim()) {
    runSearch()
  }
}

const onClear = () => {
  query.value = ''
  activeSubject.value = null
  clear()
}

// =========================================
// QUESTION DETAIL
// =========================================

const openQuestion = async (id) => {
  if (!id) return

  await loadQuestion(id)
}

const closeQuestion = () => {
  currentQuestion.value = null
}

// =========================================
// FORMATTING
// =========================================

const formatLabel = (value) => {
  return String(value || '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (character) =>
      character.toUpperCase()
    )
}

// Converts ⟦matched text⟧ into highlighted <mark> text
const renderSnippet = (snippet) => {
  if (!snippet) return ''

  const escapedSnippet = String(snippet)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  const firstTerm = query.value.trim().split(/\s+/)[0]
  if (!firstTerm) return escapedSnippet

  const escapedTerm = firstTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return escapedSnippet.replace(
    new RegExp(`(${escapedTerm})`, 'ig'),
    '<mark>$1</mark>'
  )
}

// =========================================
// NAVIGATION
// =========================================

const goHome = () => {
  emit('gohome')
}
</script>

<style scoped>
/* native-app feel */
button {
  -webkit-tap-highlight-color: transparent;
}
main {
  -webkit-overflow-scrolling: touch;
}

/* matched search words: one blue highlight */
.snippet :deep(mark) {
  border-radius: 0.25rem;
  background: #dbeafe;
  color: #0b2f6b;
  font-weight: 700;
  padding: 0 0.15rem;
}

/* content coming from the database (v-html) */
.explanation-text :deep(p) {
  margin: 0 0 0.5rem;
}
.explanation-text :deep(p:last-child) {
  margin-bottom: 0;
}
.explanation-text :deep(img) {
  max-width: 100%;
  height: auto;
}
.explanation-text :deep(table) {
  display: block;
  max-width: 100%;
  overflow-x: auto;
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
</style>