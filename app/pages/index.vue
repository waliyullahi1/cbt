<template>
  <div
    class="relative isolate block h-dvh w-full max-w-full
         overflow-hidden overscroll-none bg-[#F3F7FE] sm:flex "
     style="background-image: url('./Image/background.png')"
  >
 <div class="relative flex h-full min-h-0 w-full flex-col bg-white/80 sm:flex-row">
 
    <!-- Desktop / tablet background image (hidden on phones) -->
    <div
      class="fixed inset-0 -z-10 hidden bg-cover bg-center sm:block"
      style="background-image: url('./Image/background.png')"
    />

    <!-- NAVIGATION (desktop / tablet only; phones use the header + tab bar below) -->
    <div class="hidden sm:contents">
      <NavigationNavbar
        @dictionary="openBook({ component: 'DICTIONARY' })"
        @bookmarks="openBook({ component: 'BOOKMARKS' })"
        @leaderboard="openBook({ component: 'LEADERBOARD' })"
      />
    </div>

    <!-- OVERLAY -->
    <div
      class="flex h-full min-h-0 w-full max-w-full
         items-center justify-center overflow-hidden
         bg-transparent p-0 sm:bg-black/10 sm:p-4"
    >
      <!-- MAIN BOOK CONTAINER -->
      <main
        class="relative h-dvh w-full max-w-full overflow-hidden rounded-none shadow-none [perspective:1800px] sm:mt-6 sm:h-[85vh] sm:max-w-[70%] sm:rounded-xl sm:shadow-[0_20px_45px_rgba(0,0,0,0.18)] md:h-[80vh] lg:h-[75vh]"
      >
        <!-- ====================================================== -->
        <!-- HOME PAGE -->
        <!-- ====================================================== -->
        <section
          :class="[
            'absolute inset-0 z-20 flex w-full max-w-full min-w-0 flex-col overflow-x-hidden overflow-hidden bg-transparent p-0 transition-all duration-900 ease-in-out [transform-style:preserve-3d] [transform-origin:left_center] sm:p-2',
            appState.showSecond
              ? 'pointer-events-none rotate-y-[-110deg] opacity-0'
              : 'rotate-y-0 opacity-100',
          ]"
        >
          <!-- ================================================== -->
          <!-- MOBILE HOME (phones only) -->
          <!-- ================================================== -->
          <div
            class="relative   flex h-full min-h-0 w-full flex-col pb-[calc(4rem+env(safe-area-inset-bottom,0px))] sm:hidden"
          >
            <!-- HEADER -->
            <header
              class="shrink-0 b text-ite"
            >
              <div class="flex h-12 items-center gap-1 px-2">
                <button
                  type="button"
                  class="flex h-9 p-0.5 w-9 bg-primary/10 shadow-[0_2px_8px_rgba(20,49,109,0.09)] rounded-full bg-primry   shrink-0 items-center justify-center  active:bg-white/10"
                  aria-label="Open menu"
                  @click="menuOpen = true"
                >
                 <img src="/images/logos.svg"   class=" w"  >
                </button>

                <div class="flex min-w-0 flex-1 items-center gap-2.5">
                  
                  <span class="truncate text-[15px] font-bold tracking-tight">
                    ExamTips
                  </span>
                </div>

                <button
                  type="button"
                  class="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full active:bg-white/10"
                  aria-label="Notifications"
                >
                  <Icon name="lucide:bell" class="h-5 text-black w-5" />
                  <span
                    v-if="notificationCount > 0"
                    class="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold leading-none text-white"
                  >
                    {{ notificationCount }}
                  </span>
                </button>

               
              </div>
            </header>

            <!-- SCROLL AREA -->
            <div class="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
              <!-- Greeting + activate -->
              <div class="flex items-start justify-between gap-3 pt-4">
                <div class="min-w-0">
                  <h1
                    class="text-[15px] font-extrabold leading-tight text-[#0A2A66]"
                  >
                    {{ greeting }} <span aria-hidden="true">👋</span>
                  </h1>
                  <p class="mt-0.5 text-xs text-[#5B6E8F]">
                    Ready to improve your score?
                  </p>
                </div>

                <button
                  type="button"
                  class="flex shrink-0 items-center gap-1.5 rounded-full bg-[#f5520c] px-3.5 py-2 text-[9px] font-semibold text-white shadow-[0_4px_10px_rgba(245,137,12,0.35)] active:bg-[#E07A05]"
                  @click="openBook({ component: 'ACTIVATEPRODUCT' })"
                >
                  <Icon name="lucide:crown" class="h-3 w-3" />
                  Activate account
                </button>
              </div>

              <!-- Banner carousel -->
              <div class=" py-3">
              <UiCarousel2/>
              </div>
              <!-- Feature cards -->
              <div class="mt-4 grid grid-cols-2 gap-1">
                <button
                  v-for="item in dashboardItems"
                  :key="item.title"
                  type="button"
                  class="flex min-w-0 flex-col items-start rounded-sm border border-slate-200/70 bg-white p-2.5 text-left shadow-[0_2px_8px_rgba(10,42,102,0.06)] transition-transform duration-150 active:scale-[0.98]"
                  @click="openBook(item)"
                >
                  <span
                    :class="[
                      'flex h-12 w-12 items-center justify-center rounded-full',
                      item.circle,
                    ]"
                  >
                    <Icon :name="item.icon" :class="['h-6 w-6', item.iconColor]" />
                  </span>

                  <h2
                    class="mt-3 text-[12px] font-extrabold leading-tight text-[#0A2A66]"
                  >
                    {{ item.title }}
                  </h2>

                  <p class="mt-1 line-clamp-2 text-[10px] leading-snug text-[#5B6E8F]">
                    {{ item.shortDescription }}
                  </p>
                </button>
              </div>
            </div>

            <!-- SIDE MENU (drawer) -->
            <div
              :class="[
                'absolute inset-0 z-50',
                menuOpen ? '' : 'pointer-events-none',
              ]"
            >
              <div
                :class="[
                  'absolute inset-0 bg-black/40 transition-opacity duration-300',
                  menuOpen ? 'opacity-100' : 'opacity-0',
                ]"
                @click="menuOpen = false"
              />

              <aside
                :class="[
                  'absolute top-0 left-0 flex h-full w-[78%] max-w-[300px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out',
                  menuOpen ? 'translate-x-0' : '-translate-x-full',
                ]"
              >
                <div
                  class="flex items-center gap-2.5 bg-[#0A2A66] px-4 pb-4 pt-[calc(env(safe-area-inset-top,0px)+1rem)] text-white"
                >
                  <div
                    class="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1A66F5]"
                  >
                    <Icon name="lucide:graduation-cap" class="h-6 w-6" />
                  </div>
                  <span class="text-xl font-bold tracking-tight">ExamTips</span>
                </div>

                <nav class="flex-1 overflow-y-auto p-2">
                  <button
                    v-for="entry in menuItems"
                    :key="entry.component"
                    type="button"
                    class="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[15px] font-semibold text-[#0A2A66] active:bg-slate-100"
                    @click="openFromMenu(entry.component)"
                  >
                    <Icon :name="entry.icon" class="h-5 w-5 text-[#1A66F5]" />
                    {{ entry.label }}
                  </button>
                </nav>
              </aside>
            </div>
          </div>

          <!-- ================================================== -->
          <!-- DESKTOP / TABLET HOME (unchanged) -->
          <!-- ================================================== -->
          <div class="hidden min-h-0 w-full flex-1 flex-col sm:flex">
            <!-- ACTIVATION BAR -->
            <section
              class="mt-1 flex w-full max-w-full min-w-0 shrink-0 items-center justify-between gap-2 rounded-xl bg-white/35 p-2 shadow-[0_2px_8px_rgba(0,0,0,0.05)] backdrop-blur-[8px] sm:mt-2 sm:px-5 sm:py-3"
            >
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

              <div class="flex min-w-0 shrink-0 items-center gap-1">
                <span
                  class="hidden rounded-lg bg-yellow-400 px-3 py-2 text-center text-[11px] font-bold text-gray-900 md:block"
                >
                  Unlock Premium Learning
                </span>

                <button
                  type="button"
                  class="rounded-full bg-orange-500 px-2.5 py-1.5 text-[10px] font-bold text-white transition-colors duration-200 hover:bg-orange-600 sm:px-3 sm:py-2 sm:text-xs"
                  @click="openBook({ component: 'ACTIVATEPRODUCT' })"
                >
                  Activate
                </button>
              </div>
            </section>

            <!-- DASHBOARD -->
            <section
              class="mt-2 flex min-h-0 w-full max-w-full flex-1 flex-col gap-2 overflow-hidden sm:mt-3 sm:grid sm:grid-cols-1 sm:gap-3 md:grid-cols-2"
            >
              <!-- FEATURE CARDS -->
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
                    class="mt-1 line-clamp-2 overflow-hidden text-[10px] font-medium leading-tight opacity-70 sm:text-[11px]"
                  >
                    {{ item.description }}
                  </p>
                </button>
              </div>

              <!-- CAROUSEL -->
              <div
                class="order-1 min-h-[120px] w-full max-w-full min-w-0 overflow-hidden rounded-xl bg-slate-950 sm:min-h-[160px] md:order-2 md:h-full md:min-h-0"
              >
                <div
                  class="hidden h-full w-full max-w-full min-w-0 overflow-hidden md:block"
                >
                  <UiCarousel />
                </div>

                <div
                  class="block h-[160px] w-full max-w-full min-w-0 overflow-hidden md:hidden"
                >
                  <UiCarousel2 />
                </div>
              </div>
            </section>

            <!-- QUICK ACCESS -->
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
                  :class="['h-6 w-6 shrink-0', item.iconClass]"
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
          </div>
        </section>

        <!-- ====================================================== -->
        <!-- SECOND PAGE -->
        <!-- ====================================================== -->
        <section
          :class="[
            'absolute inset-0 z-10 w-full max-w-full min-w-0 overflow-x-hidden overflow-y-auto bg-transparent   transition-all duration-900 ease-in-out sm:pt-0 sm:pb-0',
            appState.showSecond
              ? 'translate-x-0 opacity-100'
              : 'translate-x-20 opacity-0',
          ]"
        >
          <!-- UTMEe -->
          <div
            v-if="appState.currentPage === 'UTME'"
            class="min-h-full w-full max-w-full min-w-0 overflow-x-hidden"
          >
            <PracticeUTME @gohome="closeBook" />
          </div>

          <!-- DICTIONARY -->
          <div
            v-else-if="appState.currentPage === 'DICTIONARY'"
            class="   h-dvh w-full max-w-full min-w-0 overflow-x-hidden"
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

          <!-- PROFILE (placeholder until you build the page) -->
          <div
            v-else-if="appState.currentPage === 'PROFILE'"
            class="flex min-h-full w-full flex-col items-center justify-center gap-3 p-6 text-center"
          >
            <Icon name="lucide:user-round" class="h-12 w-12 text-[#1A66F5]" />
            <p class="text-lg font-bold text-[#0A2A66]">Profile</p>
            <p class="text-sm text-[#5B6E8F]">This page is not ready yet.</p>
            <button
              type="button"
              class="rounded-full bg-[#0B63F6] px-5 py-2 text-sm font-semibold text-white"
              @click="closeBook"
            >
              Back to home
            </button>
          </div>
        </section>

        <!-- ====================================================== -->
        <!-- BOTTOM TAB BAR (phones only) -->
        <!-- ====================================================== -->
        <nav
          class="absolute inset-x-0 bottom-0 z-30 border-t border-slate-200/70 bg-white pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-4px_14px_rgba(10,42,102,0.08)] sm:hidden"
          aria-label="Main"
        >
          <div class="grid h-14 grid-cols-4">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              type="button"
              :class="[
                'relative flex flex-col items-center justify-center gap-0. text-[12px] font-medium transition-colors',
                activeTab === tab.key ? 'text-[#0B63F6]' : 'text-[#5B6E8F]',
              ]"
              @click="goToTab(tab)"
            >
              <Icon
                :name="tab.icon"
                :class="['h-5 w-5', activeTab === tab.key ? 'text-[#0B63F6]' : '']"
              />
              {{ tab.label }}
              <span
                v-if="activeTab === tab.key"
                class="absolute bottom-2 h-[3px] w-12 rounded-full bg-[#0B63F6]"
              />
            </button>
          </div>
        </nav>
      </main>
    </div>
   </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue"

// ============================================================
// APP STATE
// ============================================================

const appState = useAppState()
const auth = useExamTipsAuth()

const currentUser = computed(() => {
  return auth.user?.value || auth.user || {}
})

// ============================================================
// MOBILE UI STATE
// ============================================================

const menuOpen = ref(false)

// Replace with your real unread count when notifications are ready.
const notificationCount = ref(2)

const greeting = ref("Hello")

const updateGreeting = () => {
  const hour = new Date().getHours()

  if (hour < 12) greeting.value = "Good morning"
  else if (hour < 17) greeting.value = "Good afternoon"
  else greeting.value = "Good evening"
}

// ============================================================
// DASHBOARD ITEMS
// ============================================================

const dashboardItems = [
  {
    title: "Practice  for UTME",
    description: "Prepare for JAMB CBT",
    shortDescription: "Prepare for JAMB CBT",
    icon: "ph:note-pencil",
    class: "bg-indigo-100 text-indigo-900",
    circle: "bg-[#DCE9FF]",
    iconColor: "text-[#1A66F5]",
    route: "/practice/utme",
    component: "UTME",
  },

  {
    title: "Classroom",
    description: "Learn from expert teachers",
    shortDescription: "Learn from expert teachers",
    icon: "ph:chalkboard-teacher",
    class: "bg-blue-100 text-blue-900",
    circle: "bg-[#E6E1FA]",
    iconColor: "text-[#3B2BB8]",
    route: "/classroom",
    component: "CLASS",
  },

  {
    title: "Dictionary",
    description: "Discover meanings, synonyms and new words",
    shortDescription: "Meanings and new words",
    icon: "ph:book-open",
    class: "bg-pink-100 text-pink-900",
    circle: "bg-[#FBD9CF]",
    iconColor: "text-[#D9391E]",
    route: "/dictionary",
    component: "DICTIONARY",
  },

  {
    title: "Result History",
    description: "View your past practice and exam results",
    shortDescription: "Track your progress",
    icon: "ph:clipboard-text",
    class: "bg-indigo-100 text-indigo-900",
    circle: "bg-[#DCE9FF]",
    iconColor: "text-[#1A66F5]",
    route: "/results-history",
    component: "RESULTS",
  },

  {
    title: "Question Bank",
    description: "Discover courses and teachers",
    shortDescription: "Practice past questions",
    icon: "ph:storefront",
    class: "bg-purple-100 text-purple-900",
    circle: "bg-[#E6E1FA]",
    iconColor: "text-[#3B2BB8]",
    route: "/marketplace",
    component: "QuestionSearch",
  },

  {
    title: "Leaderboard",
    description: "See top students",
    shortDescription: "Top students",
    icon: "ph:trophy",
    class: "bg-pink-100 text-pink-900",
    circle: "bg-[#FBD9CF]",
    iconColor: "text-[#D9391E]",
    route: "/leaderboard",
    component: "LEADERBOARD",
  },
]

// ============================================================
// CAROUSEL SLIDES (mobile banner)
// ============================================================

const slides = [
  {
    tag: "WAEC exam prep",
    title: "Master Your WAEC Subjects",
    description: "Learn smarter with lessons and practice tests.",
    button: "Start learning",
    component: "CLASS",
    image: "/image/student.jpg",
  },

  {
    tag: "Expert teachers",
    title: "Learn from Expert Teachers",
    description: "Explore courses and learn at your own pace.",
    button: "Open classroom",
    component: "CLASS",
    image: "/image/teacher.jpg",
  },

  {
    tag: "UTME, WAEC, NECO",
    title: "Your Exam Success Starts Here",
    description: "Thousands of practice questions in one place.",
    button: "Start practicing",
    component: "UTME",
    image: "/image/exam.jpg",
  },
]

const currentSlide = ref(0)

// ============================================================
// QUICK ACCESS (desktop)
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
// SIDE MENU ITEMS (mobile)
// ============================================================

const menuItems = [
  { label: "Dictionary", icon: "lucide:book-open", component: "DICTIONARY" },
  { label: "Bookmarks", icon: "lucide:bookmark", component: "BOOKMARKS" },
  { label: "Leaderboard", icon: "lucide:trophy", component: "LEADERBOARD" },
  { label: "Activate account", icon: "lucide:crown", component: "ACTIVATEPRODUCT" },
]

// ============================================================
// BOTTOM TABS (mobile)
// ============================================================

const tabs = [
  { key: "HOME", label: "Home", icon: "lucide:house", component: "" },
  { key: "CLASS", label: "Learn", icon: "lucide:book-open", component: "CLASS" },
  {
    key: "RESULTS",
    label: "Results",
    icon: "lucide:chart-no-axes-column",
    component: "RESULTS",
  },
  { key: "PROFILE", label: "Profile", icon: "lucide:user", component: "PROFILE" },
]

const activeTab = computed(() =>
  appState.value.showSecond ? appState.value.currentPage : "HOME",
)

// ============================================================
// CAROUSEL CONTROLS
// ============================================================

const AUTOPLAY_MS = 5000

let autoplayTimer: ReturnType<typeof setInterval> | undefined
let touchStartX = 0

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.length
}

const previousSlide = () => {
  currentSlide.value =
    (currentSlide.value - 1 + slides.length) % slides.length
}

const stopAutoplay = () => {
  if (autoplayTimer) clearInterval(autoplayTimer)
  autoplayTimer = undefined
}

const startAutoplay = () => {
  stopAutoplay()
  autoplayTimer = setInterval(nextSlide, AUTOPLAY_MS)
}

const goToSlide = (index: number) => {
  currentSlide.value = index
  startAutoplay()
}

const onTouchStart = (event: TouchEvent) => {
  touchStartX = event.touches[0].clientX
  stopAutoplay()
}

const onTouchEnd = (event: TouchEvent) => {
  const deltaX = event.changedTouches[0].clientX - touchStartX

  if (Math.abs(deltaX) > 40) {
    if (deltaX < 0) nextSlide()
    else previousSlide()
  }

  startAutoplay()
}

// ============================================================
// OPEN / CLOSE PAGE
// ============================================================

const openBook = (item: any) => {
  if (!item?.component) return

  appState.value.currentPage = item.component
  appState.value.showSecond = true
}

const closeBook = () => {
  appState.value.showSecond = false
}

const goToTab = (tab: { key: string; component: string }) => {
  if (tab.key === "HOME") {
    closeBook()
    return
  }

  openBook({ component: tab.component })
}

const openFromMenu = (component: string) => {
  menuOpen.value = false
  openBook({ component })
}

// ============================================================
// LIFECYCLE
// ============================================================

onMounted(() => {
  updateGreeting()
  startAutoplay()
})

onBeforeUnmount(() => {
  stopAutoplay()
})
</script>