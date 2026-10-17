
<template>
  <div
    class="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white"
    role="progressbar"
    :aria-valuenow="clampedPercent"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-label="`Score ${clampedPercent}%`"
  >
    <svg
      viewBox="0 0 40 40"
      class="h-10 w-10 -rotate-90"
      aria-hidden="true"
    >
      <!-- Background track: visible on white backgrounds -->
      <circle
        cx="20"
        cy="20"
        :r="radius"
        fill="none"
        stroke="currentColor"
        stroke-width="3.5"
        class="text-gray-200"
      />

      <!-- Progress ring -->
      <circle
        cx="20"
        cy="20"
        :r="radius"
        fill="none"
        stroke-width="3.5"
        stroke-linecap="round"
        :stroke="ringColor"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="offset"
        class="transition-[stroke-dashoffset] duration-300"
      />
    </svg>

    <!-- Percentage text -->
    <span
      class="absolute font-mono text-[10px] font-bold tabular-nums"
      :class="textColor"
    >
      {{ clampedPercent }}%
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  percent: {
    type: Number,
    default: 0,
    validator: (value) => Number.isFinite(value),
  },
})

const radius = 16
const circumference = 2 * Math.PI * radius

const clampedPercent = computed(() => {
  const value = Number(props.percent)
  return Number.isFinite(value)
    ? Math.round(Math.min(100, Math.max(0, value)))
    : 0
})

const offset = computed(() => {
  return circumference - (clampedPercent.value / 100) * circumference
})

const ringColor = computed(() => {
  if (clampedPercent.value >= 70) return '#16a34a' // Green
  if (clampedPercent.value >= 40) return '#d97706' // Amber
  if (clampedPercent.value > 0) return '#dc2626' // Red
  return '#d1d5db' // Gray
})

const textColor = computed(() => {
  if (clampedPercent.value >= 70) return 'text-green-700'
  if (clampedPercent.value >= 40) return 'text-amber-700'
  if (clampedPercent.value > 0) return 'text-red-700'
  return 'text-gray-500'
})
</script>
