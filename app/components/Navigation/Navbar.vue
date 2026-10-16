<script setup lang="ts">
const auth = useExamTipsAuth()

// ==========================================
// EMITS
// ==========================================

const emit = defineEmits<{
  (event: "navigate", item: any): void
  (event: "dashboard"): void
  (event: "dictionary"): void
  (event: "bookmarks"): void
  (event: "leaderboard"): void
}>()

const currentUser = computed(() => {
  return auth.user?.value || auth.user || {}
})

// ==========================================
// MENU ITEMS
// ==========================================

const menuItems = [
  {
    label: "Dashboard",
    mobileLabel: "Dashboard",
    icon: "lucide:layout-dashboard",
    active: true,
    route: "dashboard",
  },
  {
    label: "Dictionary",
    mobileLabel: "Dictionary",
    icon: "lucide:book-open",
    active: false,
    route: "dictionary",
  },
  {
    label: "Bookmarks",
    mobileLabel: "Bookmarks",
    icon: "lucide:bookmark",
    active: false,
    route: "bookmarks",
  },
  {
    label: "Leaderboard",
    mobileLabel: "Ranking",
    icon: "lucide:trophy",
    active: false,
    route: "leaderboard",
  },
]

// ==========================================
// DRAWER STATE
// ==========================================

const mobileMenuOpen = ref(false)
const isDragging = ref(false)

const drawerWidth = 280

const startX = ref(0)
const currentX = ref(0)
const dragOffset = ref(0)

const isEdgeSwipe = ref(false)

// ==========================================
// DRAWER STYLE
// ==========================================

const drawerStyle = computed(() => {
  if (isDragging.value) {
    const translate = mobileMenuOpen.value
      ? Math.min(0, dragOffset.value)
      : Math.max(-drawerWidth, dragOffset.value - drawerWidth)

    return {
      transform: `translateX(${translate}px)`,
      transition: "none",
    }
  }

  return {
    transform: mobileMenuOpen.value
      ? "translateX(0)"
      : "translateX(-100%)",

    transition:
      "transform 300ms cubic-bezier(0.22, 1, 0.36, 1)",
  }
})

// ==========================================
// OVERLAY OPACITY
// ==========================================

const overlayStyle = computed(() => {
  if (isDragging.value) {
    const progress = mobileMenuOpen.value
      ? 1 + dragOffset.value / drawerWidth
      : dragOffset.value / drawerWidth

    return {
      opacity: Math.max(0, Math.min(0.55, progress * 0.55)),
    }
  }

  return {
    opacity: mobileMenuOpen.value ? 0.55 : 0,
  }
})

// ==========================================
// OPEN / CLOSE DRAWER
// ==========================================

const openMobileMenu = () => {
  mobileMenuOpen.value = true
  dragOffset.value = 0
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
  dragOffset.value = 0
}

// ==========================================
// TOUCH START
// ==========================================

const startDrawerDrag = (event: TouchEvent) => {
  if (!event.touches.length) return

  const touchX = event.touches[0].clientX

  startX.value = touchX
  currentX.value = touchX

  if (!mobileMenuOpen.value) {
    if (touchX > 28) return

    isEdgeSwipe.value = true
  } else {
    isEdgeSwipe.value = true
  }

  isDragging.value = true
}

// ==========================================
// TOUCH MOVE
// ==========================================

const moveDrawerDrag = (event: TouchEvent) => {
  if (!isDragging.value || !event.touches.length) return

  currentX.value = event.touches[0].clientX

  const delta = currentX.value - startX.value

  if (mobileMenuOpen.value) {
    dragOffset.value = Math.min(0, delta)
  } else {
    dragOffset.value = Math.max(0, delta)
  }
}

// ==========================================
// TOUCH END
// ==========================================

const endDrawerDrag = () => {
  if (!isDragging.value) return

  const delta = currentX.value - startX.value

  isDragging.value = false

  if (mobileMenuOpen.value) {
    if (delta < -drawerWidth * 0.3) {
      closeMobileMenu()
    } else {
      openMobileMenu()
    }
  } else {
    if (delta > drawerWidth * 0.25) {
      openMobileMenu()
    } else {
      closeMobileMenu()
    }
  }

  isEdgeSwipe.value = false
  dragOffset.value = 0
}

// ==========================================
// MENU ACTION
// ==========================================

const handleMenuClick = (item: any) => {
  closeMobileMenu()

  console.log("Selected:", item.label)

  // Generic event containing the complete menu item
  emit("navigate", item)

  // Specific events for easier parent connection
  switch (item.route) {
    case "dashboard":
      emit("dashboard")
      break

    case "dictionary":
      emit("dictionary")
      break

    case "bookmarks":
      emit("bookmarks")
      break

    case "leaderboard":
      emit("leaderboard")
      break
  }
}
</script>
<template>
  <div>  <!-- ========================================= -->
  <!-- MOBILE DRAWER -->
  <!-- ========================================= -->

  <div
    class="fixed mt-5 inset-0 z-[100] md:hidden"
    :class="
      mobileMenuOpen || isDragging
        ? 'visible'
        : 'invisible pointer-events-none'
    "
    @touchstart="startDrawerDrag"
    @touchmove.prevent="moveDrawerDrag"
    @touchend="endDrawerDrag"
  >
    <!-- OVERLAY -->
    <div
      class="absolute inset-0 bg-black transition-opacity duration-200"
      :style="overlayStyle"
      @click="closeMobileMenu"
    ></div>

    <!-- DRAWER -->
    <aside
      class="relative  flex h-full w-[280px] max-w-[85vw] flex-col bg-[#071936] text-white shadow-2xl"
      :style="drawerStyle"
    >
      <!-- DRAWER HEADER -->
      <div
        class="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-5 pt-[env(safe-area-inset-top)]"
      >
        <div class="flex items-center gap-2">
          <div
            class="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600"
          >
            <Icon name="lucide:graduation-cap" class="text-xl" />
          </div>

          <div>
            <p class="text-sm font-bold">ExamTips</p>
            <p class="text-[10px] text-slate-400">
              Student Portal
            </p>
          </div>
        </div>

        <button
          type="button"
          aria-label="Close menu"
          class="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white/10 active:scale-95"
          @click="closeMobileMenu"
        >
          <Icon name="lucide:x" class="text-xl" />
        </button>
      </div>

      <!-- DRAWER NAVIGATION -->
      <nav class="flex flex-col gap-2 p-4">
        <button
          v-for="item in menuItems"
          :key="item.label"
          type="button"
          class="flex w-full items-center gap-4 rounded-xl px-4 py-4 text-left text-sm font-semibold transition-all duration-200 hover:bg-white/10 active:scale-[0.98]"
          :class="
            item.active
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
              : 'text-slate-300'
          "
          @click="handleMenuClick(item)"
        >
          <Icon :name="item.icon" class="text-xl" />

          <span>{{ item.mobileLabel }}</span>

          <Icon
            name="lucide:chevron-right"
            class="ml-auto text-white/40"
          />
        </button>
      </nav>

      <!-- DRAWER FOOTER -->
      <div class="mt-auto border-t border-white/10 p-5">
        <div class="flex items-center gap-3">
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600"
          >
            <Icon name="lucide:user-round" />
          </div>

          <div class="min-w-0">
            <p class="truncate text-sm font-semibold">
              {{ currentUser.firstName || "Student" }}
            </p>

            <p class="text-xs capitalize text-blue-400">
              {{ currentUser.role || "Student" }}
            </p>
          </div>
        </div>
      </div>

      <!-- DRAG HANDLE -->
      <div
        class="absolute right-2 top-1/2 h-16 w-1 -translate-y-1/2 rounded-full bg-white/20"
      ></div>
    </aside>
  </div>

  <!-- ========================================= -->
  <!-- MAIN HEADER -->
  <!-- ========================================= -->
<div>
<header
  class="sm:fixed relative inset-x-0 top-0 z-50 w-full bg-[#071936]  text-white sm:shadow-lg"
>
    <!-- TOP MENU - DESKTOP ONLY -->
    <div
      class="hidden h-8 items-center gap-6 border-b border-white/10 px-4 text-xs font-medium sm:flex sm:px-6 lg:px-8"
    >
      <button class="transition hover:text-blue-400">
        File
      </button>

      <button class="transition hover:text-blue-400">
        Product
      </button>

      <button class="transition hover:text-blue-400">
        Help
      </button>

      <button class="transition hover:text-blue-400">
        Web Resources
      </button>

      <button class="transition hover:text-blue-400">
        Guardian
      </button>
    </div>

    <!-- MAIN HEADER -->
    <div
      class="flex min-h-[60px] p items-center gap-2 px-2 sm:min-h-[64px] sm:gap-4 sm:px-6 lg:px-8"
    >
      <!-- MOBILE HAMBURGER -->
      <button
        type="button"
        aria-label="Open navigation menu"
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition hover:bg-white/10 active:scale-95 md:hidden"
        @click="openMobileMenu"
      >
        <Icon name="lucide:menu" class="text-2xl" />
      </button>

      <!-- MOBILE BRAND -->
      <div class="flex min-w-0  items-center gap-2 md:hidden">
        <div
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600"
        >
          <Icon name="lucide:graduation-cap" class="text-lg" />
        </div>

        <span class="truncate text-sm font-bold">
          ExamTips
        </span>
      </div>

      <!-- DESKTOP NAVIGATION -->
      <nav
        class="hidden min-w-0 flex-1 items-center justify-start gap-1 md:flex sm:gap-2"
      >
        <button
          v-for="item in menuItems"
          :key="item.label"
          type="button"
          :aria-label="item.label"
          class="group relative flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-center transition-all duration-200"
          :class="
            item.active
              ? 'bgue-600 text-white shadow- hadow-blue-600/20'
              : 'text-slate-300 hover:bg-white/10 hover:text-white'
          "
          @click="handleMenuClick(item)"
        >
          <Icon
            :name="item.icon"
            class="h-5 w-5 shrink-0 transition-transform group-hover:scale-110"
          />

          <span class="text-xs font-semibold lg:text-sm">
            {{ item.label }}
          </span>

          <span
            v-if="item.active"
            class="absolute -bottom-1 left-1/2 hidden h-1 w-6 -translate-x-1/2 rounded-full bg-blue-400 sm:block"
          ></span>
        </button>
      </nav>

      <!-- MOBILE SPACER -->
      <div class="flex-1 md:hidden"></div>

      <!-- RIGHT SECTION -->
      <div class="flex shrink-0 items-center gap-1 sm:gap-3">
        <!-- NOTIFICATION -->
        <button
          type="button"
          aria-label="Notifications"
          class="relative flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/10 sm:h-10 sm:w-10"
        >
          <Icon name="lucide:bell" class="h-5 w-5 sm:h-6 sm:w-6" />

          <span
            class="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white sm:h-5 sm:min-w-5 sm:text-[10px]"
          >
            2
          </span>
        </button>

        <!-- DIVIDER -->
        <div class="hidden h-8 w-px bg-white/10 sm:block"></div>

        <!-- USER -->
        <button
          type="button"
          aria-label="Open user menu"
          class="flex items-center gap-1 rounded-lg px-1 py-1.5 transition hover:bg-white/10 sm:gap-2 sm:px-2"
        >
          <!-- AVATAR -->
          <div
            class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 sm:h-9 sm:w-9"
          >
            <Icon name="lucide:user-round" class="h-4 w-4 sm:h-5 sm:w-5" />
          </div>

          <!-- USER DETAILS -->
          <div class="hidden text-left md:block">
            <p class="max-w-[100px] truncate text-sm font-semibold capitalize">
              {{ currentUser.firstName || "Student" }}
            </p>

            <p class="text-[10px] capitalize text-blue-400 lg:text-xs">
              {{ currentUser.role || "Student" }}
            </p>
          </div>

          <Icon
            name="lucide:chevron-down"
            class="hidden h-4 w-4 text-slate-400 sm:block"
          />
        </button>
      </div>
    </div>
  </header>

</div>
</div>
</template>

<style scoped>
@reference "tailwindcss";

/* Prevent accidental selection during dragging */
aside {
  will-change: transform;
  touch-action: pan-y;
}

/* Smooth drawer rendering */
.drawer {
  backface-visibility: hidden;
  transform: translateZ(0);
}
</style>