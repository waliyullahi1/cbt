<template>
  <div
    class="flex  pt-10 min-h-dvh w-full max-w-full overflow-x-hidden bg-cover bg-center bg-fixed"
    style="background-image: url('./Image/background.png')"
  >
    <!-- NAVIGATION -->
    <NavigationNavbar
      @dictionary="openBook({ component: 'DICTIONARY' })"
      @bookmarks="openBook({ component: 'BOOKMARKS' })"
      @leaderboard="openBook({ component: 'LEADERBOARD' })"
    />

    <!-- BACKGROUND OVERLAY -->
    <div
      class="flex min-h-dvh w-full max-w-full items-center justify-center overflow-x-hidden bg-black/10 p-2 sm:p-4"
    >
      <!-- MAIN BOOK CONTAINER -->
      <main
        class="relative h-[calc(100dvh-1rem)] w-full max-w-full overflow-hidden rounded-xl shadow-[0_20px_45px_rgba(0,0,0,0.18)] [perspective:1800px] sm:mt-6 sm:h-[85vh] sm:max-w-[70%] md:h-[80vh] lg:h-[75vh]"
      >
        <!-- ====================================================== -->
        <!-- HOME PAGE -->
        <!-- ====================================================== -->
        <section
          :class="[
            'absolute inset-0 z-20 flex w-full max-w-full min-w-0 flex-col overflow-x-hidden overflow-y-auto bg-transparent p-2 transition-all duration-900 ease-in-out [transform-style:preserve-3d] [transform-origin:left_center]',
            appState.showSecond
              ? 'rotate-y-[-110deg] opacity-0'
              : 'rotate-y-0 opacity-100',
          ]"
        >
          <!-- ================================================== -->
          <!-- ACTIVATION BAR -->
          <!-- ================================================== -->
          <section
            class="mt-1 flex w-full max-w-full min-w-0 shrink-0 items-center justify-between gap-2 rounded-xl bg-white/35 p-2 shadow-[0_2px_8px_rgba(0,0,0,0.05)] backdrop-blur-[8px] sm:mt-2 sm:px-5 sm:py-3"
          >
            <!-- Welcome -->
            <div class="flex min-w-0 items-center gap-2">
              <div
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-white sm:h-10 sm:w-10"
              >
                <Icon
                  name="lucide:triangle-alert"
                  class="h-4 w-4 sm:h-5 sm:w-5"
                />
              </div>

              <span
                class="overflow-hidden text-ellipsis whitespace-nowrap text-[9px] font-semibold text-green-700 sm:text-[13px]"
              >
                Welcome to your learning journey
              </span>
            </div>

            <!-- Activation --> 
            <div class="flex min-w-0 shrink-0 items-center gap-1">
              <span
                class="hidden rounded-lg bg-yellow-400 px-3 py-2 text-center text-[11px] font-bold text-gray-900 md:block"
              >
                Unlock Premium Learning
              </span>
          
              <button
                type="button"
                class="rounded-full  bg-orange-500 px-2.5 py-1.5 text-[10px] font-bold text-white transition-colors duration-200 hover:bg-orange-600 sm:px-3 sm:py-2 sm:text-xs"
                @click="openBook({ component: 'ACTIVATEPRODUCT' })"
              > 
                Activate
              </button>
            </div>
          </section>

          <!-- ================================================== -->
          <!-- DASHBOARD -->
          <!-- ================================================== -->
          <section
            class="mt-2 flex min-h-0 w-full max-w-full flex-1 flex-col gap-2 overflow-hidden sm:mt-3 sm:grid sm:grid-cols-1 sm:gap-3 md:grid-cols-2"
          >
            <!-- ================================================== -->
            <!-- FEATURE CARDS -->
            <!-- ================================================== -->
            <div
              class="order-2 grid min-h-0 w-full max-w-full min-w-0 grid-cols-2 grid-rows-3 gap-2 sm:gap-3 md:order-1"
            >
              <button
                v-for="item in dashboardItems"
                :key="item.title"
                type="button"
                :class="[
                  'group flex min-h-0 min-w-0 flex-col items-center justify-center overflow-hidden rounded-[0.65rem] p-1.5 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_18px_rgba(0,0,0,0.1)] sm:rounded-xl sm:p-3',
                  item.class,
                ]"
                @click="openBook(item)"
              >
                <Icon
                  :name="item.icon"
                  class="mb-1 h-7 w-7 shrink-0 transition-transform duration-200 group-hover:scale-110 sm:mb-2 sm:h-9 sm:w-9"
                />

                <h2
                  class="text-[15px] font-extrabold leading-tight sm:text-sm"
                >
                  {{ item.title }}
                </h2>

                <p
                  class="mt-1 line-clamp-2 font-medium overflow-hidden text-[10px] leading-tight opacity-70 sm:text-[11px]"
                >
                  {{ item.description }}
                </p>
              </button>
            </div>

            <!-- ================================================== -->
            <!-- CAROUSEL -->
            <!-- ================================================== -->
            <div
              class="order-1 min-h-[120px] w-full max-w-full min-w-0 overflow-hidden rounded-xl bg-slate-950 sm:min-h-[160px] md:order-2 md:h-full md:min-h-0"
            >
              <!-- Desktop / Tablet -->
              <div
                class="hidden h-full w-full max-w-full min-w-0 overflow-hidden md:block"
              >
                <UiCarousel />
              </div>

              <!-- Mobile -->
              <div
                class="block h-[160px] w-full max-w-full min-w-0 overflow-hidden md:hidden"
              >
                <UiCarousel2 />
              </div>
            </div>
          </section>

          <!-- ================================================== -->
          <!-- QUICK ACCESS -->
          <!-- ================================================== -->
          <section
            class="mt-2 hidden w-full max-w-full shrink-0 grid-cols-4 gap-2 pb-1 md:grid"
          >
            <div
              v-for="item in quickAccess"
              :key="item.to"
              class="flex min-w-0 items-center gap-2 rounded-lg bg-amber-50 p-2 shadow-[0_2px_6px_rgba(0,0,0,0.05)]"
            >
              <Icon
                :name="item.icon"
                :class="[
                  'h-6 w-6 shrink-0',
                  item.iconClass,
                ]"
              />

              <div class="min-w-0">
                <h3 class="truncate text-xs font-bold">
                  {{ item.title }}
                </h3>

                <p class="truncate text-[10px] text-gray-500">
                  {{ item.description }}
                </p>
              </div>
            </div>
          </section>
        </section>

        <!-- ====================================================== -->
        <!-- SECOND PAGE -->
        <!-- ====================================================== -->
        <section
          :class="[
            'absolute inset-0 z-10 w-full max-w-full min-w-0 overflow-x-hidden overflow-y-auto bg-transparent transition-all duration-900 ease-in-out',
            appState.showSecond
              ? 'translate-x-0 opacity-100'
              : 'translate-x-20 opacity-0',
          ]"
        >
          <!-- UTME -->
          <div
            v-if="appState.currentPage === 'UTME'"
            class="min-h-full w-full max-w-full min-w-0 overflow-x-hidden"
          >
            <PracticeUTME @gohome="closeBook" />
          </div>

          <!-- DICTIONARY -->
          <div
            v-else-if="appState.currentPage === 'DICTIONARY'"
            class="min-h-full w-full max-w-full min-w-0 overflow-x-hidden"
          >
            <DictionarySearch @gohome="closeBook" />
          </div>

          <!-- RESULTS -->
          <div
            v-else-if="appState.currentPage === 'RESULTS'"
            class="min-h-full w-full max-w-full min-w-0 overflow-x-hidden"
          >
            <ResultHistory @gohome="closeBook" />
          </div>

          <!-- ACTIVATION -->
          <div
            v-else-if="appState.currentPage === 'ACTIVATEPRODUCT'"
            class="min-h-full w-full max-w-full min-w-0 overflow-x-hidden"
          >
            <ActivateProduct @gohome="closeBook" />
          </div>

          <!-- LESSON -->
          <div
            v-else-if="appState.currentPage === 'LESSON'"
            class="min-h-full w-full max-w-full min-w-0 overflow-x-hidden"
          >
            <!--
            <lessonViewer @gohome="closeBook" />
            -->
          </div>

          <!-- QUESTION SEARCH -->
          <div
            v-else-if="appState.currentPage === 'QuestionSearch'"
            class="min-h-full w-full max-w-full min-w-0 overflow-x-hidden"
          >
            <QuestionSearch @gohome="closeBook" />
          </div>

          <!-- CLASSROOM -->
          <div
            v-else-if="appState.currentPage === 'CLASS'"
            class="min-h-full w-full max-w-full min-w-0 overflow-x-hidden"
          >
            <Classroom @gohome="closeBook" />
          </div>

          <!-- LEADERBOARD -->
          <div
            v-else-if="appState.currentPage === 'LEADERBOARD'"
            class="min-h-full w-full max-w-full min-w-0 overflow-x-hidden"
          >
            <Leaderboard @gohome="closeBook" />
          </div>

          <!-- BOOKMARKS -->
          <div
            v-else-if="appState.currentPage === 'BOOKMARKS'"
            class="min-h-full w-full max-w-full min-w-0 overflow-x-hidden"
          >
            <Bookmarks @gohome="closeBook" />
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue"

// ============================================================
// APP STATE
// ============================================================

const appState = useAppState()
const auth = useExamTipsAuth()

const currentUser = computed(() => {
  return auth.user?.value || auth.user || {}
})

// ============================================================
// DASHBOARD ITEMS
// ============================================================

const dashboardItems = [
  {
    title: "Practice for UTME",
    description: "Prepare for JAMB CBT",
    icon: "lucide:rocket",
    class: "bg-indigo-100 text-indigo-900",
    route: "/practice/utme",
    component: "UTME",
  },

  {
    title: "Classroom",
    description: "Learn from expert teachers",
    icon: "lucide:school",
    class: "bg-blue-100 text-blue-900",
    route: "/classroom",
    component: "CLASS",
  },

  {
    title: "Dictionary",
    description: "Discover meanings, synonyms and new words",
    icon: "lucide:book-open",
    class: "bg-pink-100 text-pink-900",
    route: "/dictionary",
    component: "DICTIONARY",
  },

  {
    title: "Result History",
    description: "View your past practice and exam results",
    icon: "lucide:clipboard-list",
    class: "bg-indigo-100 text-indigo-900",
    route: "/results-history",
    component: "RESULTS",
  },

  {
    title: "Question Bank",
    description: "Discover courses and teachers",
    icon: "lucide:store",
    class: "bg-purple-100 text-purple-900",
    route: "/marketplace",
    component: "QuestionSearch",
  },

  {
    title: "Leaderboard",
    description: "See top students",
    icon: "lucide:trophy",
    class: "bg-pink-100 text-pink-900",
    route: "/leaderboard",
    component: "LEADERBOARD",
  },
]

// ============================================================
// CAROUSEL SLIDES
// ============================================================

const slides = [
  {
    title: "Prepare. Practice. Succeed.",
    description:
      "Build your confidence with thousands of practice questions and expert lessons.",
    button: "Start Practicing",
    image: "/image/student.jpg",
  },

  {
    title: "Learn from Expert Teachers",
    description:
      "Join teachers, explore courses and learn at your own pace.",
    button: "Explore Marketplace",
    image: "/image/teacher.jpg",
  },

  {
    title: "Your Exam Success Starts Here",
    description:
      "Prepare for UTME, WAEC, NECO and other examinations.",
    button: "Explore Exams",
    image: "/image/exam.jpg",
  },
]

const currentSlide = ref(0)

// ============================================================
// QUICK ACCESS
// ============================================================

const quickAccess = [
  {
    to: "/performance",
    icon: "lucide:chart-no-axes-combined",
    iconClass: "text-blue-600",
    title: "Performance",
    description: "Track your progress",
  },

  {
    to: "/leaderboard",
    icon: "lucide:trophy",
    iconClass: "text-yellow-600",
    title: "Leaderboard",
    description: "See top students",
  },

  {
    to: "/quizzes",
    icon: "lucide:brain",
    iconClass: "text-purple-600",
    title: "Quizzes",
    description: "Test your knowledge",
  },

  {
    to: "/teachers",
    icon: "lucide:users",
    iconClass: "text-green-600",
    title: "Teachers",
    description: "Find expert teachers",
  },
]

// ============================================================
// CAROUSEL CONTROLS
// ============================================================

const nextSlide = () => {
  currentSlide.value =
    (currentSlide.value + 1) % slides.length
}

const previousSlide = () => {
  currentSlide.value =
    (currentSlide.value - 1 + slides.length) % slides.length
}

// ============================================================
// OPEN PAGE
// ============================================================

const openBook = (item: any) => {
  if (!item?.component) return

  appState.value.currentPage = item.component
  appState.value.showSecond = true
}

// ============================================================
// CLOSE PAGE
// ============================================================

const closeBook = () => {
  appState.value.showSecond = false
}
</script>