<template>
  <Teleport to="body">
    <Transition name="bookmark-fade">
      <div
        v-if="visible"
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4 py-5 backdrop-blur-sm sm:px-6"
        @click.self="closeModal"
      >
        <section
          class="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl sm:rounded-2xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="bookmark-title"
        >
          <!-- HEADER -->
          <header
            class="flex min-h-12 items-center justify-between bg-[#24304a] px-3 py-2 text-white sm:px-4"
          >
            <!-- Balances the close button -->
            <div class="h-9 w-9"></div>

            <h2
              id="bookmark-title"
              class="flex-1 text-center text-base font-medium tracking-wide sm:text-lg"
            >
              Bookmarks
            </h2>

            <button
              type="button"
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 active:scale-95"
              aria-label="Close bookmark message"
              @click="closeModal"
            >
              <Icon name="lucide:x" class="text-lg sm:text-xl" />
            </button>
          </header>

          <!-- BODY -->
          <div
            class="flex min-h-[13rem] flex-col items-center justify-center bg-white px-4 py-8 text-center sm:min-h-[14rem] sm:px-7"
          >
            <!-- QUESTION MESSAGE -->
            <p
              class="w-full break-words text-sm leading-6 text-slate-600 sm:text-base sm:leading-7"
            >
              Question:

              <strong class="font-semibold text-[#24304a]">
                {{ questionLabel }}
              </strong>
            </p>

            <!-- SUCCESS MESSAGE -->
            <div
              class="mt-4 flex max-w-full items-center justify-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-center text-xs font-medium text-emerald-700 sm:text-sm"
            >
              <Icon
                name="lucide:check-circle"
                class="shrink-0 text-base sm:text-lg"
              />

              <span>Successfully bookmarked!</span>
            </div>
          </div>

          <!-- FOOTER -->
          <footer
            class="flex justify-center bg-[#24304a] px-4 py-3 sm:justify-end sm:px-5"
          >
            <button
              type="button"
              class="flex min-h-10 h-10 w-20  items-center justify-center rounded-lg bg-[#b9873b] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#a47632] focus:outline-none focus:ring-2 focus:ring-[#b9873b] focus:ring-offset-2 active:scale-[0.98] sm:w-auto sm:min-w-28"
              @click="closeModal"
            >
              Close
            </button>
          </footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },

  question: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["close","gohome"]);
const questionLabel = computed(() => {
  const question = props.question || {};

  const parts = [
    question.examType,
    question.subject,
    question.year,
    question.questionNumber ?? question.number,
  ].filter(
    (value) => value !== undefined && value !== null && value !== "",
  );

  return parts.length ? parts.join(" > ") : "Selected question";
});

const closeModal = () => {
  emit("close");
};
</script>

<style scoped>
.bookmark-fade-enter-active,
.bookmark-fade-leave-active {
  transition: opacity 0.2s ease;
}

.bookmark-fade-enter-active section,
.bookmark-fade-leave-active section {
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}

.bookmark-fade-enter-from,
.bookmark-fade-leave-to {
  opacity: 0;
}

.bookmark-fade-enter-from section,
.bookmark-fade-leave-to section {
  opacity: 0;
  transform: translateY(12px) scale(0.96);
}

@media (prefers-reduced-motion: reduce) {
  .bookmark-fade-enter-active,
  .bookmark-fade-leave-active,
  .bookmark-fade-enter-active section,
  .bookmark-fade-leave-active section {
    transition: none;
  }
}
</style>