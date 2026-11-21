<template>
  <div
    class="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-[#F3F8FF] text-[#0B2F6B] font-['Inter',system-ui,sans-serif]"
  >
    <!-- Decorative background -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <Icon name="lucide:book-open" class="absolute right-[-10px] top-[300px] h-14 w-14 rotate-12 text-blue-200/60" />
      <Icon name="lucide:flask-conical" class="absolute bottom-[110px] left-3 h-10 w-10 -rotate-12 text-blue-200/60" />
      <Icon name="lucide:pencil" class="absolute bottom-[130px] right-4 h-12 w-12 text-blue-200/60" />
      <Icon name="lucide:atom" class="absolute bottom-6 left-5 h-12 w-12 text-blue-200/60" />
    </div>

    <!-- App bar -->
    <header class="relative z-10 shrink-0 bg-[#0B2F6B] text-white">
      <div class="mx-auto flex min-h-16 w-full max-w-5xl items-center justify-between gap-3 px-3 py-2 sm:px-4 md:px-8">
        <div class="flex min-w-0 items-center gap-3">
          <span
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0A6CFF] shadow-[0_4px_10px_rgba(10,108,255,0.45)]"
          >
            <Icon name="lucide:store" class="h-5 w-5" />
          </span>

          <div class="min-w-0">
            <h1 class="truncate text-sm font-bold leading-tight sm:text-[15px]">
              Teach Marketplace
            </h1>
            <p class="mt-0.5 truncate text-[10px] leading-tight text-white/65 sm:text-[11px]">
              Coming soon
            </p>
          </div>
        </div>

        <button
          type="button"
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0A6CFF] shadow-[0_4px_10px_rgba(10,108,255,0.45)] transition hover:brightness-110 active:scale-95"
          aria-label="Go home"
          @click="emit('gohome')"
        >
          <Icon name="lucide:house" class="h-5 w-5" />
        </button>
      </div>
    </header>

    <!-- Content -->
    <main class="relative z-10 flex min-h-0 flex-1 items-center justify-center overflow-y-auto px-4 py-6">
      <section
        class="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-[0_8px_24px_rgba(20,49,109,0.07)] ring-1 ring-blue-50"
      >
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <Icon name="lucide:construction" class="h-8 w-8" />
        </div>

        <h2 class="text-xl font-bold">Under Development</h2>

        <p class="mt-2 text-sm leading-6 text-slate-500">
          The Teach Marketplace is being built. Soon you will be able to find
          teachers and learning resources here. Please check back later.
        </p>

        <button
          type="button"
          class="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#0A6CFF] text-sm font-bold text-white shadow-[0_6px_14px_rgba(10,108,255,0.35)] transition hover:brightness-110 active:scale-[0.98]"
          @click="emit('gohome')"
        >
          <Icon name="lucide:house" class="h-5 w-5" />
          Back to Home
        </button>
      </section>
    </main>
  </div>
</template>

<script setup>
const emit = defineEmits(['gohome'])
</script>