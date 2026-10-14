<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";

const slides = [
  {
    image: "/images/earnmoney.webp",
    tag: "JAMB PREPARATION",
    title: "Prepare for JAMB with Confidence",
    description:
      "Practice thousands of questions and improve your exam performance.",
  },
  {
    image: "/images/th.jfif",
    tag: "WAEC EXAMINATION",
    title: "Master Your WAEC Subjects",
    description:
      "Learn smarter with expert lessons and practice tests.",
  },
  {
    image: "/images/01-min.webp",
    tag: "YOUR SUCCESS",
    title: "Every Question Takes You Closer",
    description:
      "Build confidence, sharpen your skills, and achieve your academic goals.",
  },
];

const currentSlide = ref(0);
const isPaused = ref(false);

let autoplayTimer: ReturnType<typeof setInterval> | null = null;

const nextSlide = () => {
  currentSlide.value =
    (currentSlide.value + 1) % slides.length;
};

const previousSlide = () => {
  currentSlide.value =
    (currentSlide.value - 1 + slides.length) % slides.length;
};

const goToSlide = (index: number) => {
  currentSlide.value = index;
};

const startAutoplay = () => {
  stopAutoplay();

  autoplayTimer = setInterval(() => {
    if (!isPaused.value) {
      nextSlide();
    }
  }, 5000);
};

const stopAutoplay = () => {
  if (autoplayTimer) {
    clearInterval(autoplayTimer);
    autoplayTimer = null;
  }
};

onMounted(startAutoplay);

onBeforeUnmount(stopAutoplay);
</script>

<template>
  <!-- CAROUSEL CONTAINER -->
  <section
    class="group relative sm:h-full min-h-0 w-full overflow-hidden rounded-xl bg-slate-950 shadow-sm"
    @mouseenter="isPaused = true"
    @mouseleave="isPaused = false"
  >
    <!-- SLIDES -->
    <TransitionGroup name="carousel-fade">
      <div
        v-for="(slide, index) in slides"
        v-show="currentSlide === index"
        :key="index"
        class="absolute inset-0 h-full w-full"
      >
        <!-- Background Image -->
        <img
          :src="slide.image"
          :alt="slide.title"
          class="carousel-image absolute inset-0 h-full w-full object-cover"
        />

        <!-- Dark Overlay -->
        <div
          class="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10"
        ></div>

        <!-- Side Shade -->
        <div
          class="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent"
        ></div>

        <!-- Main Content -->
        <div
          class="absolute inset-0 flex items-end p-4 pb-12 sm:p-6 sm:pb-14 lg:p-8 lg:pb-16"
        >
          <div class="max-w-xl text-white">
            <!-- Tag -->
            <div class="mb-2 flex items-center gap-2 sm:mb-3">
              <span class="h-1 w-6 rounded-full bg-blue-500"></span>

              <span
                class="text-[9px] font-bold uppercase tracking-[0.15em] text-blue-300 sm:text-xs"
              >
                {{ slide.tag }}
              </span>
            </div>

            <!-- Title -->
            <h2
              class="max-w-lg text-lg font-black leading-[1.15] tracking-tight sm:text-2xl lg:text-2xl"
            >
              {{ slide.title }}
            </h2>

            <!-- Description -->
            <p
              class="mt-2 max-w-md text-[11px] leading-relaxed text-white/75 sm:mt-3 sm:text-sm"
            >
              {{ slide.description }}
            </p>
          </div>
        </div>
      </div>
    </TransitionGroup>

    <!-- SLIDE COUNTER -->
    <div
      class="absolute right-3 top-3 z-20 rounded-full border border-white/20 bg-black/30 px-3 py-1.5 text-[10px] font-semibold text-white backdrop-blur-md sm:right-6 sm:top-6 sm:text-xs"
    >
      <span class="text-white">
        {{ String(currentSlide + 1).padStart(2, "0") }}
      </span>

      <span class="mx-1 text-white/40">/</span>

      <span class="text-white/50">
        {{ String(slides.length).padStart(2, "0") }}
      </span>
    </div>

    <!-- NAVIGATION CONTROLS -->
    <div
      class="absolute bottom-4 right-3 z-20 flex items-center gap-2 sm:bottom-6 sm:right-6 sm:gap-3"
    >
      <!-- Previous -->
      <button
        type="button"
        aria-label="Previous slide"
        @click="previousSlide"
        class="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/25 sm:h-10 sm:w-10"
      >
        <Icon
          name="lucide:arrow-left"
          class="h-4 w-4"
        />
      </button>

      <!-- Dots -->
      <div class="flex items-center gap-1.5">
        <button
          v-for="(_, index) in slides"
          :key="index"
          type="button"
          :aria-label="`Go to slide ${index + 1}`"
          @click="goToSlide(index)"
          class="h-1.5 rounded-full transition-all duration-300"
          :class="
            currentSlide === index
              ? 'w-6 bg-blue-500'
              : 'w-1.5 bg-white/40 hover:bg-white'
          "
        ></button>
      </div>

      <!-- Next -->
      <button
        type="button"
        aria-label="Next slide"
        @click="nextSlide"
        class="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/25 sm:h-10 sm:w-10"
      >
        <Icon
          name="lucide:arrow-right"
          class="h-4 w-4"
        />
      </button>
    </div>

    <!-- PROGRESS LINE -->
    <div
      class="absolute bottom-0 left-0 h-0.5 bg-blue-500 transition-all duration-500"
      :style="{
        width: `${((currentSlide + 1) / slides.length) * 100}%`,
      }"
    ></div>
  </section>
</template>

<style scoped>
.carousel-fade-enter-active,
.carousel-fade-leave-active {
  transition: opacity 0.7s ease;
}

.carousel-fade-enter-from,
.carousel-fade-leave-to {
  opacity: 0;
}

.carousel-image {
  animation: subtle-zoom 6s ease-out both;
}

@keyframes subtle-zoom {
  from {
    transform: scale(1);
  }

  to {
    transform: scale(1.06);
  }
}
</style>