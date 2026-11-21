<template>
  <div
    class="relative flex h-[100dvh] min-h-0 w-full flex-col overflow-hidden bg-[#F3F8FF] text-[#0B2F6B] font-['Inter',system-ui,sans-serif]"
  >
    <!-- DECORATIVE BACKGROUND (non-interactive) -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <Icon name="lucide:book-open" class="absolute right-[-10px] top-[140px] h-14 w-14 rotate-12 text-blue-200/60" />
      <Icon name="lucide:flask-conical" class="absolute bottom-[110px] left-3 h-10 w-10 -rotate-12 text-blue-200/60" />
      <Icon name="lucide:pencil" class="absolute bottom-[130px] right-4 h-12 w-12 text-blue-200/60" />
      <Icon name="lucide:atom" class="absolute bottom-16 left-5 h-12 w-12 text-blue-200/60" />
    </div>

    <!-- APP BAR -->
    <header class="relative z-10 shrink-0 bg-[#0B2F6B] text-white">
      <div class="mx-auto flex min-h-16 w-full max-w-5xl items-center gap-3 px-3 py-2 sm:px-4 md:px-8">
        <span
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0A6CFF] shadow-[0_4px_10px_rgba(10,108,255,0.45)]"
        >
          <Icon name="lucide:graduation-cap" class="h-5 w-5" />
        </span>

        <div class="min-w-0">
          <h1 class="truncate text-sm font-bold leading-tight tracking-tight sm:text-[15px]">
            Examtips
          </h1>
          <p class="mt-0.5 truncate text-[10px] leading-tight text-white/65 sm:text-[11px]">
            Get your exam answers with your PIN
          </p>
        </div>
      </div>
    </header>

    <!-- MAIN -->
    <main
      class="relative z-10 flex min-h-0 flex-1 items-center justify-center overflow-y-auto overscroll-contain px-3 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-4 sm:px-4 md:px-8"
    >
      <section
        class="w-full max-w-md rounded-3xl bg-white p-5 shadow-[0_8px_24px_rgba(20,49,109,0.07)] ring-1 ring-blue-50 sm:p-8"
      >
        <!-- INTRO -->
        <div class="mb-6 text-center">
          <div
            class="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600"
          >
            <Icon name="lucide:key-round" class="h-7 w-7" />
          </div>

          <h2 class="text-base font-bold text-[#0B2F6B] sm:text-xl">
            Get Your Answers
          </h2>

          <p class="mt-1 text-[11px] leading-5 text-slate-500 sm:text-sm">
            Enter your PIN below to continue.
          </p>
        </div>

        <form
          action="https://answer.runslink.com"
          method="post"
          @submit="onSubmit"
        >
          <!-- PIN -->
          <div class="mb-5">
            <label
              for="pin"
              class="mb-1.5 block text-[11px] font-bold text-[#0B2F6B] sm:text-sm"
            >
              Your PIN
              <span class="text-[#0A6CFF]">*</span>
            </label>

            <div
              class="flex h-14 w-full items-center gap-2 rounded-2xl border bg-white px-4 transition focus-within:border-[#0A6CFF] focus-within:ring-2 focus-within:ring-[#0A6CFF]/20"
              :class="error ? 'border-[#0B2F6B] bg-slate-50' : 'border-blue-100'"
            >
              <Icon name="lucide:lock-keyhole" class="h-5 w-5 shrink-0 text-[#0A6CFF]" />

              <input
                id="pin"
                v-model.trim="pin"
                name="pin"
                type="text"
                placeholder="Enter your PIN here"
                autocomplete="off"
                class="w-full min-w-0 border-0 bg-transparent font-mono text-sm tracking-wider text-[#0B2F6B] outline-none placeholder:font-sans placeholder:tracking-normal placeholder:text-slate-400"
                @input="error = ''"
              />

              <button
                v-if="pin"
                type="button"
                class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#0A6CFF] transition active:scale-90"
                aria-label="Clear PIN"
                @click="pin = ''"
              >
                <Icon name="lucide:x" class="h-4 w-4" />
              </button>
            </div>

            <small
              v-if="error"
              class="mt-1.5 flex items-center gap-1 text-[11px] font-bold text-[#0B2F6B]"
            >
              <Icon name="lucide:circle-alert" class="h-3.5 w-3.5 shrink-0" />
              {{ error }}
            </small>
          </div>

          <!-- SUBMIT -->
          <button
            type="submit"
            name="access"
            value="Get Answers"
            class="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#0A6CFF] px-4 text-sm font-bold text-white shadow-[0_6px_14px_rgba(10,108,255,0.35)] transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
            :disabled="loading"
          >
            <Icon
              :name="loading ? 'lucide:loader-circle' : 'lucide:arrow-right-circle'"
              :class="{ 'animate-spin': loading }"
              class="h-5 w-5"
            />
            {{ loading ? 'Please wait...' : 'Get Answers' }}
          </button>
        </form>

        <p class="mt-5 text-center text-[10px] text-slate-400">
          Powered by Abanise
        </p>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'

useHead({
  title: 'Examtips | Get Your Answers',
  meta: [
    { name: 'description', content: 'Enter your PIN to get your exam answers.' },
    { name: 'theme-color', content: '#0B2F6B' }
  ]
})

const pin = ref('')
const error = ref('')
const loading = ref(false)

const onSubmit = (event) => {
  if (!pin.value) {
    event.preventDefault()
    error.value = 'Please enter your PIN.'
    return
  }

  // Valid: let the browser post the form to answer.runslink.com
  loading.value = true
}
</script>