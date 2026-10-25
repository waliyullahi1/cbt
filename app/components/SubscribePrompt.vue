<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-2 backdrop-blur-sm sm:items-center"
        @click.self="close"
      >
        <div
          class="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-2xl"
        >
          <button
            type="button"
            class="absolute"
            style="display: none"
            aria-hidden="true"
          />

          <div
            class="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"
          >
            <Icon name="lucide:crown" class="h-7 w-7" />
          </div>

          <h2 class="text-lg font-medium text-gray-900">{{ title }}</h2>

          <p class="mt-1.5 text-sm leading-5 text-gray-500">
            {{ message }}
          </p>

          <ul class="mt-4 space-y-2 text-left">
            <li
              v-for="perk in perks"
              :key="perk"
              class="flex items-start gap-2 text-sm text-gray-600"
            >
              <Icon
                name="lucide:check-circle"
                class="mt-0.5 h-4 w-4 shrink-0 text-emerald-500"
              />
              {{ perk }}
            </li>
          </ul>

          <button
            type="button"
            class="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-medium text-white shadow-sm transition active:brightness-110"
            @click="subscribe"
          >
            <Icon name="lucide:sparkles" class="h-4 w-4" />
            {{ buttonText }}
          </button>

          <button
            type="button"
            class="mt-2 w-full rounded-xl py-2.5 text-sm font-medium text-gray-500 transition active:bg-gray-100"
            @click="dismiss"
          >
            {{ dismissText }}
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: "Subscribe to unlock more" },
  message: {
    type: String,
    default: "Please click the button below to subscribe and get full access.",
  },
  perks: {
    type: Array,
    default: () => [
      "All past years' questions",
      "Questions spread across every topic",
      "Choose the topics you want to practice",
    ],
  },
  buttonText: { type: String, default: "Subscribe Now" },
  dismissText: { type: String, default: "Maybe later" },
  // Page to open when the button is clicked. Leave empty to handle it yourself.
  to: { type: String, default: "/subscribe" },
});

const emit = defineEmits(["update:modelValue", "subscribe", "dismiss"]);

const close = () => emit("update:modelValue", false);

const dismiss = () => {
  emit("dismiss");
  close();
};

const subscribe = async () => {
  emit("subscribe");
  close();

  if (props.to) {
    await navigateTo(props.to);
  }
};
</script>

<style scoped>
.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.2s ease;
}
.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}
</style> 