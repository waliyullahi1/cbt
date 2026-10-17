<template>
  <div class="min-h-0 w-full bg-[#F3F7FE] text-[#0A2A66]">
    <!-- ====================================================== -->
    <!-- HEADER (phones only) -->
    <!-- ====================================================== -->
    <header class="flex h-16 items-center gap-3 bg-[#0A2A66] px-4 text-white sm:hidden">
      <button
        type="button"
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg active:bg-white/10"
        aria-label="Go home"
        @click="goHome"
      >
        <Icon name="lucide:arrow-left" class="h-6 w-6" />
      </button>

      <div class="flex min-w-0 flex-1 items-center gap-2.5">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1A66F5]"
        >
          <Icon name="lucide:graduation-cap" class="h-6 w-6" />
        </div>
        <span class="truncate text-xl font-bold tracking-tight">ExamTips</span>
      </div>

      <button
        type="button"
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full active:bg-white/10"
        aria-label="Notifications"
      >
        <Icon name="lucide:bell" class="h-6 w-6" />
      </button>

      <button
        type="button"
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1A66F5]"
        aria-label="Profile"
      >
        <Icon name="lucide:user" class="h-5 w-5" />
      </button>
    </header>

    <!-- ====================================================== -->
    <!-- CONTENT -->
    <!-- ====================================================== -->
    <div class="mx-auto w-full max-w-5xl px-3 pb-6 pt-3 sm:px-5 sm:pt-5">
      <!-- Desktop top row -->
      <div class="mb-3 hidden items-center justify-between sm:flex">
        <p class="text-sm font-semibold text-[#5B6E8F]">Practice for UTME</p>

        <button
          type="button"
          class="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-[#0A2A66] transition hover:bg-slate-50 active:scale-95"
          @click="goHome"
        >
          <Icon name="lucide:house" class="h-4 w-4" />
          Home
        </button>
      </div>

      <!-- HERO BANNER -->
      <section
        class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0A2A66] to-[#0E47A8] p-4 text-white shadow-[0_8px_20px_rgba(10,42,102,0.25)] sm:p-6"
      >
        <div class="relative z-10 max-w-[64%] sm:max-w-[58%]">
          <h1 class="text-2xl font-bold leading-tight sm:text-3xl">
            Chooseggg your subjects,
          </h1>

          <p class="mt-1 text-[14px] leading-snug text-white/90 sm:mt-2 sm:text-base">
            customize your practice, and prepare for success.
          </p>

          <button
            type="button"
            class="mt-1 flex items-center gap-2 rounded-full bg-[#0B63F6] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition active:scale-95 sm:mt-5 sm:px-6 sm:py-3 sm:text-base"
            @click="openSubjectModal"
          >
            <Icon name="lucide:plus" class="h-4 w-4 sm:h-5 sm:w-5" />
            Select Subjects
          </button>
        </div>

        <!-- Illustration: graduation cap on books -->
        <svg
          class="pointer-events-none absolute right-2 top-1/2 h-28 w-32 -translate-y-1/2 sm:right-10 sm:h-40 sm:w-52"
          viewBox="0 0 160 130"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="pu-book" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="#4C9AFF" />
              <stop offset="1" stop-color="#1E5EE6" />
            </linearGradient>
          </defs>

          <!-- books -->
          <rect x="24" y="86" width="116" height="26" rx="6" fill="url(#pu-book)" />
          <rect x="72" y="92" width="62" height="14" rx="4" fill="#fff" />
          <rect x="36" y="62" width="108" height="26" rx="6" fill="url(#pu-book)" />
          <rect x="84" y="68" width="54" height="14" rx="4" fill="#fff" />

          <!-- cap -->
          <rect x="68" y="44" width="44" height="22" rx="8" fill="#1E5EE6" />
          <polygon points="90,14 142,34 90,54 38,34" fill="#4C9AFF" />
          <path
            d="M90 34 L128 42 L128 58"
            stroke="#FBBF24"
            stroke-width="3"
            fill="none"
            stroke-linecap="round"
          />
          <rect x="125" y="56" width="6" height="12" rx="3" fill="#FBBF24" />

          <!-- sparks -->
          <path
            d="M18 40 L28 46 M14 54 L26 56 M30 28 L36 36"
            stroke="#FBBF24"
            stroke-width="3"
            stroke-linecap="round"
          />
        </svg>
      </section>

      <!-- QUICK SUMMARY -->
      <section class="mt-3 grid grid-cols-2 gap-3 sm:mt-4 sm:gap-4">
        <div
          class="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/80 p-3 sm:p-4"
        >
          <span
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#DCE9FF] text-[#1A66F5] sm:h-12 sm:w-12"
          >
            <Icon name="lucide:layers" class="h-5 w-5 sm:h-6 sm:w-6" />
          </span>

          <div class="min-w-0">
            <p class="text-xs text-[#5B6E8F] sm:text-sm">Selected</p>
            <p class="text-2xl font-bold leading-none text-[#0A2A66] sm:text-3xl">
              {{ selectedSubjects.length }}
            </p>
            <p class="mt-1 text-xs text-[#5B6E8F] sm:text-sm">Subjects</p>
          </div>
        </div>

        <div
          class="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/80 p-3 sm:p-4"
        >
          <span
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#D9F5E5] text-[#1E9E5A] sm:h-12 sm:w-12"
          >
            <Icon name="lucide:file-text" class="h-5 w-5 sm:h-6 sm:w-6" />
          </span>

          <div class="min-w-0">
            <p class="text-xs text-[#5B6E8F] sm:text-sm">Total</p>
            <p class="text-2xl font-bold leading-none text-[#0A2A66] sm:text-3xl">
              {{ totalQuestions }}
            </p>
            <p class="mt-1 text-xs text-[#5B6E8F] sm:text-sm">Questions</p>
          </div>
        </div>
      </section>

      <!-- SECTION TITLE -->
      <section class="mt-5 flex items-start justify-between gap-3">
        <div class="min-w-0">
          <h2 class="text-xl font-bold text-[#0A2A66] sm:text-2xl">
            Your Subjects
          </h2>

          <p class="mt-0.5 text-sm text-[#5B6E8F]">
            Customize each subject before starting.
          </p>
        </div>

        <button
          type="button"
          class="flex shrink-0 items-center gap-1 pt-1 text-[15px] font-semibold text-[#0B63F6]"
          @click="openSubjectModal"
        >
          <Icon name="lucide:plus" class="h-4 w-4" />
          Add
        </button>
      </section>

      <!-- EMPTY STATE -->
      <section
        v-if="filteredSubjects.length === 0"
        class="mt-3 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center"
      >
        <div
          class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#DCE9FF] text-[#1A66F5]"
        >
          <Icon name="lucide:book-open" class="h-6 w-6" />
        </div>

        <h3 class="text-base font-bold text-[#0A2A66]">No subjects found</h3>

        <p class="mt-1 text-sm text-[#5B6E8F]">
          Select a subject or change your search.
        </p>

        <button
          type="button"
          class="mt-4 rounded-full bg-[#0B63F6] px-5 py-2.5 text-sm font-semibold text-white active:scale-95"
          @click="openSubjectModal"
        >
          Select Subject
        </button>
      </section>

      <!-- SUBJECT CARDS -->
      <section v-else class="mt-3 grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
        <article
          v-for="subject in filteredSubjects"
          :key="subject.id"
          class="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_2px_8px_rgba(10,42,102,0.05)]"
        >
          <div class="p-3 sm:p-4">
            <!-- TOP -->
            <div class="flex items-start gap-3">
              <div
                class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl"
                :class="getSubjectColor(subject.id).bg"
              >
                <Icon
                  :name="getSubjectIcon(subject.id)"
                  class="h-7 w-7"
                  :class="getSubjectColor(subject.id).text"
                />
              </div>

              <div class="min-w-0 flex-1">
                <div class="flex items-start justify-between gap-2">
                  <h3
                    class="truncate text-[17px] font-bold leading-tight text-[#0A2A66] sm:text-lg"
                  >
                    {{ subject.name }}
                  </h3>

                  <button
                    type="button"
                    class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                    title="Remove subject"
                    aria-label="Remove subject"
                    @click="removeSubject(subject)"
                  >
                    <Icon name="lucide:x" class="h-5 w-5" />
                  </button>
                </div>

                <div class="mt-2 flex flex-wrap items-center gap-2">
                  <span
                    class="flex items-center gap-1 rounded-md bg-[#DDF7E8] px-2 py-1 text-xs font-semibold text-[#1E9E5A]"
                  >
                    <Icon name="lucide:check-circle" class="h-3.5 w-3.5" />
                    Selected
                  </span>

                  <span
                    class="flex items-center gap-1 text-xs font-medium text-[#5B6E8F]"
                  >
                    <Icon name="lucide:file-text" class="h-3.5 w-3.5" />
                    {{ subject.questions }} Questions
                  </span>
                </div>
              </div>
            </div>

            <!-- YEAR + QUESTIONS -->
            <div class="mt-3 grid grid-cols-2 gap-2.5">
              <div
                class="relative min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2"
              >
                <label
                  :for="`year-${subject.id}`"
                  class="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#5B6E8F]"
                >
                  <Icon name="lucide:calendar-days" class="h-3.5 w-3.5" />
                  Year
                </label>

                <select
                  :id="`year-${subject.id}`"
                  v-model="subject.year"
                  class="mt-0.5 w-full appearance-none bg-transparent pr-6 text-[15px] font-medium text-slate-800 outline-none"
                >
                  <option value="all">All Years</option>

                  <option
                    v-for="year in getSubjectDetails(subject)?.years || []"
                    :key="year"
                    :value="year"
                  >
                    {{ year }}
                  </option>
                </select>

                <Icon
                  name="lucide:chevron-down"
                  class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                />
              </div>

              <div
                class="relative min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2"
              >
                <label
                  :for="`questions-${subject.id}`"
                  class="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#5B6E8F]"
                >
                  <Icon name="lucide:list-ordered" class="h-3.5 w-3.5" />
                  Questions
                </label>

                <select
                  :id="`questions-${subject.id}`"
                  v-model="subject.questions"
                  class="mt-0.5 w-full appearance-none bg-transparent pr-6 text-[15px] font-medium text-slate-800 outline-none"
                >
                  <option
                    v-for="number in subject.questionOptions"
                    :key="number"
                    :value="number"
                  >
                    {{ number }} Questions
                  </option>
                </select>

                <Icon
                  name="lucide:chevron-down"
                  class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                />
              </div>
            </div>

            <!-- TOPICS -->
            <button
              type="button"
              class="mt-2.5 flex w-full items-center justify-between rounded-xl bg-[#EEF4FF] px-3 py-2.5 text-left transition active:bg-[#E3ECFF]"
              @click="openTopicModal(subject)"
            >
              <div class="flex min-w-0 items-center gap-3">
                <Icon
                  name="lucide:folder-open"
                  class="h-6 w-6 shrink-0 text-[#1A66F5]"
                />

                <div class="min-w-0">
                  <p
                    class="text-[11px] font-semibold uppercase tracking-wide text-[#5B6E8F]"
                  >
                    Topics
                  </p>

                  <p class="truncate text-[15px] font-medium text-slate-800">
                    {{ getTopicLabel(subject) }}
                  </p>
                </div>
              </div>

              <span
                class="flex shrink-0 items-center gap-0.5 text-sm font-semibold text-[#0B63F6]"
              >
                Edit
                <Icon name="lucide:chevron-right" class="h-4 w-4" />
              </span>
            </button>
          </div>
        </article>
      </section>

      <!-- EXAM SETTINGS -->
      <section class="mt-4">
        <button
          type="button"
          class="flex w-full items-center justify-between rounded-2xl border border-slate-200/70 bg-white p-3 shadow-[0_2px_8px_rgba(10,42,102,0.05)] sm:p-4"
          @click="showSettings = !showSettings"
        >
          <div class="flex min-w-0 items-center gap-3">
            <span
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#DCE9FF] text-[#1A66F5]"
            >
              <Icon name="lucide:settings-2" class="h-5 w-5" />
            </span>

            <div class="min-w-0 text-left">
              <h3 class="text-[15px] font-bold text-[#0A2A66] sm:text-base">
                Exam Settings
              </h3>

              <p class="mt-0.5 text-xs text-[#5B6E8F] sm:text-sm">
                {{ examModeLabel }} · {{ formatDurationLabel(examDuration) }}
              </p>
            </div>
          </div>

          <Icon
            :name="showSettings ? 'lucide:chevron-up' : 'lucide:chevron-down'"
            class="h-5 w-5 shrink-0 text-slate-400"
          />
        </button>

        <div
          v-if="showSettings"
          class="mt-2 space-y-4 rounded-2xl border border-slate-200/70 bg-white p-3 shadow-[0_2px_8px_rgba(10,42,102,0.05)] sm:p-4"
        >
          <!-- MODE -->
          <div>
            <p class="mb-2 text-sm font-semibold text-[#0A2A66]">
              Examination Mode
            </p>

            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="mode in examModes"
                :key="mode.value"
                type="button"
                class="rounded-xl border px-2 py-2.5 text-sm font-semibold transition"
                :class="
                  examMode === mode.value
                    ? 'border-[#0B63F6] bg-[#0B63F6] text-white'
                    : 'border-slate-200 bg-slate-50 text-[#5B6E8F]'
                "
                @click="examMode = mode.value"
              >
                {{ mode.label }}
              </button>
            </div>
          </div>

          <!-- DURATION -->
          <div>
            <p class="mb-2 text-sm font-semibold text-[#0A2A66]">
              Exam Duration
            </p>

            <div class="grid grid-cols-2 gap-2.5">
              <label
                class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-[#5B6E8F]"
              >
                Hours
                <select
                  v-model.number="examDurationHours"
                  class="mt-0.5 block w-full bg-transparent text-[15px] font-medium normal-case tracking-normal text-slate-800 outline-none"
                >
                  <option v-for="hour in durationHours" :key="hour" :value="hour">
                    {{ String(hour).padStart(2, "0") }} hr
                  </option>
                </select>
              </label>

              <label
                class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-[#5B6E8F]"
              >
                Minutes
                <select
                  v-model.number="examDurationMinutes"
                  class="mt-0.5 block w-full bg-transparent text-[15px] font-medium normal-case tracking-normal text-slate-800 outline-none"
                >
                  <option
                    v-for="minute in durationMinutes"
                    :key="minute"
                    :value="minute"
                  >
                    {{ String(minute).padStart(2, "0") }} min
                  </option>
                </select>
              </label>
            </div>

            <p class="mt-1.5 text-xs text-[#5B6E8F]">
              Duration: {{ formatDurationLabel(examDuration) }}
            </p>
          </div>

          <!-- SHUFFLE QUESTIONS -->
          <label
            class="flex cursor-pointer items-center justify-between gap-3 rounded-xl bg-[#EEF4FF] p-3"
          >
            <div class="flex min-w-0 items-center gap-3">
              <Icon
                name="lucide:shuffle"
                class="h-5 w-5 shrink-0 text-[#1A66F5]"
              />

              <div class="min-w-0">
                <p class="text-sm font-semibold text-[#0A2A66]">
                  Shuffle Questions
                </p>
                <p class="text-xs text-[#5B6E8F]">Randomize question order</p>
              </div>
            </div>

            <input v-model="shuffleQuestions" type="checkbox" class="peer sr-only" />
            <span
              class="relative h-6 w-11 shrink-0 rounded-full bg-slate-300 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-[#0B63F6] peer-checked:after:translate-x-5"
            />
          </label>

          <!-- SHUFFLE OPTIONS -->
          <label
            class="flex cursor-pointer items-center justify-between gap-3 rounded-xl bg-[#EEF4FF] p-3"
          >
            <div class="flex min-w-0 items-center gap-3">
              <Icon
                name="lucide:list-restart"
                class="h-5 w-5 shrink-0 text-[#1E9E5A]"
              />

              <div class="min-w-0">
                <p class="text-sm font-semibold text-[#0A2A66]">
                  Shuffle Options
                </p>
                <p class="text-xs text-[#5B6E8F]">Randomize answer choices</p>
              </div>
            </div>

            <input v-model="shuffleOptions" type="checkbox" class="peer sr-only" />
            <span
              class="relative h-6 w-11 shrink-0 rounded-full bg-slate-300 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-[#0B63F6] peer-checked:after:translate-x-5"
            />
          </label>
        </div>
      </section>

      <!-- ACTION BAR -->
      <div class="mt-5 flex items-center gap-2.5">
        <button
          type="button"
          class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#5B6E8F] transition active:scale-95"
          title="Exam instructions"
          aria-label="Exam instructions"
          @click="openInstructions"
        >
          <Icon name="lucide:info" class="h-5 w-5" />
        </button>

        <button
          type="button"
          :disabled="isStarting"
          class="flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-[#0B63F6] px-4 text-[15px] font-semibold text-white shadow-[0_6px_14px_rgba(11,99,246,0.35)] transition hover:bg-[#0A58DB] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          @click="startExam"
        >
          <Icon
            :name="isStarting ? 'lucide:loader-circle' : 'lucide:play'"
            class="h-5 w-5 shrink-0"
            :class="{ 'animate-spin': isStarting }"
          />

          <span class="truncate">
            {{ isStarting ? "Preparing Exam..." : "Start Exam" }}
          </span>

          <Icon
            v-if="!isStarting"
            name="lucide:arrow-right"
            class="h-5 w-5 shrink-0"
          />
        </button>
      </div>
    </div>

    <!-- ====================================================== -->
    <!-- MODALS -->
    <!-- ====================================================== -->
    <Teleport to="body">
      <!-- INSTRUCTIONS MODAL -->
      <div
        v-if="showInstructions"
        class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 backdrop-blur-sm sm:items-center"
        @click.self="showInstructions = false"
      >
        <div
          class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl"
        >
          <div class="mb-4 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <span
                class="flex h-9 w-9 items-center justify-center rounded-full bg-[#DCE9FF] text-[#1A66F5]"
              >
                <Icon name="lucide:info" class="h-5 w-5" />
              </span>

              <h2 class="text-lg font-bold text-[#0A2A66]">Exam Instructions</h2>
            </div>

            <button
              type="button"
              class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500"
              aria-label="Close"
              @click="showInstructions = false"
            >
              <Icon name="lucide:x" class="h-4 w-4" />
            </button>
          </div>

          <div class="space-y-3">
            <p class="flex items-start gap-2.5 text-sm leading-relaxed text-[#5B6E8F]">
              <Icon
                name="lucide:check-circle"
                class="mt-0.5 h-4 w-4 shrink-0 text-emerald-500"
              />
              Select the subjects you want to practice.
            </p>

            <p class="flex items-start gap-2.5 text-sm leading-relaxed text-[#5B6E8F]">
              <Icon
                name="lucide:calendar-days"
                class="mt-0.5 h-4 w-4 shrink-0 text-[#1A66F5]"
              />
              Choose your preferred year, topics, and question count.
            </p>

            <p class="flex items-start gap-2.5 text-sm leading-relaxed text-[#5B6E8F]">
              <Icon
                name="lucide:clock"
                class="mt-0.5 h-4 w-4 shrink-0 text-orange-500"
              />
              Complete the examination before the timer ends.
            </p>

            <p class="flex items-start gap-2.5 text-sm leading-relaxed text-[#5B6E8F]">
              <Icon
                name="lucide:shuffle"
                class="mt-0.5 h-4 w-4 shrink-0 text-purple-500"
              />
              You can shuffle questions and answer options.
            </p>
          </div>

          <button
            type="button"
            class="mt-5 w-full rounded-xl bg-[#0B63F6] py-3 text-sm font-semibold text-white transition active:scale-[0.98]"
            @click="showInstructions = false"
          >
            Got It
          </button>
        </div>
      </div>
    </Teleport>

    <!-- SUBJECT SELECTOR -->
    <SelectSubject
      v-model="showSubjectModal"
      v-model:modelSubjects="selectedSubjects"
      :subjects="available"
    />

    <!-- TOPIC SELECTOR -->
    <TopicSelector
      v-if="activeSubject"
      v-model="showTopicModal"
      v-model:modelTopics="activeSubject.topics"
      :topics="getSubjectDetails(activeSubject)?.topics || []"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import subjectsdetails from "~/data/subjectdetail.js";
import {
  durationToSeconds,
  formatDurationLabel,
  secondsToDuration,
} from "~/utils/examTime";

const { getQuestions, loadSubjects } = useQuestionSearch();
import {
  getSubjectMeta,
  getSubjectIcon,
  getSubjectColor,
  normalizeSubjectId,
} from "~/utils/subjectMeta";

/*
|--------------------------------------------------------------------------
| Emits & App State
|--------------------------------------------------------------------------
*/

const emit = defineEmits(["gohome"]);
const appState = useAppState();
const available = ref([]);

/*
|--------------------------------------------------------------------------
| UI State
|--------------------------------------------------------------------------
*/

const searchQuery = ref("");
const activeCategory = ref("All");
const showSubjectModal = ref(false);
const showTopicModal = ref(false);
const showInstructions = ref(false);
const showSettings = ref(false);
const activeSubject = ref(null);
const isStarting = ref(false);

/*
|--------------------------------------------------------------------------
| Fetch Subjects
|--------------------------------------------------------------------------
*/

const fetchSubjects = async () => {
  try {
    const result = await loadSubjects();
    available.value = result;
  } catch (error) {
    console.error("Failed to load subjects:", error);
  }
};

/*
|--------------------------------------------------------------------------
| Exam Modes
|--------------------------------------------------------------------------
*/

const examModes = [
  { label: "Practice", value: "practice" },
  { label: "Exam", value: "exam" },
  { label: "Timed", value: "timed" },
];

/*
|--------------------------------------------------------------------------
| Default Questions & Marks
|--------------------------------------------------------------------------
| English Language: 60 questions = 100 marks
| Every other subject: 40 questions = 100 marks
|--------------------------------------------------------------------------
*/

const MARKS_PER_SUBJECT = 100;
const QUESTION_OPTIONS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

const getDefaultQuestions = (id) =>
  normalizeSubjectId(id) === "english-language" ? 60 : 40;

// 100 marks at the default count, scaled if a different count is chosen
const getSubjectMarks = (subject) =>
  Math.round(
    (Number(subject.questions || 0) / getDefaultQuestions(subject.id)) *
      MARKS_PER_SUBJECT
  );

/*
|--------------------------------------------------------------------------
| Selected Subjects
|--------------------------------------------------------------------------
*/

const selectedSubjects = ref([
  {
    id: "english-language",
    name: "ENGLISH LANGUAGE",
    icon: "lucide:book-open",
    description: "Test your knowledge of English language and comprehension.",
  },
]);

/*
|--------------------------------------------------------------------------
| Exam Settings
|--------------------------------------------------------------------------
*/

const examMode = ref("practice");
const examDurationHours = ref(2);
const examDurationMinutes = ref(0);
const durationHours = Array.from({ length: 100 }, (_, hour) => hour);
const durationMinutes = Array.from({ length: 60 }, (_, minute) => minute);
const examDuration = computed(() =>
  secondsToDuration(
    examDurationHours.value * 3600 + examDurationMinutes.value * 60
  )
);
const shuffleQuestions = ref(true);
const shuffleOptions = ref(true);

/*
|--------------------------------------------------------------------------
| Subject Helpers
|--------------------------------------------------------------------------
*/

const getSubjectDetails = (subject) => {
  return subjectsdetails.find((item) => item.id === subject.id);
};

/*
|--------------------------------------------------------------------------
| Filtered Subjects
|--------------------------------------------------------------------------
*/

const filteredSubjects = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();

  return selectedSubjects.value.filter((subject) => {
    const matchesSearch =
      !query ||
      subject.name.toLowerCase().includes(query) ||
      subject.id.toLowerCase().includes(query);

    const matchesCategory =
      activeCategory.value === "All" ||
      getSubjectCategory(subject.id) === activeCategory.value;

    return matchesSearch && matchesCategory;
  });
});

/*
|--------------------------------------------------------------------------
| Totals
|--------------------------------------------------------------------------
*/

const totalQuestions = computed(() => {
  return selectedSubjects.value.reduce(
    (total, subject) => total + Number(subject.questions || 0),
    0
  );
});

const totalMarks = computed(() => {
  return selectedSubjects.value.reduce(
    (total, subject) => total + getSubjectMarks(subject),
    0
  );
});

/*
|--------------------------------------------------------------------------
| Exam Mode Label
|--------------------------------------------------------------------------
*/

const examModeLabel = computed(() => {
  const mode = examModes.find((item) => item.value === examMode.value);
  return mode?.label || "Practice";
});

/*
|--------------------------------------------------------------------------
| Topic Helpers
|--------------------------------------------------------------------------
*/

const getTopicLabel = (subject) => {
  const availableTopics = getSubjectDetails(subject)?.topics || [];

  if (
    !subject.topics ||
    subject.topics.length === 0 ||
    subject.topics.length === availableTopics.length
  ) {
    return "All Topics";
  }

  return `${subject.topics.length} Topics Selected`;
};

/*
|--------------------------------------------------------------------------
| Subject Creation
|--------------------------------------------------------------------------
*/

const createSubject = (subject) => {
  const details = getSubjectDetails(subject);

  return {
    ...subject,
    year: details?.years?.at(-1) ?? "all",
    topics: [],
    questions: getDefaultQuestions(subject.id),
    questionOptions: [...QUESTION_OPTIONS],
  };
};

/*
|--------------------------------------------------------------------------
| Subject Selection
|--------------------------------------------------------------------------
*/

const isSelected = (subject) => {
  return selectedSubjects.value.some((item) => item.id === subject.id);
};

const toggleSubject = (subject) => {
  if (isSelected(subject)) {
    selectedSubjects.value = selectedSubjects.value.filter(
      (item) => item.id !== subject.id
    );
  } else {
    selectedSubjects.value.push(createSubject(subject));
  }
};

const removeSubject = (subject) => {
  selectedSubjects.value = selectedSubjects.value.filter(
    (item) => item.id !== subject.id
  );
};

const openSubjectModal = () => {
  showSubjectModal.value = true;
};

/*
|--------------------------------------------------------------------------
| Topic Modal
|--------------------------------------------------------------------------
*/

const openTopicModal = (subject) => {
  activeSubject.value = subject;
  showTopicModal.value = true;
};

/*
|--------------------------------------------------------------------------
| Instructions
|--------------------------------------------------------------------------
*/

const openInstructions = () => {
  showInstructions.value = true;
};

/*
|--------------------------------------------------------------------------
| Shuffle Helpers
|--------------------------------------------------------------------------
*/

function shuffleArray(array) {
  const arr = [...array];

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

function shuffleQuestionOptions(question) {
  const entries = Object.entries(question.options || {}).filter(
    ([, value]) => value !== undefined && value !== null && value !== ""
  );

  const correctText = question.options?.[question.answer];

  for (let i = entries.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [entries[i], entries[j]] = [entries[j], entries[i]];
  }

  const newOptions = {};
  let newAnswer = "";

  entries.forEach(([, value], index) => {
    const key = String.fromCharCode(97 + index);

    newOptions[key] = value;

    if (value === correctText) {
      newAnswer = key;
    }
  });

  return {
    ...question,
    options: newOptions,
    answer: newAnswer,
    userAnswer: null,
  };
}

/*
|--------------------------------------------------------------------------
| Start Exam
|--------------------------------------------------------------------------
*/

const startExam = async () => {
  if (isStarting.value) return;

  appState.value.reviewQuestions = false;

  if (selectedSubjects.value.length === 0) {
    alert("Please select at least one subject.");
    return;
  }

  if (durationToSeconds(examDuration.value, 0) <= 0) {
    alert("Please choose an exam duration greater than zero.");
    return;
  }

  isStarting.value = true;

  try {
    appState.value.selectedSubjects = selectedSubjects.value;

    appState.value.examSettings = {
      mode: examMode.value,
      duration: examDuration.value,
      shuffleQuestions: shuffleQuestions.value,
      shuffleOptions: shuffleOptions.value,
    };

    let examQuestions = [];

    for (const subject of selectedSubjects.value) {
      let subjectQuestions = await getQuestions({
        subject: subject.id,
        year: subject.year,
        limit: subject.questions,
      });

      if (!subjectQuestions?.length) {
        subjectQuestions = await getQuestions({
          subject: subject.id,
          limit: subject.questions,
        });
      }

      if (shuffleQuestions.value) {
        subjectQuestions = shuffleArray(subjectQuestions);
      }

      if (shuffleOptions.value) {
        subjectQuestions = subjectQuestions.map((question) =>
          shuffleQuestionOptions(question)
        );
      }

      examQuestions.push(...subjectQuestions);
    }

    if (examQuestions.length === 0) {
      alert("No questions found for the selected subjects.");
      return;
    }

    appState.value.examQuestions = examQuestions;

    await navigateTo("/exam");
  } catch (error) {
    console.error("Failed to start exam:", error);
    alert("Unable to prepare the exam. Please try again.");
  } finally {
    isStarting.value = false;
  }
};

/*
|--------------------------------------------------------------------------
| Watch Selected Subjects
|--------------------------------------------------------------------------
*/

watch(
  selectedSubjects,
  (subjects) => {
    subjects.forEach((subject) => {
      const details = getSubjectDetails(subject);

      if (!subject.year) {
        subject.year = details?.years?.at(-1) || "all";
      }

      if (!subject.topics) {
        subject.topics = [];
      }

      if (!subject.questions) {
        subject.questions = getDefaultQuestions(subject.id);
      }

      if (!subject.questionOptions) {
        subject.questionOptions = [...QUESTION_OPTIONS];
      }
    });
  },
  {
    immediate: true,
    deep: true,
  }
);

/*
|--------------------------------------------------------------------------
| Go Home
|--------------------------------------------------------------------------
*/

const goHome = () => {
  emit("gohome");
};

/*
|--------------------------------------------------------------------------
| Lifecycle
|--------------------------------------------------------------------------
*/

onMounted(() => {
  const savedSubjects = appState.value.selectedSubjects;

  if (savedSubjects?.length > 0) {
    selectedSubjects.value = savedSubjects.map((subject) =>
      normalizeSubjectId(subject.id ?? subject.subject ?? subject.name) ===
      "english-language"
        ? { ...subject, id: "english-language", name: "ENGLISH LANGUAGE" }
        : subject
    );

    const settings = appState.value.examSettings;

    if (settings) {
      examMode.value = settings.mode || "practice";
      const durationSeconds = durationToSeconds(settings.duration);
      examDurationHours.value = Math.floor(durationSeconds / 3600);
      examDurationMinutes.value = Math.floor((durationSeconds % 3600) / 60);
      shuffleQuestions.value = settings.shuffleQuestions ?? true;
      shuffleOptions.value = settings.shuffleOptions ?? true;
    }
  }

  fetchSubjects();
});
</script>

<style scoped>
/* Keep every element inside its available width */
* {
  min-width: 0;
}

/* Compact form controls */
input,
select,
button {
  max-width: 100%;
}

/* Prevent long text from breaking the layout */
p,
h1,
h2,
h3,
span {
  overflow-wrap: anywhere;
}
</style>