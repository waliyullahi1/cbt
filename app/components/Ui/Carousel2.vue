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
    image: "/images/earnmoney.webp",
    tag: "YOUR SUCCESS",
    title: "Every Question Takes You Closer",
    description:
      "Build confidence, sharpen your skills, and achieve your academic goals.",
  },
];

const currentSlide = ref(0);
const isPaused = ref(false);
const direction = ref<"next" | "prev">("next");

let autoplayTimer: ReturnType<typeof setInterval> | null = null;

const nextSlide = () => {
  direction.value = "next";
  currentSlide.value =
    (currentSlide.value + 1) % slides.length;
};

const previousSlide = () => {
  direction.value = "prev";
  currentSlide.value =
    (currentSlide.value - 1 + slides.length) % slides.length;
};

const goToSlide = (index: number) => {
  if (index === currentSlide.value) return;

  direction.value =
    index > currentSlide.value ? "next" : "prev";

  currentSlide.value = index;
};

const startAutoplay = () => {
  stopAutoplay();

  autoplayTimer = setInterval(() => {
    if (!isPaused.value) {
      nextSlide();
    }
  }, 6000);
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
<section
  class="carousel group relative h-[150px] w-full overflow-hidden rounded-xl bg-slate-950 shadow-sm"
  @mouseenter="isPaused = true"
  @mouseleave="isPaused = false"
>
    <!-- SLIDES -->
    <Transition
      :name="direction === 'next' ? 'slide-next' : 'slide-prev'"
      mode="out-in"
    >
      <div
        :key="currentSlide"
        class="absolute inset-0 h-full w-full"
      >
        <!-- BACKGROUND IMAGE -->
        <img
          :src="slides[currentSlide].image"
          :alt="slides[currentSlide].title"
          class="absolute inset-0 h-full w-full object-cover object-center"
        />

        <!-- DARK OVERLAY -->
        <div
          class="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/15"
        ></div>

        <div
          class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"
        ></div>

        <!-- CONTENT -->
        <div
          class="relative z-10 flex h-full w-full items-center px-4 pb-16 pt-5 sm:px-7 sm:pb-20 sm:pt-8 lg:px-10"
        >
          <div
            class="carousel-content w-full max-w-[90%] text-white sm:max-w-lg lg:max-w-xl"
          >
            <!-- TAG -->
            <div class="mb-2 flex items-center gap-2 sm:mb-4">
              <span
                class="h-1 w-5 rounded-full bg-blue-500 sm:w-8"
              ></span>

              <span
                class="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-300 sm:text-xs sm:tracking-[0.2em]"
              >
                {{ slides[currentSlide].tag }}
              </span>
            </div>

            <!-- TITLE -->
            <h2
              class="text-base font-black leading-tight tracking-tight sm:text-2xl lg:text-4xl"
            >
              {{ slides[currentSlide].title }}
            </h2>

            <!-- DESCRIPTION -->
            <p
              class="mt-2 max-w-sm text-[10px] leading-relaxed text-white/75 sm:mt-4 sm:text-sm lg:text-base"
            >
              {{ slides[currentSlide].description }}
            </p>

            <!-- DECORATIVE LINE -->
            <div
              class="mt-3 h-0.5 w-8 rounded-full bg-blue-500 sm:mt-6 sm:h-1 sm:w-12"
            ></div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- COUNTER -->
    <div
      class="absolute right-3 top-3 z-20 rounded-full border border-white/20 bg-black/25 px-2 py-1 text-[9px] font-semibold text-white backdrop-blur-md sm:right-6 sm:top-5 sm:px-3 sm:py-1.5 sm:text-xs"
    >
      {{ String(currentSlide + 1).padStart(2, "0") }}

      <span class="mx-1 text-white/40">/</span>

      <span class="text-white/50">
        {{ String(slides.length).padStart(2, "0") }}
      </span>
    </div>

    <!-- NAVIGATION -->
    <div
      class="absolute bottom-3 right-3 z-20 flex items-center gap-2 sm:bottom-5 sm:right-6 sm:gap-3"
    >
      <!-- PREVIOUS -->
      <button
        type="button"
        aria-label="Previous slide"
        class="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/25 sm:h-9 sm:w-9"
        @click="previousSlide"
      >
        <Icon
          name="lucide:arrow-left"
          class="h-3 w-3 sm:h-4 sm:w-4"
        />
      </button>

      <!-- DOTS -->
      <div class="flex items-center gap-1">
        <button
          v-for="(_, index) in slides"
          :key="index"
          type="button"
          :aria-label="`Go to slide ${index + 1}`"
          class="h-1 rounded-full transition-all duration-300 sm:h-1.5"
          :class="
            currentSlide === index
              ? 'w-4 bg-blue-500 sm:w-6'
              : 'w-1 bg-white/40 hover:bg-white sm:w-1.5'
          "
          @click="goToSlide(index)"
        ></button>
      </div>

      <!-- NEXT -->
      <button
        type="button"
        aria-label="Next slide"
        class="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/25 sm:h-9 sm:w-9"
        @click="nextSlide"
      >
        <Icon
          name="lucide:arrow-right"
          class="h-3 w-3 sm:h-4 sm:w-4"
        />
      </button>
    </div>

    <!-- PROGRESS BAR -->
    <div
      class="absolute bottom-0 left-0 h-0.5 bg-blue-500 transition-all duration-700 sm:h-1"
      :style="{
        width: `${((currentSlide + 1) / slides.length) * 100}%`,
      }"
    ></div>
  </section>
</template>

<style scoped>
/* NEXT SLIDE */
.slide-next-enter-active,
.slide-next-leave-active {
  transition:
    transform 0.8s cubic-bezier(0.65, 0, 0.35, 1),
    opacity 0.8s ease;
}

.slide-next-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.slide-next-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

/* PREVIOUS SLIDE */
.slide-prev-enter-active,
.slide-prev-leave-active {
  transition:
    transform 0.8s cubic-bezier(0.65, 0, 0.35, 1),
    opacity 0.8s ease;
}

.slide-prev-enter-from {
  opacity: 0;
  transform: translateX(-100%);
}

.slide-prev-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* TEXT ANIMATION */
.carousel-content {
  animation: content-pop 0.8s
    cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: 0.2s;
}

@keyframes content-pop {
  from {
    opacity: 0;
    transform: translateX(35px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* MOBILE TEXT ANIMATION */
@media (max-width: 640px) {
  .carousel-content {
    animation-name: content-pop-mobile;
  }
}

@keyframes content-pop-mobile {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* REDUCE MOTION FOR ACCESSIBILITY */
@media (prefers-reduced-motion: reduce) {
  .slide-next-enter-active,
  .slide-next-leave-active,
  .slide-prev-enter-active,
  .slide-prev-leave-active,
  .carousel-content {
    animation: none;
    transition: none;
  }
}
</style>