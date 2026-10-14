<script setup lang="ts">
import { computed, onMounted, ref, unref, watch } from "vue"

const emit = defineEmits(["gohome"])

interface LeaderboardStudent {
  id: number | string
  name: string
  location: string
  score: number
  total: number
  time: string
  examType: string
  category: string
  avatar?: string | null
  trend?: number
}

/* ================================
   API (loads after the page shows)
================================ */

const data = ref<any>(null)
const error = ref<any>(null)
const pending = ref(true)
const hasLoaded = ref(false) // becomes true once the API replies

const loadLeaderboard = async () => {
  pending.value = true
  error.value = null

  try {
    const response: any = await useApiFetch("/leaderboard", {
      method: "GET",
    })

    // works whether the wrapper returns refs or plain values
    data.value = unref(response?.data) ?? null
    error.value = unref(response?.error) ?? null
  } catch (err) {
    console.error("Leaderboard request failed:", err)
    error.value = err
  } finally {
    pending.value = false
    hasLoaded.value = true
  }
}

onMounted(() => {
  void loadLeaderboard()
})

/* ================================
   FALLBACK DATA
================================ */

const fallbackStudents: LeaderboardStudent[] = [
  { id: 1, name: "Oyindamola", location: "Lagos", score: 373, total: 400, time: "00:37:45", examType: "Exam Practice", category: "Aggregate" },
  { id: 2, name: "Ojo Boluwatife", location: "Ekiti", score: 372, total: 400, time: "00:36:10", examType: "Exam Practice", category: "Aggregate" },
  { id: 3, name: "Adio Ibrahim Kayode", location: "Lagos", score: 308, total: 400, time: "01:55:32", examType: "Exam Practice", category: "Aggregate" },
  { id: 4, name: "Alabi Amirat", location: "Kwara", score: 293, total: 400, time: "00:12:13", examType: "Exam Practice", category: "Aggregate" },
  { id: 5, name: "Great Blessed", location: "Lagos", score: 280, total: 400, time: "01:26:11", examType: "Exam Practice", category: "Aggregate" },
  { id: 6, name: "Ucheagwu Ngozi Henrietta", location: "Lagos", score: 269, total: 400, time: "01:45:10", examType: "Exam Practice", category: "Aggregate" },
  { id: 7, name: "Ifeanyi-Obiejesi", location: "Lagos", score: 263, total: 400, time: "01:32:24", examType: "Exam Practice", category: "Aggregate" },
  { id: 8, name: "Demilade", location: "Ogun", score: 254, total: 400, time: "01:18:42", examType: "Exam Practice", category: "Aggregate" },
  { id: 9, name: "Abdulrahman Musa", location: "Kano", score: 248, total: 400, time: "01:10:25", examType: "Exam Practice", category: "Aggregate" },
  { id: 10, name: "Esther Favour", location: "Abia", score: 241, total: 400, time: "01:04:18", examType: "Exam Practice", category: "Aggregate" },
]

/* ================================
   STATE
================================ */

const searchQuery = ref("")
const selectedExamType = ref("Exam Practice")
const selectedCategory = ref("Aggregate")
const currentPage = ref(1)

const itemsPerPage = 8

/* ================================
   NORMALIZE API DATA
================================ */

const students = computed<LeaderboardStudent[]>(() => {
  // Before the request finishes (or if it failed), show the sample
  if (!hasLoaded.value || error.value) {
    return fallbackStudents
  }

  const apiData = data.value

  const result =
    apiData?.data?.leaderboard ??
    apiData?.data?.students ??
    apiData?.leaderboard ??
    apiData?.students ??
    []

  if (!Array.isArray(result) || result.length === 0) {
    return fallbackStudents
  }

  const normalized = result
    .filter((student: any) => student && typeof student === "object")
    .map((student: any, index: number) => ({
      id: student.id ?? student._id ?? `student-${index}`,

      name:
        student.name ??
        student.fullName ??
        student.studentName ??
        "Unknown Student",

      location:
        student.location ??
        student.state ??
        student.city ??
        "Unknown",

      score: Number(
        student.score ?? student.totalScore ?? student.aggregate ?? 0,
      ),

      total: Number(
        student.total ?? student.maxScore ?? student.maximumScore ?? 400,
      ),

      time:
        student.time ??
        student.timeSpent ??
        student.duration ??
        "00:00:00",

      examType: student.examType ?? student.exam_type ?? "Exam Practice",

      category: student.category ?? student.scoreType ?? "Aggregate",

      avatar: student.avatar ?? null,
      trend: Number(student.trend ?? 0),
    }))

  return normalized.length ? normalized : fallbackStudents
})

/* ================================
   FILTERS
================================ */

const filteredStudents = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()

  return students.value
    .filter((student) => {
      const matchesExam =
        selectedExamType.value === "All" ||
        student.examType === selectedExamType.value

      const matchesCategory =
        selectedCategory.value === "All" ||
        student.category === selectedCategory.value

      const searchableText = [
        student.name,
        student.location,
        student.examType,
        student.category,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      const matchesSearch = !query || searchableText.includes(query)

      return matchesExam && matchesCategory && matchesSearch
    })
    .sort((a, b) => b.score - a.score)
})

/* ================================
   PAGINATION
================================ */

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredStudents.value.length / itemsPerPage)),
)

const paginatedStudents = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage

  return filteredStudents.value.slice(start, start + itemsPerPage)
})

const topThree = computed(() => filteredStudents.value.slice(0, 3))

/* ================================
   HELPERS
================================ */

const getRank = (student: LeaderboardStudent) => {
  const index = filteredStudents.value.findIndex(
    (item) => item.id === student.id,
  )

  return index >= 0 ? index + 1 : 0
}

const getInitials = (name: string) => {
  return (
    name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "ST"
  )
}

const getRankClass = (rank: number) => {
  if (rank === 1) return "bg-[#b9873b]/15 text-[#b9873b]"
  if (rank === 2) return "bg-slate-100 text-slate-600"
  if (rank === 3) return "bg-orange-100 text-orange-700"
  return "bg-[#24304a]/10 text-[#24304a]"
}

const resetFilters = () => {
  searchQuery.value = ""
  selectedExamType.value = "Exam Practice"
  selectedCategory.value = "Aggregate"
  currentPage.value = 1
}

const previousPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const goHome = () => {
  emit("gohome")
}

watch([searchQuery, selectedExamType, selectedCategory], () => {
  currentPage.value = 1
})
</script>

<template>
  <div
    class="min-h-screen bg-[#f7f8fa] font-['Poppins',sans-serif] text-[#24304a]"
  >
    <!-- HEADER -->
    <header class="bg-[#24304a] text-white">
      <div
        class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8"
      >
        <!-- BRAND -->
        <div class="flex min-w-0 items-center gap-3">
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#b9873b] text-white"
          >
            <Icon name="lucide:trophy" size="21" />
          </div>

          <div class="min-w-0">
            <h1 class="truncate text-base font-semibold sm:text-lg">
              Leaderboard
            </h1>

            <p class="text-[11px] text-white/65 sm:text-xs">
              Practice. Improve. Achieve.
            </p>
          </div>
        </div>

        <!-- HOME BUTTON -->
        <button
          type="button"
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/10 hover:text-white"
          aria-label="Go home"
          @click="goHome"
        >
          <Icon name="lucide:house" size="19" />
        </button>
      </div>
    </header>

    <!-- MAIN CONTENT -->
    <main
      class="mx-auto max-w-7xl space-y-5 px-4 py-5 sm:px-6 lg:px-8 lg:py-7"
    >
      <!-- TITLE -->
      <section
        class="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"
      >
        <div>
          <p
            class="mb-1 text-[10px] font-medium uppercase tracking-[0.16em] text-[#b9873b]"
          >
            Student Rankings
          </p>

          <h2 class="text-2xl font-semibold tracking-tight sm:text-3xl">
            Top Performers
          </h2>

          <p class="mt-1 text-xs text-slate-500 sm:text-sm">
            View student performance.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <span
            v-if="pending"
            class="flex items-center gap-1.5 rounded-full bg-[#b9873b]/10 px-3 py-1.5 text-xs font-medium text-[#b9873b]"
          >
            <Icon name="lucide:loader-circle" size="13" class="animate-spin" />
            Updating...
          </span>

          <span
            class="w-fit rounded-full bg-[#24304a]/10 px-3 py-1.5 text-xs font-medium text-[#24304a]"
          >
            {{ filteredStudents.length }} students
          </span>
        </div>
      </section>

      <!-- TOP THREE -->
      <section
        v-if="topThree.length"
        class="grid grid-cols-1 gap-3 md:grid-cols-3"
      >
        <article
          v-for="student in topThree"
          :key="student.id"
          class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div class="flex items-center gap-3">
            <!-- RANK -->
            <div
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-medium"
              :class="getRankClass(getRank(student))"
            >
              {{ getRank(student) }}
            </div>

            <!-- STUDENT -->
            <div class="min-w-0 flex-1">
              <p class="text-[10px] uppercase tracking-wide text-[#b9873b]">
                Rank {{ getRank(student) }}
              </p>

              <h3 class="truncate text-sm font-medium text-[#24304a]">
                {{ student.name }}
              </h3>

              <p class="flex items-center gap-1 text-[11px] text-slate-400">
                <Icon name="lucide:map-pin" size="12" />
                {{ student.location }}
              </p>
            </div>

            <Icon name="lucide:trophy" size="19" class="text-[#b9873b]" />
          </div>

          <div class="my-3 h-px bg-slate-100"></div>

          <div class="flex items-end justify-between">
            <div>
              <p class="text-[11px] text-slate-400">Score</p>

              <p class="text-xl font-medium text-[#24304a]">
                {{ student.score }}
                <span class="text-xs font-normal text-slate-400">
                  /{{ student.total }}
                </span>
              </p>
            </div>

            <div class="text-right">
              <p class="text-[11px] text-slate-400">Time</p>

              <p class="text-xs font-medium text-[#24304a]">
                {{ student.time }}
              </p>
            </div>
          </div>
        </article>
      </section>

      <!-- RANKINGS -->
      <section
        class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <!-- SECTION HEADER -->
        <div
          class="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-5"
        >
          <div>
            <h3 class="text-base font-medium text-[#24304a]">Rankings</h3>

            <p class="mt-0.5 text-[11px] text-slate-400">
              Student performance
            </p>
          </div>

          <Icon name="lucide:chart-column" size="20" class="text-[#b9873b]" />
        </div>

        <!-- EMPTY -->
        <div
          v-if="!paginatedStudents.length"
          class="px-5 py-14 text-center"
        >
          <Icon
            name="lucide:search-x"
            size="32"
            class="mx-auto text-slate-400"
          />

          <p class="mt-3 text-sm font-medium text-[#24304a]">
            No students found
          </p>

          <p class="mt-1 text-xs text-slate-400">
            Try another search or filter.
          </p>

          <button
            type="button"
            class="mt-4 rounded-lg bg-[#24304a] px-4 py-2 text-xs text-white"
            @click="resetFilters"
          >
            Clear filters
          </button>
        </div>

        <!-- TABLE CONTENT -->
        <div v-else>
          <!-- LAPTOP TABLE HEADER -->
          <div
            class="hidden grid-cols-[45px_minmax(180px,1fr)_120px_110px_110px] gap-4 border-b border-slate-100 bg-slate-50 px-5 py-3 text-[10px] font-medium uppercase tracking-wide text-slate-400 md:grid"
          >
            <span>#</span>
            <span>Student</span>
            <span>Location</span>
            <span>Score</span>
            <span>Time</span>
          </div>

          <!-- STUDENT ROWS -->
          <article
            v-for="student in paginatedStudents"
            :key="student.id"
            class="border-b border-slate-100 px-4 py-3 transition hover:bg-slate-50 sm:px-5"
          >
            <!-- LAPTOP VIEW -->
            <div
              class="hidden grid-cols-[45px_minmax(180px,1fr)_120px_110px_110px] items-center gap-4 md:grid"
            >
              <!-- RANK -->
              <div
                class="flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium"
                :class="getRankClass(getRank(student))"
              >
                {{ getRank(student) }}
              </div>

              <!-- STUDENT -->
              <div class="flex min-w-0 items-center gap-3">
                <div
                  class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#24304a] text-[10px] font-medium text-white"
                >
                  {{ getInitials(student.name) }}
                </div>

                <div class="min-w-0">
                  <p class="truncate text-xs font-medium text-[#24304a]">
                    {{ student.name }}
                  </p>

                  <p class="truncate text-[10px] text-slate-400">
                    {{ student.examType }}
                  </p>
                </div>
              </div>

              <!-- LOCATION -->
              <p class="truncate text-xs text-slate-500">
                {{ student.location }}
              </p>

              <!-- SCORE -->
              <div>
                <p class="text-xs font-medium text-[#24304a]">
                  {{ student.score }}
                  <span class="font-normal text-slate-400">
                    /{{ student.total }}
                  </span>
                </p>

                <div
                  class="mt-1 h-1 w-16 overflow-hidden rounded-full bg-slate-100"
                >
                  <div
                    class="h-full rounded-full bg-[#b9873b]"
                    :style="{
                      width: `${
                        student.total
                          ? Math.min(100, (student.score / student.total) * 100)
                          : 0
                      }%`,
                    }"
                  ></div>
                </div>
              </div>

              <!-- TIME -->
              <p class="text-xs text-slate-500">
                {{ student.time }}
              </p>
            </div>

            <!-- PHONE VIEW -->
            <div class="flex items-center gap-3 md:hidden">
              <!-- RANK -->
              <div
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium"
                :class="getRankClass(getRank(student))"
              >
                {{ getRank(student) }}
              </div>

              <!-- INITIALS -->
              <div
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#24304a] text-[10px] font-medium text-white"
              >
                {{ getInitials(student.name) }}
              </div>

              <!-- DETAILS -->
              <div class="min-w-0 flex-1">
                <p class="truncate text-xs font-medium text-[#24304a]">
                  {{ student.name }}
                </p>

                <div
                  class="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-slate-400"
                >
                  <span class="flex items-center gap-1">
                    <Icon name="lucide:map-pin" size="11" />
                    {{ student.location }}
                  </span>

                  <span>•</span>

                  <span class="flex items-center gap-1">
                    <Icon name="lucide:clock-3" size="11" />
                    {{ student.time }}
                  </span>
                </div>
              </div>

              <!-- SCORE -->
              <div class="text-right">
                <p class="text-sm font-medium text-[#24304a]">
                  {{ student.score }}
                </p>

                <p class="text-[10px] text-slate-400">
                  /{{ student.total }}
                </p>
              </div>
            </div>
          </article>
        </div>

        <!-- PAGINATION -->
        <div
          class="flex items-center justify-between gap-3 bg-slate-50 px-4 py-3 sm:px-5"
        >
          <p class="text-[11px] text-slate-400">
            Page {{ currentPage }} of {{ totalPages }}
          </p>

          <div class="flex items-center gap-2">
            <button
              type="button"
              class="flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-medium text-[#24304a] disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="currentPage === 1"
              @click="previousPage"
            >
              <Icon name="lucide:chevron-left" size="14" />
              Prev
            </button>

            <span
              class="flex h-8 min-w-8 items-center justify-center rounded-lg bg-[#24304a] px-2 text-[11px] text-white"
            >
              {{ currentPage }}
            </span>

            <button
              type="button"
              class="flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-medium text-[#24304a] disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="currentPage === totalPages"
              @click="nextPage"
            >
              Next
              <Icon name="lucide:chevron-right" size="14" />
            </button>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>