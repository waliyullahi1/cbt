<script setup lang="ts">
import { computed, onMounted, ref } from "vue"

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
  <div class="exam-history">
    <!-- HEADER -->
    <header class="eh-header">
      <div class="eh-header__brand">
        <span class="eh-header__mark">
          <Icon name="lucide:scroll-text" />
        </span>

        <div class="min-w-0">
          <h1 class="eh-header__title">Exam Record</h1>

          <p class="eh-header__sub">
            <span class="hidden sm:inline">Every practice attempt, on file</span>
            <span class="sm:hidden">Your practice history</span>
          </p>
        </div>
      </div>

      <button
        type="button"
        class="eh-header__home"
        @click="goHome"
        aria-label="Go home"
      >
        <Icon name="lucide:house" />
      </button>
    </header>

    <!-- MAIN -->
    <main class="eh-main">
      <!-- ERROR BANNER -->
      <div v-if="loadError" class="eh-error">
        <span>Could not load your history.</span>

        <button type="button" class="eh-error__retry" @click="loadHistories()">
          Try again
        </button>
      </div>

      <!-- PAGE INTRO -->
      <div v-if="histories?.length" class="eh-intro">
        <div>
          <p class="eh-intro__eyebrow">PERFORMANCE ARCHIVE</p>
          <h2 class="eh-intro__title">Your exam history</h2>
        </div>

        <span class="eh-count">
          {{ histories.length }}
          {{ histories.length === 1 ? "Attempt" : "Attempts" }}
        </span>
      </div>

      <!-- LOADING SKELETONS -->
      <ul v-if="loading && !histories?.length" class="ticket-list">
        <li v-for="n in 3" :key="n" class="ticket ticket--skeleton">
          <div class="ticket__top">
            <div class="ticket__meta">
              <div class="sk sk--line sk--short"></div>
              <div class="sk sk--title"></div>
              <div class="sk sk--line"></div>
            </div>
            <div class="sk sk--seal"></div>
          </div>

          <div class="ticket__perforation" role="presentation"></div>

          <div class="ticket__stats">
            <div v-for="i in 6" :key="i" class="sk sk--stat"></div>
          </div>

          <div class="ticket__actions">
            <div class="sk sk--btn"></div>
            <div class="sk sk--btn"></div>
          </div>
        </li>
      </ul>

      <!-- EMPTY STATE -->
      <div v-else-if="!histories?.length && !loadError" class="eh-empty">
        <div class="eh-empty__mark">
          <Icon name="lucide:scroll-text" />
        </div>

        <h2 class="eh-empty__title">No record yet</h2>

        <p class="eh-empty__sub">
          Finish a practice exam and it'll be filed here.
        </p>

        <button type="button" class="empty-action" @click="goHome">
          <Icon name="lucide:arrow-left" />
          Start practicing
        </button>
      </div>

      <!-- HISTORY LIST -->
      <ul v-else-if="histories?.length" class="ticket-list">
        <li v-for="exam in sortedHistories" :key="exam.id" class="ticket">
          <!-- TOP -->
          <div class="ticket__top">
            <div class="ticket__meta">
              <span class="ticket__eyebrow">
                {{ examTypeLabel(exam) }}
                <span class="dot">·</span>
                {{ formatDate(exam.createdAt) }}
              </span>

              <h2 class="ticket__title">
                {{ titleFor(exam) }}
              </h2>

              <div v-if="subjectsFor(exam).length" class="ticket__chips">
                <span v-for="s in subjectsFor(exam)" :key="s" class="chip">
                  {{ formatSubject(s) }}
                </span>
              </div>
            </div>

            <!-- SCORE SEAL -->
            <div class="seal" :class="bandClass(exam.percentage)">
              <span class="seal__ring">
                <span class="seal__pct">
                  {{ hasNumber(exam.percentage) ? Math.round(exam.percentage) : "—" }}
                  <small v-if="hasNumber(exam.percentage)">%</small>
                </span>

                <span class="seal__agg">
                  {{ formatAggregate(exam) }}
                </span>
              </span>
            </div>
          </div>

          <!-- PERFORATION -->
          <div class="ticket__perforation" role="presentation"></div>

          <!-- STATS -->
          <dl class="ticket__stats">
            <div class="stat">
              <dt>Questions</dt>
              <dd>{{ exam.total ?? "—" }}</dd>
            </div>

            <div class="stat">
              <dt>Answered</dt>
              <dd>{{ exam.answered ?? "—" }}</dd>
            </div>

            <div class="stat">
              <dt>Unanswered</dt>
              <dd>{{ exam.unanswered ?? "—" }}</dd>
            </div>

            <div class="stat stat--good">
              <dt>Correct</dt>
              <dd>{{ exam.correct ?? "—" }}</dd>
            </div>

            <div class="stat stat--bad">
              <dt>Wrong</dt>
              <dd>{{ exam.wrong ?? "—" }}</dd>
            </div>

            <div class="stat">
              <dt>Time spent</dt>
              <dd>{{ timeFor(exam) }}</dd>
            </div>
          </dl>

          <!-- ACTIONS -->
          <div class="ticket__actions">
            <button type="button" class="btn btn--primary" @click="view(exam.id)">
              <Icon name="lucide:eye" />
              <span>View result</span>
            </button>

            <button
              type="button"
              class="btn btn--ghost"
              @click="emit('review', exam.id)"
            >
              <Icon name="lucide:list-checks" />
              <span>Review answers</span>
            </button>

            <button
              type="button"
              class="btn btn--danger"
              @click="deleteHistory(exam.id)"
            >
              <Icon name="lucide:trash-2" />
              <span>Delete</span>
            </button>
          </div>
        </li>
      </ul>
    </main>
  </div>
</template>
<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap");

.exam-history {
  --bg: #f6f3ec;
  --surface: #fffdf8;
  --ink: #201f22;
  --ink-soft: #6b665c;
  --line: #e6e0d2;
  --navy: #24304a;
  --navy-soft: #3c4c6e;
  --gold: #b9873b;
  --good: #3f7a5c;
  --good-bg: #e7f0e8;
  --bad: #ab5137;
  --bad-bg: #f7e9e2;
  --mid-bg: #f4ecda;

  display: flex;
  height: 100%;
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg);
  color: var(--ink);
  font-family: "Inter", system-ui, sans-serif;
}

/* ==========================================
   HEADER
========================================== */
/* ERROR BANNER */
.eh-error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  width: 100%;
  max-width: 780px;
  margin: 0 auto 1rem;
  border: 1px solid var(--bad);
  border-radius: 0.75rem;
  padding: 0.7rem 0.9rem;
  background: var(--bad-bg);
  color: var(--bad);
  font-size: 0.8rem;
}

.eh-error__retry {
  flex-shrink: 0;
  border: 1px solid var(--bad);
  border-radius: 0.5rem;
  padding: 0.35rem 0.7rem;
  background: transparent;
  color: var(--bad);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
}

/* SKELETON CARDS */
.ticket--skeleton:hover {
  box-shadow: none;
  transform: none;
}

.sk {
  border-radius: 0.5rem;
  background: linear-gradient(
    90deg,
    var(--line) 25%,
    #f1ecdf 50%,
    var(--line) 75%
  );
  background-size: 200% 100%;
  animation: sk-shimmer 1.3s ease-in-out infinite;
}

.sk--line {
  height: 0.7rem;
  width: 70%;
  margin-top: 0.7rem;
}

.sk--short {
  width: 40%;
  margin-top: 0;
}

.sk--title {
  height: 1.2rem;
  width: 60%;
  margin-top: 0.6rem;
}

.sk--seal {
  width: 5rem;
  height: 5rem;
  flex-shrink: 0;
  border-radius: 50%;
}

.sk--stat {
  height: 3.2rem;
  border-radius: 0.65rem;
}

.sk--btn {
  height: 2.35rem;
  width: 7rem;
}

@keyframes sk-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@media (prefers-reduced-motion: reduce) {
  .sk { animation: none; }
}
.eh-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  min-height: 3.75rem;
  padding: 0 1.25rem;
  background: var(--navy);
  color: #f4efe2;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.08);
}

.eh-header__brand {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 0.75rem;
}

.eh-header__mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  flex-shrink: 0;
  border-radius: 0.75rem;
  background: rgba(244, 239, 226, 0.12);
  font-size: 1.1rem;
}

.eh-header__title {
  margin: 0;
  font-family: "Fraunces", Georgia, serif;
  font-size: 1.05rem;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.eh-header__sub {
  margin: 0.1rem 0 0;
  font-size: 0.75rem;
  color: rgba(244, 239, 226, 0.65);
}

.eh-header__home {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  flex-shrink: 0;
  border: none;
  border-radius: 0.75rem;
  background: transparent;
  color: inherit;
  font-size: 1.25rem;
  cursor: pointer;
  transition:
    background 0.15s ease,
    transform 0.15s ease;
}

.eh-header__home:hover {
  background: rgba(244, 239, 226, 0.12);
  transform: translateY(-1px);
}

/* ==========================================
   MAIN
========================================== */

.eh-main {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 1.5rem 1rem 5rem;
}

/* Page Intro */
.eh-intro {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
  max-width: 780px;
  margin: 0 auto 1.25rem;
}

.eh-intro__eyebrow {
  margin: 0 0 0.25rem;
  color: var(--gold);
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.12em;
}

.eh-intro__title {
  margin: 0;
  font-family: "Fraunces", Georgia, serif;
  font-size: 1.35rem;
  font-weight: 600;
  color: var(--navy);
}

.eh-count {
  flex-shrink: 0;
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 0.35rem 0.7rem;
  background: var(--surface);
  color: var(--ink-soft);
  font-size: 0.7rem;
  font-weight: 600;
}

/* ==========================================
   EMPTY STATE
========================================== */

.eh-empty {
  display: flex;
  min-height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

.eh-empty__mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4.5rem;
  height: 4.5rem;
  margin-bottom: 1.1rem;
  border: 1px solid var(--line);
  border-radius: 50%;
  background: var(--surface);
  color: var(--gold);
  font-size: 1.75rem;
}

.eh-empty__title {
  margin: 0;
  font-family: "Fraunces", Georgia, serif;
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--ink);
}

.eh-empty__sub {
  max-width: 300px;
  margin: 0.4rem 0 0;
  color: var(--ink-soft);
  font-size: 0.875rem;
  line-height: 1.6;
}

.empty-action {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 1.25rem;
  border: 1px solid var(--navy);
  border-radius: 0.6rem;
  padding: 0.65rem 1rem;
  background: var(--navy);
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
}

/* ==========================================
   TICKET LIST
========================================== */

.ticket-list {
  display: flex;
  width: 100%;
  max-width: 780px;
  flex-direction: column;
  gap: 1.1rem;
  margin: 0 auto;
  padding: 0;
  list-style: none;
}

.ticket {
  position: relative;
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 1.1rem;
  background: var(--surface);
  box-shadow: 0 1px 2px rgba(36, 48, 74, 0.04);
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.ticket:hover {
  box-shadow: 0 10px 24px -12px rgba(36, 48, 74, 0.22);
  transform: translateY(-1px);
}

/* ==========================================
   TICKET TOP
========================================== */

.ticket__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem;
}

.ticket__meta {
  min-width: 0;
  flex: 1;
}

.ticket__eyebrow {
  display: block;
  overflow-wrap: anywhere;
  color: var(--gold);
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.045em;
  line-height: 1.5;
  text-transform: uppercase;
}

.dot {
  padding: 0 0.15rem;
}

.ticket__title {
  margin: 0.35rem 0 0;
  overflow-wrap: anywhere;
  font-family: "Fraunces", Georgia, serif;
  font-size: 1.2rem;
  font-weight: 600;
  line-height: 1.35;
  color: var(--navy);
}

.ticket__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.65rem;
}

.chip {
  max-width: 100%;
  overflow-wrap: anywhere;
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 0.22rem 0.6rem;
  background: var(--bg);
  color: var(--ink-soft);
  font-size: 0.68rem;
  font-weight: 500;
}

/* ==========================================
   SCORE SEAL
========================================== */

.seal {
  flex-shrink: 0;
  transform: rotate(-3deg);
}

.seal__ring {
  display: flex;
  width: 5rem;
  height: 5rem;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px solid currentColor;
  border-radius: 50%;
  outline: 1px solid currentColor;
  outline-offset: 3px;
  font-family: "IBM Plex Mono", monospace;
}

.seal__pct {
  font-size: 1.15rem;
  font-weight: 600;
  line-height: 1;
}

.seal__pct small {
  margin-left: 1px;
  font-size: 0.65rem;
  font-weight: 500;
}

.seal__agg {
  max-width: 4rem;
  margin-top: 0.15rem;
  overflow: hidden;
  font-size: 0.5rem;
  font-weight: 500;
  opacity: 0.85;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.seal--good {
  color: var(--good);
}

.seal--mid {
  color: var(--gold);
}

.seal--low {
  color: var(--bad);
}

.seal--none {
  color: var(--ink-soft);
}

/* ==========================================
   PERFORATION
========================================== */

.ticket__perforation {
  position: relative;
  height: 0;
  margin: 0 1.25rem;
  border-top: 2px dashed var(--line);
}

.ticket__perforation::before,
.ticket__perforation::after {
  position: absolute;
  top: -10px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--bg);
  content: "";
}

.ticket__perforation::before {
  left: -1.5rem;
}

.ticket__perforation::after {
  right: -1.5rem;
}

/* ==========================================
   STATS
========================================== */

.ticket__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.6rem;
  margin: 1.1rem 1.25rem 0;
}

.stat {
  min-width: 0;
  border-radius: 0.65rem;
  padding: 0.65rem 0.6rem;
  background: var(--bg);
}

.stat dt {
  margin: 0 0 0.2rem;
  overflow-wrap: anywhere;
  color: var(--ink-soft);
  font-size: 0.62rem;
  line-height: 1.4;
}

.stat dd {
  margin: 0;
  overflow-wrap: anywhere;
  color: var(--navy);
  font-family: "IBM Plex Mono", monospace;
  font-size: 1rem;
  font-weight: 600;
}

.stat--good {
  background: var(--good-bg);
}

.stat--good dd {
  color: var(--good);
}

.stat--bad {
  background: var(--bad-bg);
}

.stat--bad dd {
  color: var(--bad);
}

/* ==========================================
   ACTIONS
========================================== */

.ticket__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 1.1rem 1.25rem 1.25rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  min-height: 2.35rem;
  border: 1px solid transparent;
  border-radius: 0.6rem;
  padding: 0.5rem 0.85rem;
  font-family: inherit;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    opacity 0.15s ease,
    background 0.15s ease,
    transform 0.15s ease;
}

.btn :deep(svg) {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
}

.btn--primary {
  background: var(--navy);
  color: #f4efe2;
}

.btn--primary:hover {
  opacity: 0.92;
  transform: translateY(-1px);
}

.btn--ghost {
  border-color: var(--line);
  background: transparent;
  color: var(--ink);
}

.btn--ghost:hover {
  background: var(--bg);
}

.btn--danger {
  margin-left: auto;
  background: transparent;
  color: var(--bad);
}

.btn--danger:hover {
  background: var(--bad-bg);
}

/* ==========================================
   TABLET
========================================== */

@media (min-width: 640px) {
  .eh-main {
    padding: 1.75rem 1.5rem 5rem;
  }

  .ticket__stats {
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 0.65rem;
  }

  .stat {
    padding: 0.65rem 0.55rem;
  }

  .stat dd {
    font-size: 1.05rem;
  }
}

/* ==========================================
   MOBILE
========================================== */

@media (max-width: 480px) {
  .eh-header {
    min-height: 3.5rem;
    padding: 0 0.75rem;
  }

  .eh-header__brand {
    gap: 0.55rem;
  }

  .eh-header__mark {
    width: 2.15rem;
    height: 2.15rem;
    border-radius: 0.6rem;
    font-size: 1rem;
  }

  .eh-header__title {
    font-size: 0.95rem;
  }

  .eh-header__sub {
    font-size: 0.65rem;
  }

  .eh-header__home {
    width: 2.15rem;
    height: 2.15rem;
    font-size: 1.1rem;
  }

  .eh-main {
    padding: 1rem 0.65rem 4rem;
  }

  .eh-intro {
    align-items: center;
    margin-bottom: 1rem;
  }

  .eh-intro__eyebrow {
    font-size: 0.58rem;
  }

  .eh-intro__title {
    font-size: 1.1rem;
  }

  .eh-count {
    font-size: 0.62rem;
  }

  .ticket-list {
    gap: 0.85rem;
  }

  .ticket {
    border-radius: 0.9rem;
  }

  .ticket__top {
    gap: 0.75rem;
    padding: 1rem;
  }

  .ticket__eyebrow {
    font-size: 0.59rem;
    letter-spacing: 0.025em;
  }

  .ticket__title {
    font-size: 1.05rem;
  }

  .ticket__chips {
    gap: 0.3rem;
    margin-top: 0.55rem;
  }

  .chip {
    padding: 0.2rem 0.5rem;
    font-size: 0.61rem;
  }

  .seal__ring {
    width: 4.35rem;
    height: 4.35rem;
  }

  .seal__pct {
    font-size: 1rem;
  }

  .seal__agg {
    max-width: 3.5rem;
    font-size: 0.45rem;
  }

  .ticket__perforation {
    margin: 0 1rem;
  }

  .ticket__stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.5rem;
    margin: 1rem;
  }

  .stat {
    padding: 0.6rem 0.65rem;
  }

  .stat dt {
    font-size: 0.6rem;
  }

  .stat dd {
    font-size: 0.95rem;
  }

  .ticket__actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
    padding: 0 1rem 1rem;
  }

  .btn {
    width: 100%;
    min-height: 2.5rem;
    padding: 0.5rem 0.4rem;
    font-size: 0.7rem;
  }

  .btn--primary {
    grid-column: span 2;
  }

  .btn--danger {
    margin-left: 0;
  }
}

/* ==========================================
   VERY SMALL DEVICES
========================================== */

@media (max-width: 350px) {
  .eh-main {
    padding-inline: 0.45rem;
  }

  .ticket__top {
    padding: 0.85rem;
  }

  .ticket__title {
    font-size: 0.95rem;
  }

  .seal__ring {
    width: 3.9rem;
    height: 3.9rem;
  }

  .ticket__stats {
    margin-inline: 0.85rem;
  }

  .ticket__actions {
    padding-inline: 0.85rem;
  }

  .btn {
    font-size: 0.65rem;
  }
}

/* ==========================================
   REDUCED MOTION
========================================== */

@media (prefers-reduced-motion: reduce) {
  .ticket,
  .btn,
  .eh-header__home {
    transition: none;
  }

  .ticket:hover,
  .btn:hover {
    transform: none;
  }
}
</style>