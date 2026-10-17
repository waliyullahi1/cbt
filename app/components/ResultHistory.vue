<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue"

const appState = useAppState()

const emit = defineEmits(["gohome", "view", "review"])

// ==========================================
// AUTH
// ==========================================

const auth = useExamTipsAuth()

const currentUser = computed(() => {
  return auth.user?.value || auth.user || {}
})

// ==========================================
// EXAM HISTORY (loads after the page shows)
// ==========================================

const {
  histories,
  load,
  loadOne,
  remove,
} = useExamHistory()

const loading = ref(true)
const loadError = ref("")

// showLoader = false means refresh quietly (used after delete)
const loadHistories = async (showLoader = true) => {
  if (showLoader) loading.value = true
  loadError.value = ""

  try {
    await load()
  } catch (error) {
    console.error("Failed to load exam history:", error)
    loadError.value =
      error instanceof Error ? error.message : String(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadHistories()
})

const sortedHistories = computed(() => {
  return [...(histories.value || [])].sort((a, b) => {
    const dateA = new Date(
      String(a.createdAt || "").replace(" ", "T")
    ).getTime()

    const dateB = new Date(
      String(b.createdAt || "").replace(" ", "T")
    ).getTime()

    return dateB - dateA
  })
})

// ==========================================
// DISPLAY HELPERS
// ==========================================

const hasNumber = (n: unknown): n is number => {
  return typeof n === "number" && !Number.isNaN(n)
}

const subjectNameFrom = (value: unknown): string | null => {
  if (value === null || value === undefined) return null

  if (typeof value === "string") {
    const trimmed = value.trim()
    return trimmed || null
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value)
  }

  if (Array.isArray(value)) {
    const names = value
      .map(subjectNameFrom)
      .filter((item): item is string => Boolean(item))

    return names.length ? names.join(", ") : null
  }

  if (typeof value === "object") {
    const record = value as Record<string, any>
    const candidate =
      record.name ||
      record.subjectName ||
      record.subject ||
      record.title ||
      record.label ||
      record.id

    return subjectNameFrom(candidate)
  }

  return null
}

const formatSubject = (s: unknown) => {
  const text = subjectNameFrom(s) || "Unknown subject"

  return text
    .toLowerCase()
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

const subjectsFor = (exam: any) => {
  if (Array.isArray(exam.subjects) && exam.subjects.length) {
    return [
      ...new Set(
        exam.subjects
          .map((subject: any) => subjectNameFrom(subject))
          .filter((name): name is string => Boolean(name))
      ),
    ]
  }

  if (!Array.isArray(exam.questions) || !exam.questions.length) {
    return []
  }

  return [
    ...new Set(
      exam.questions
        .map((q: any) => subjectNameFrom(q.subject))
        .filter((name): name is string => Boolean(name))
    ),
  ]
}

const examTypeLabel = (exam: any) => {
  return exam.examType || exam.mode || "Practice"
}

const titleFor = (exam: any) => {
  const subjects = subjectsFor(exam)

  if (!subjects.length) return "Practice Exam"

  const names = subjects.map(formatSubject)

  if (names.length <= 3) {
    return names.join(" • ")
  }

  return `${names.slice(0, 2).join(" • ")} +${names.length - 2} more`
}

const formatDate = (raw: unknown) => {
  if (!raw) return "Unknown date"

  const d = new Date(String(raw).replace(" ", "T"))

  if (Number.isNaN(d.getTime())) {
    return String(raw)
  }

  const date = d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  const time = d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  })

  return `${date} · ${time}`
}

const round1 = (n: number) => {
  return Math.round(n * 10) / 10
}

const formatAggregate = (exam: any) => {
  if (!hasNumber(exam.aggregate) || !hasNumber(exam.maxAggregate)) {
    return "No aggregate"
  }

  return `${round1(exam.aggregate)} / ${round1(exam.maxAggregate)}`
}

const formatSeconds = (secs: unknown) => {
  const s = Math.max(0, Math.round(Number(secs) || 0))

  const m = Math.floor(s / 60)
  const r = s % 60

  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`
}

const timeFor = (exam: any) => {
  if (exam.timeSpent) return exam.timeSpent

  if (hasNumber(exam.durationUsed)) {
    return formatSeconds(exam.durationUsed)
  }

  return "—"
}

const bandClass = (pct: unknown) => {
  if (!hasNumber(pct)) return "seal--none"
  if (pct >= 70) return "seal--good"
  if (pct >= 50) return "seal--mid"
  return "seal--low"
}

// ==========================================
// VIEW EXAM RESULT
// ==========================================

const view = async (id: string | number) => {
  try {
    const exam = await loadOne(id)

    if (!exam) {
      alert("Exam record not found.")
      return
    }

    const questions = Array.isArray(exam.questions) ? exam.questions : []

    const subjectMap = questions.reduce(
      (groups: Record<string, any>, question: any) => {
        const subject = question.subject

        if (!subject) return groups

        if (!groups[subject]) {
          groups[subject] = {
            id: subject,
            name: subject,
            total: 0,
            answered: 0,
            unanswered: 0,
            correct: 0,
            wrong: 0,
            questions: [],
          }
        }

        groups[subject].questions.push(question)
        groups[subject].total++

        const answered =
          question.userAnswer !== null &&
          question.userAnswer !== undefined &&
          question.userAnswer !== ""

        if (answered) {
          groups[subject].answered++
        } else {
          groups[subject].unanswered++
        }

        if (question.isCorrect) {
          groups[subject].correct++
        } else if (answered) {
          groups[subject].wrong++
        }

        return groups
      },
      {}
    )

    exam.subjects = Object.values(subjectMap).map((subject: any) => ({
      ...subject,
      score:
        subject.total > 0
          ? Number(((subject.correct / subject.total) * 100).toFixed(2))
          : 0,
      maxScore: subject.total,
    }))

    appState.value.selectedSubjectsView = exam.subjects
    appState.value.examQuestionsView = exam.questions
    appState.value.reviewQuestions = true
    appState.value.examResult = exam

    await navigateTo("/exam")
  } catch (error) {
    console.error("Failed to load exam:", error)
    alert("Unable to load exam history.")
  }
}

// ==========================================
// SELF-FITTING HEIGHT
// Makes the page exactly as tall as the free space between its top
// and the bottom tab bar, so <main> always has something to scroll
// inside, whatever the parent layout does.
// ==========================================

const pageRoot = ref<HTMLElement | null>(null)
let resizeObserver: ResizeObserver | null = null

const fitHeight = () => {
  const el = pageRoot.value
  if (!el) return

  const top = el.getBoundingClientRect().top
  let bottom = window.innerHeight

  // Is something (a bottom tab bar) pinned to the bottom edge of the screen?
  let node: Element | null = document.elementFromPoint(
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

onMounted(() => {
  fitHeight()
  void nextTick(fitHeight)
  setTimeout(fitHeight, 150)
  setTimeout(fitHeight, 600)

  window.addEventListener("resize", fitHeight)
  window.addEventListener("orientationchange", fitHeight)

  if (typeof ResizeObserver !== "undefined") {
    resizeObserver = new ResizeObserver(fitHeight)
    resizeObserver.observe(document.body)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener("resize", fitHeight)
  window.removeEventListener("orientationchange", fitHeight)
  resizeObserver?.disconnect()
})

// ==========================================
// ACTIONS
// ==========================================

const goHome = () => {
  emit("gohome")
}

const deleteHistory = async (id: string | number) => {
  const confirmed = confirm("Delete this exam history?")

  if (!confirmed) return

  try {
    await remove(id)
    await loadHistories(false)
  } catch (error) {
    console.error("Failed to delete exam history:", error)
    alert("Unable to delete this record.")
  }
}
</script>

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
            <Icon name="lucide:scroll-text" class="sm:h-5 h-3 w-3 sm:w-5" />
          </span>

          <div class="min-w-0">
            <h1 class="truncate  text-[15px] font-bold leading-tight tracking-tight">
              Exam Record
            </h1>
             <p class="sm:mt-0.5 mt-0 truncate text-[11px] leading-tight ">
              <span class="hidden sm:inline">Every practice attempt, on file</span>
              <span class="sm:hidden">Your practice history</span>
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
    <!-- APP BAR -->
    

    <!-- MAIN (this is the part that scrolls) -->
    <main
      class="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain px-1 pb-[calc(env(safe-area-inset-bottom)+24px)] pt-4 md:px-8 md:pt-6"
    >
      <div class="mx-auto w-full max-w-5xl">
        <!-- ERROR BANNER -->
        <div
          v-if="loadError"
          class="mb-4 flex w-full items-center justify-between gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-[#0B2F6B]"
        >
          <span>Could not load your history.</span>

          <button
            type="button"
            class="shrink-0 rounded-xl bg-[#0A6CFF] px-3 py-1.5 text-xs font-bold text-white transition active:scale-95"
            @click="loadHistories()"
          >
            Try again
          </button>
        </div>

        <!-- PAGE INTRO -->
        <div
          v-if="histories?.length"
          class="mb-4 flex w-full bg-[#0A6CFF]/10 rounded-lg px-1 py-2 items-center justify-between gap-3 px-1"
        >
          <div class="flex min-w-0  items-center gap-3">
            <Icon name="lucide:scroll-text" class="h-7 w-7 shrink-0 text-[#0B2F6B]" />
            <div class="min-w-0">
              <p class="text-[9px] font-bold tracking-widest text-[#0A6CFF] sm:text-[10px]">
                PERFORMANCE ARCHIVE
              </p>
              <h2 class="text-xs font-bold tracking-tight text-[#0B2F6B] sm:text-base">
                Your exam history
              </h2>
            </div>
          </div>

          <span
            class="shrink-0 rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-[#0A6CFF] shadow-[0_4px_12px_rgba(20,49,109,0.08)] ring-1 ring-blue-50"
          >
            {{ histories.length }}
            {{ histories.length === 1 ? "Attempt" : "Attempts" }}
          </span>
        </div>

        <!-- LOADING SKELETONS -->
        <ul
          v-if="loading && !histories?.length"
          class="m-0 flex w-full list-none flex-col gap-3 p-0"
        >
          <li
            v-for="n in 3"
            :key="n"
            class="animate-pulse rounded-3xl bg-white p-4 shadow-[0_8px_24px_rgba(20,49,109,0.07)] ring-1 ring-blue-50"
          >
            <div class="flex items-center gap-3">
              <div class="h-16 w-16 shrink-0 rounded-full bg-blue-100"></div>
              <div class="min-w-0 flex-1">
                <div class="h-3 w-2/5 rounded-lg bg-blue-100"></div>
                <div class="mt-3 h-5 w-3/5 rounded-lg bg-blue-100"></div>
              </div>
            </div>

            <div class="mt-4 h-[88px] rounded-2xl bg-blue-50"></div>
            <div class="mt-4 h-11 rounded-2xl bg-blue-100"></div>
          </li>
        </ul>

        <!-- EMPTY STATE -->
        <div
          v-else-if="!histories?.length && !loadError"
          class="mx-auto flex min-h-[55vh] w-full max-w-[560px] flex-col items-center justify-center px-3 text-center"
        >
          <div
            class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#0A6CFF] shadow-[0_6px_18px_rgba(20,49,109,0.10)]"
          >
            <Icon name="lucide:scroll-text" class="h-7 w-7" />
          </div>

          <h2 class="text-base font-semibold text-[#0B2F6B]">No record yet</h2>

          <p class="mt-1.5 max-w-[300px] text-xs leading-relaxed text-slate-500">
            Finish a practice exam and it'll be filed here.
          </p>

          <button
            type="button"
            class="mt-5 inline-flex h-11 items-center gap-2 rounded-2xl bg-[#0A6CFF] px-5 text-xs font-bold text-white shadow-[0_6px_14px_rgba(10,108,255,0.35)] transition hover:brightness-110 active:scale-95"
            @click="goHome"
          >
            <Icon name="lucide:arrow-left" class="h-4 w-4" />
            Start practicing
          </button>
        </div>

        <!-- HISTORY LIST -->
        <ul
          v-else-if="histories?.length"
          class="m-0 flex w-full list-none flex-col gap-3 p-0 md:gap-4"
        >
          <li
            v-for="exam in sortedHistories"
            :key="exam.id"
            class="min-w-0 rounded-lg bg-white p-1 shadow-[0_8px_24px_rgba(20,49,109,0.07)] ring-1 ring-blue-50 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)_11rem] md:items-center md:gap-6 md:p-5"
          >
            <!-- WHO / WHEN / SCORE -->
            <div class="flex min-w-0 items-center gap-3">
              <div class="seal shrink-0" :class="bandClass(exam.percentage)">
                <span
                  class="flex h-16 w-16 flex-col items-center justify-center rounded-full md:h-[72px] md:w-[72px]"
                >
                  <span class="text-base font-bold leading-none tabular-nums">
                    {{ hasNumber(exam.percentage) ? Math.round(exam.percentage) : "—" }}
                    <small v-if="hasNumber(exam.percentage)" class="text-[10px] font-semibold">%</small>
                  </span>

                  <span class="mt-1 max-w-[52px] truncate text-[8px] font-semibold opacity-85 md:max-w-[60px]">
                    {{ formatAggregate(exam) }}
                  </span>
                </span>
              </div>

              <div class="min-w-0 flex-1">
                <span class="block break-words text-[10px] font-bold uppercase leading-relaxed tracking-wide text-[#0A6CFF]">
                  {{ examTypeLabel(exam) }}
                  <span class="px-0.5">·</span>
                  {{ formatDate(exam.createdAt) }}
                </span>

                <!-- subjects are shown once, here -->
                <h2 class="mt-1 line-clamp-2 break-words text-sm font-bold leading-snug text-[#0B2F6B] md:text-base">
                  {{ titleFor(exam) }}
                </h2>
              </div>
            </div>

            <!-- STATS: one joined strip -->
            <dl
              class="m-0 mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-lg bg-blue-100 ring-1 ring-blue-100 md:mt-0"
            >
              <div
                v-for="[label, value] in [
                  ['Questions', exam.total],
                  ['Answered', exam.answered],
                  ['Unanswered', exam.unanswered],
                  ['Correct', exam.correct],
                  ['Wrong', exam.wrong],
                  ['Time spent', timeFor(exam)],
                ]"
                :key="label"
                class="min-w-0 bg-blue-50 px-3 py-2"
              >
                <dt class="mb-0.5 truncate text-[10px] leading-snug text-slate-500">{{ label }}</dt>
                <dd class="m-0 truncate text-xs sm:text-sm font-bold tabular-nums text-[#0B2F6B]">{{ value ?? "—" }}</dd>
              </div>
            </dl>

            <!-- ACTIONS -->
            <div class="mt-4 grid grid-cols-[minmax(0,1fr)_auto] gap-2 md:mt-0 md:grid-cols-1">
              <button
                type="button"
                class="col-span-2 inline-flex h-11 items-center justify-center gap-1.5 rounded-2xl bg-[#0A6CFF] text-xs font-bold text-white shadow-[0_6px_14px_rgba(10,108,255,0.35)] transition hover:brightness-110 active:scale-[0.98] md:col-span-1"
                @click="view(exam.id)"
              >
                <Icon name="lucide:eye" class="h-4 w-4 shrink-0" />
                <span>View result</span>
              </button>

              <button
                type="button"
                class="inline-flex h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-blue-50 px-3 text-xs font-bold text-[#0A6CFF] transition hover:bg-blue-100 active:scale-[0.97]"
                @click="emit('review', exam.id)"
              >
                <Icon name="lucide:list-checks" class="h-4 w-4 shrink-0" />
                <span>Review answers</span>
              </button>

              <button
                type="button"
                class="inline-flex h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-blue-100 bg-white px-3 text-xs font-bold text-slate-500 transition hover:bg-blue-50 active:scale-[0.97]"
                @click="deleteHistory(exam.id)"
              >
                <Icon name="lucide:trash-2" class="h-4 w-4 shrink-0" />
                <span>Delete</span>
              </button>
            </div>
          </li>
        </ul>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* native-app feel */
button {
  -webkit-tap-highlight-color: transparent;
}
main {
  -webkit-overflow-scrolling: touch;
}

/* Score seal: one blue hue, strength shows the band */
.seal--good > span {
  background: #0a6cff;
  color: #fff;
  box-shadow: 0 6px 14px rgba(10, 108, 255, 0.35);
}
.seal--mid > span {
  background: #dbeafe;
  color: #0a6cff;
}
.seal--low > span {
  background: #fff;
  color: #0b2f6b;
  border: 2px solid #bfdbfe;
}
.seal--none > span {
  background: #f1f5f9;
  color: #64748b;
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
</style>