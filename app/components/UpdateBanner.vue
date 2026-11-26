<script setup lang="ts">
const { state, startDownload, install } = useAppUpdate();
</script>

<template>
  <div
    v-if="state.phase !== 'idle'"
    class="fixed inset-x-3 bottom-4 z-[100] rounded-2xl bg-[#1F319D] p-4 text-white shadow-lg"
  >
    <!-- Downloading in the background -->
    <div v-if="state.phase === 'downloading'">
      <p class="text-sm font-semibold">
        Downloading update{{ state.latest ? ` ${state.latest.versionName}` : "" }}…
      </p>
      <div class="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/30">
        <div
          class="h-full rounded-full bg-white transition-all"
          :style="{ width: state.progress + '%' }"
        />
      </div>
      <p class="mt-1 text-xs opacity-80">
        You can keep using the app. {{ state.progress }}%
      </p>
    </div>

    <!-- Ready to install -->
    <div v-else-if="state.phase === 'ready'" class="flex items-center gap-3">
      <div class="flex-1">
        <p class="text-sm font-semibold">Update ready</p>
        <p v-if="state.latest?.notes" class="text-xs opacity-80">
          {{ state.latest.notes }}
        </p>
      </div>
      <button
        class="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#1F319D]"
        @click="install"
      >
        Install
      </button>
    </div>

    <!-- Failed -->
    <div v-else-if="state.phase === 'failed'" class="flex items-center gap-3">
      <p class="flex-1 text-sm font-semibold">Update download failed.</p>
      <button
        class="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#1F319D]"
        @click="startDownload"
      >
        Retry
      </button>
    </div>
  </div>
</template>
