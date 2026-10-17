<template>
  <div
    class="relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#F3F8FF] text-[#201F22] font-['Inter',system-ui,sans-serif]"
  >
    <!-- ========================================= -->
    <!-- DECORATIVE BACKGROUND (non-interactive) -->
    <!-- ========================================= -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <Icon name="lucide:book-open" class="absolute right-[-10px] top-[220px] h-14 w-14 rotate-12 text-blue-200/60" />
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
            <Icon name="lucide:book-marked" class="sm:h-5 h-3 w-3 sm:w-5" />
          </span>

          <div class="min-w-0">
            <h1 class="truncate  text-[15px] font-bold leading-tight tracking-tight">
              Dictionary
            </h1>
            <p class="mt-0.5 truncate  text-[11px]  leading-tight  sm:text-white/65">
              Look up any word — fully offline
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
    <!-- MAIN -->
    <!-- ========================================= -->
    <main
      class="relative z-10  h-dvh bg-\-600 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-2 pb-[calc(env(safe-area-inset-bottom)+24px)] pt-4"
    >
      <!-- SEARCH BOX -->
      <div
        class="mx-auto flex h-12 w-full max-w-[700px] items-center gap-2 rounded-sm border border-blue-100 bg-white px-3 shadow-[0_8px_28px_rgba(20,49,109,0.08)] transition focus-within:border-[#0A6CFF] focus-within:ring-2 focus-within:ring-[#0A6CFF]/20"
      >
        <Icon name="lucide:search" class="h-5 w-5 shrink-0 text-[#0B2F6B]" />

        <input
          ref="inputEl"
          v-model="query"
          type="text"
          class="min-w-0 flex-1 bg-transparent text-[15px] font-medium text-[#0B2F6B] outline-none placeholder:text-sm placeholder:font-normal placeholder:text-slate-400"
          placeholder="Type a word…"
          autocomplete="off"
          spellcheck="false"
          @input="onInput"
          @keydown.enter="onEnter"
          @keydown.down.prevent="moveHighlight(1)"
          @keydown.up.prevent="moveHighlight(-1)"
          @keydown.esc="onEscape"
        />

        <button
          v-if="query"
          type="button"
          class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#0A6CFF] transition active:scale-90"
          aria-label="Clear search"
          @click="onClear"
        >
          <Icon name="lucide:x" class="h-4 w-4" />
        </button>
      </div>

      <!-- LIVE SUGGESTIONS -->
      <ul
        v-if="showSuggestions"
        class="mx-auto mt-3 max-h-[300px] w-full max-w-[700px] list-none overflow-y-auto rounded-3xl bg-white p-2 shadow-[0_8px_24px_rgba(20,49,109,0.08)] ring-1 ring-blue-50"
      >
        <li
          v-for="(row, i) in results"
          :key="row.word"
          class="flex min-w-0 flex-col gap-0.5 rounded-2xl px-3 py-2.5 transition active:bg-blue-50"
          :class="i === highlighted ? 'bg-blue-50' : ''"
          @mouseenter="highlighted = i"
          @click="selectWord(row.word)"
        >
          <span class="truncate text-sm font-bold text-[#0B2F6B]">
            {{ row.word }}
          </span>

          <span class="truncate text-xs text-slate-500">
            {{ firstSense(row.meaning) }}
          </span>
        </li>
      </ul>

      <!-- LOADING -->
      <div
        v-if="loading && !currentWord"
        class="mt-5 flex items-center justify-center gap-2 text-sm text-slate-500"
      >
        <Icon name="lucide:loader-2" class="h-4 w-4 animate-spin" />
        <span>Searching…</span>
      </div>

      <!-- ERROR -->
      <div
        v-if="error"
        class="mx-auto flex w-full max-w-[560px] flex-col items-center px-3 pb-6 pt-12 text-center"
        role="alert"
      >
        <div
          class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500 shadow-[0_6px_18px_rgba(239,68,68,0.15)]"
        >
          <Icon name="lucide:triangle-alert" class="h-7 w-7" />
        </div>

        <h2 class="text-base font-semibold text-[#0B2F6B]">
          Dictionary couldn't be loaded
        </h2>

        <p class="mt-1.5 text-xs leading-relaxed text-slate-500">
          {{ errorMessage }}
        </p>
      </div>

      <!-- EMPTY / IDLE STATE -->
      <div
        v-if="!error && !query && !currentWord"
        class="mx-auto flex w-full max-w-[560px] flex-col items-center px-3 pb-6 pt-12 text-center"
      >
        <div
          class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#0A6CFF] shadow-[0_6px_18px_rgba(20,49,109,0.10)]"
        >
          <Icon name="lucide:library-big" class="h-7 w-7" />
        </div>

        <h2 class="text-base font-semibold text-[#0B2F6B]">
          Nothing looked up yet
        </h2>

        <p class="mt-1.5 text-xs leading-relaxed text-slate-500">
          Start typing above to search the offline dictionary.
        </p>
      </div>

      <!-- NOT FOUND -->
      <div
        v-if="!error && notFound && query"
        class="mx-auto flex w-full max-w-[560px] flex-col items-center px-3 pb-6 pt-12 text-center"
      >
        <div
          class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500 shadow-[0_6px_18px_rgba(239,68,68,0.15)]"
        >
          <Icon name="lucide:file-question" class="h-7 w-7" />
        </div>

        <h2 class="break-words text-base font-semibold text-[#0B2F6B]">
          "{{ lastLookedUp }}" isn't in the dictionary
        </h2>

        <p class="mt-1.5 text-xs leading-relaxed text-slate-500">
          Check the spelling, or try a different word.
        </p>
      </div>

      <!-- WORD DETAIL CARD -->
      <article
        v-if="!error && currentWord"
        class="mx-auto mt-4 w-full max-w-[700px] overflow-hidden rounded-lg bg-white shadow-[0_8px_24px_rgba(20,49,109,0.07)] ring-1 ring-blue-50"
      >
        <!-- CARD HEADER -->
        <div class="flex min-w-0 items-start justify-between gap-3 p-4 pb-3">
          <div class="flex min-w-0 items-center gap-3">
            <div
              class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600"
            >
              <Icon name="lucide:book-open" class="h-6 w-6" stroke-width="1.8" />
            </div>

            <div class="min-w-0">
              <h2 class="break-words text-xl font-bold leading-tight text-[#0B2F6B]">
                {{ currentWord.word }}
              </h2>

              <span
                v-if="currentWord.partOfSpeech"
                class="mt-1 inline-block max-w-full truncate rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-[#0A6CFF]"
              >
                {{ currentWord.partOfSpeech }}
              </span>
            </div>
          </div>

          <button
            type="button"
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition active:bg-slate-200"
            aria-label="Close definition"
            @click="onClear"
          >
            <Icon name="lucide:x" class="h-4 w-4" />
          </button>
        </div>

        <div class="mx-4 border-t border-dashed border-blue-100" role="presentation" />

        <!-- HAS REAL DEFINITION -->
        <div v-if="currentWord.hasDefinition" class="p-4 pb-5">
          <ol class="m-0 flex list-none flex-col gap-3 p-0">
            <li
              v-for="(sense, i) in senseList(currentWord.meaning)"
              :key="i"
              class="flex items-start gap-2.5"
            >
              <span
                class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[10px] font-bold text-[#0A6CFF]"
              >
                {{ i + 1 }}
              </span>
              <span class="min-w-0 break-words text-sm leading-relaxed text-[#201F22]">
                {{ sense }}
              </span>
            </li>
          </ol>

          <p
            v-if="currentWord.example"
            class="mt-4 break-words rounded-2xl bg-[#F3F8FF] px-3.5 py-3 text-[13px] italic leading-relaxed text-slate-500"
          >
            &ldquo;{{ currentWord.example }}&rdquo;
          </p>
        </div>

        <!-- VALID WORD WITHOUT DEFINITION -->
        <div v-else class="p-4 pb-5">
          <p class="m-0 flex items-start gap-2.5 rounded-2xl bg-[#F3F8FF] px-3.5 py-3 text-[13px] leading-relaxed text-slate-500">
            <Icon name="lucide:info" class="mt-0.5 h-4 w-4 shrink-0 text-[#0A6CFF]" />

            <span>
              This is a recognized word, but no definition is on file
              for it yet.
            </span>
          </p>
        </div>
      </article>
    </main>
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  onBeforeUnmount
} from 'vue'

const emit = defineEmits(['gohome'])

const {
  results,
  currentWord,
  loading,
  error,
  notFound,
  search,
  lookup,
  clear
} = useDictionary()

// --------------------------------------------------
// STATE
// --------------------------------------------------

const query = ref('')
const inputEl = ref(null)
const highlighted = ref(-1)
const lastLookedUp = ref('')
const errorMessage = computed(() => {
  return error.value instanceof Error
    ? error.value.message
    : String(error.value || 'An unexpected dictionary error occurred.')
})

let debounceTimer = null

// --------------------------------------------------
// DEBOUNCED LIVE SEARCH
// --------------------------------------------------

const onInput = () => {
  notFound.value = false
  highlighted.value = -1

  clearTimeout(debounceTimer)

  const term = query.value.trim()

  if (!term) {
    clear()
    return
  }

  debounceTimer = setTimeout(() => {
    search(term)
  }, 200)
}

onBeforeUnmount(() => {
  clearTimeout(debounceTimer)
})

// --------------------------------------------------
// SUGGESTIONS
// --------------------------------------------------

const showSuggestions = computed(() => {
  return (
    results.value.length > 0 &&
    !currentWord.value &&
    query.value.trim().length > 0
  )
})

// --------------------------------------------------
// SELECT WORD
// --------------------------------------------------

const selectWord = async (word) => {
  query.value = word
  results.value = []
  highlighted.value = -1
  lastLookedUp.value = word

  await lookup(word)
}

// --------------------------------------------------
// ENTER SEARCH
// --------------------------------------------------

const onEnter = async () => {
  const term = query.value.trim()

  if (!term) return

  // Use highlighted suggestion if available
  if (
    highlighted.value >= 0 &&
    results.value[highlighted.value]
  ) {
    await selectWord(
      results.value[highlighted.value].word
    )

    return
  }

  lastLookedUp.value = term
  results.value = []
  highlighted.value = -1

  await lookup(term)
}

// --------------------------------------------------
// KEYBOARD NAVIGATION
// --------------------------------------------------

const moveHighlight = (direction) => {
  if (!results.value.length) return

  const max = results.value.length - 1

  let next = highlighted.value + direction

  if (next < 0) {
    next = max
  }

  if (next > max) {
    next = 0
  }

  highlighted.value = next
}

// --------------------------------------------------
// ESCAPE
// --------------------------------------------------

const onEscape = () => {
  results.value = []
  highlighted.value = -1
}

// --------------------------------------------------
// CLEAR SEARCH
// --------------------------------------------------

const onClear = () => {
  query.value = ''
  highlighted.value = -1
  lastLookedUp.value = ''

  clear()

  inputEl.value?.focus()
}

// --------------------------------------------------
// FORMAT DEFINITIONS
// Example:
// "1. (noun) definition one 2. (verb) definition two"
// --------------------------------------------------

const senseList = (meaning) => {
  if (!meaning) return []

  return String(meaning)
    .split(/(?=\d+\.\s)/)
    .map((sense) => {
      return sense
        .replace(/^\d+\.\s*/, '')
        .trim()
    })
    .filter(Boolean)
}

const firstSense = (meaning) => {
  const list = senseList(meaning)

  return list.length ? list[0] : ''
}

// --------------------------------------------------
// NAVIGATION
// --------------------------------------------------

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
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
</style>