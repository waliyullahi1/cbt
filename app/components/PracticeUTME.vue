<template>
  <div
    class="flex h-full  sm:pt-0 min-h-0 w-full flex-col overflow-hidden sm:bg-white bg-[#f0f3fb] text-[#201f22] font-['Roboto',system-ui,sans-serif]"
  >

            <header
              class="shrink-0 sm:hidden block b text-ite"
            >
              <div class="flex h-12 items-center gap-1 px-2">
                <button
                  type="button"
                  class="flex h-9 p-0.5 w-9 bg-primary/10 shadow-[0_2px_8px_rgba(20,49,109,0.09)] rounded-full bg-primry   shrink-0 items-center justify-center  active:bg-white/10"
                  aria-label="Open menu"
                  @click="menuOpen = true"
                >
                 <img src="/images/logos.svg"   class="  "  >
                </button>

                <div class="flex min-w-0 flex-1 items-center gap-2.5">
                  
                  <span class="truncate text-[15px] font-bold tracking-tight">
                    Exam Preparation
                  </span>
                </div>

               <button type="button" class="  text-gray-700" @click="goHome" aria-label="Go home">
                <Icon name="lucide:house" class=" text-xl" />
              </button>

               
              </div>
            </header>
    <!-- MAIN CONTENT -->
    <main class="min-h-0 flex-1 overflow-y-hidden  p-2 pb-24 pt-2 sm:px-3">
      <!-- HERO BANNER -->
      <section
        class="relative mb-3 overflow-hidden flex justify-between rounded-sm bg-primary p-3 text-white shadow-sm"
      >
        <div class="relative z-10 max-w-[85%]">
          <div class="sm:mb-2 mb-1 flex items-center gap-1.5">
            <div
              class="flex h-6 w-6 items-center justify-center rounded-sm bg-white/10"
            >
              <Icon name="lucide:graduation-cap" class="h-3.5 w-3.5" />
            </div>

            <span
              class="sm:text-[10px] text-[9px] font-semibold uppercase tracking-wide text-indigo-300"
            >
              Exam Preparation
            </span>
          </div>

          <h1
            class="  text-lg font-semibold leading-tight sm:text-2xl"
          >
            Choose your subjects,
          </h1>

          <p class="sm:mt-1 mt-0 text-[9px] sm:text-[11px] leading-relaxed text-indigo-200">
            Choose your subjects, customize your practice, and prepare for
            success.
          </p>

          <button
            type="button"
            @click="openSubjectModal"
            class="sm:mt-3 mt-1 flex items-center sm:gap-1.5 rounded-sm bg-white sm:px-3 px-2 py-1 sm:py-2 text-[11px] font-semibold text-[#1e1b4b] shadow-sm transition active:scale-95"
          >
            <Icon name="lucide:plus" class="sm:h-3.5 h-2 w-2 sm:w-3.5" />
            Select Subjects
          </button>
        </div>
        <div>
           <button type="button" class=" sm:block hidden ds-header__home" @click="goHome" aria-label="Go home">
        <Icon name="lucide:house" class=" text-xl" />
      </button>
        </div>

        <!-- Decorative Illustration -->
        <div
          class="pointer-events-none absolute -right-4 -top-4 h-28 w-28 text-indigo-300 opacity-20"
        >
          <Icon name="lucide:graduation-cap" class="h-full w-full" />
        </div>

        <div
          class="pointer-events-none absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-indigo-500/20 blur-2xl"
        ></div>

        <div
          class="pointer-events-none absolute bottom-0 right-4 h-14 w-14 rounded-sm border border-white/5"
        ></div>
      </section>

      <!-- QUICK SUMMARY -->
      <section class="mb-3 grid grid-cols-2 gap-2">
      
        <div class="rounded-lg border flex justify-between    gap-2 border-gray-200 bg-indigo-50  sm:p-2.5 p-1.5 shadow-sm">
           <div class="flex  gap-2">
            <div
              class="flex sm:h-10 sm:w-10 w-8 h-8 items-center justify-center rounded-sm bg-indigo-100 text-indigo-600"
            >
              <Icon name="lucide:layers-3" class="sm:h-8 sm:w-8 w-5 h-5" />
            </div>

         
          <div class="  space-y-0.5">
            <span class="text-[10px] font-semibold text-indigo-900"> Selected </span>
            <p class="text-lg font-bold leading-none text-gray-900">
            {{ selectedSubjects.length }}
          </p>
            <p class="text-[10px] font-semibold text-indigo-900">Subjects</p>
          </div>
         </div>
          <div class="flex  place-content-end  items-center  justify-end rounded-sm bg-indigo-50 ">
              <Icon name="lucide:chevron-right" class="sm: w-4 h-4" />
          </div>
    
        
        </div>

        <div class="rounded-lg border  flex justify-between   gap-2 border-gray-200 bg-emerald-50  sm:p-2.5 p-1.5 shadow-sm">
          <div class="flex  gap-2">
            <div
              class="flex sm:h-10 sm:w-10 w-8 h-8 items-center justify-center rounded-sm bg-emerald-100 text-emerald-600"
            >
              <Icon name="lucide:file-text" class="sm:h-8 sm:w-8 w-5 h-5" />
            </div>

         
            <div class="  space-y-0.5">
              <span class="text-[10px] font-semibold text-indigo-900"> Selected </span>
              <p class="text-lg font-bold leading-none text-gray-900">
              {{ totalQuestions }}
            </p>
              <p class="text-[10px] font-semibold text-indigo-900">Questions</p>
            </div>
          </div>
          <div class="flex sm:h-10 sm:w-10 w-8 h-8 items-center justify-center rounded-sm  ">
              <Icon name="lucide:chevron-right" class="w-4 h-4" />
          </div>
    
        
        </div>



        <div class="rounded-lg hidden border border-gray-200 bg-white p-2.5 shadow-sm">
          <div class="mb-1.5 flex items-center justify-between">
            <div
              class="flex h-6 w-6 items-center justify-center rounded-sm bg-emerald-50 text-emerald-600"
            >
              <Icon name="lucide:file-text" class="h-3.5 w-3.5" />
            </div>

            <span class="text-[10px] font-medium text-gray-400"> Total </span>
          </div>

          <p class="text-xl font-semibold leading-none text-gray-900">
            {{ totalQuestions }}
          </p>

          <p class="mt-1 text-[11px] text-gray-500">Questions</p>
        </div>
      </section>

      <!-- SEARCH AND FILTER -->
     

      <!-- CATEGORY TABS -->
    

      <!-- SECTION TITLE -->
      <section class="mb-2 flex items-center justify-between">
        <div class="min-w-0">
          <h2 class="text-sm font-semibold text-gray-900">Your Subjects</h2>

          <p class="mt-0.5 text-[10px] text-gray-500">
            Customize each subject before starting.
          </p>
        </div>

        <button
          type="button"
          @click="openSubjectModal"
          class="text-[13px] font-semibold text-indigo-600"
        >
          + Add
        </button>
      </section>

      <!-- EMPTY STATE -->
      <section
        v-if="filteredSubjects.length === 0"
        class="rounded-sm border border-dashed border-gray-200 bg-white px-3 py-7 text-center"
      >
        <div
          class="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-sm bg-indigo-50 text-indigo-500"
        >
          <Icon name="lucide:book-open" class="h-5 w-5" />
        </div>

        <h3 class="text-xs font-semibold text-gray-900">No subjects found</h3>

        <p class="mt-1 text-[11px] text-gray-500">
          Select a subject or change your search.
        </p>

        <button
          type="button"
          @click="openSubjectModal"
          class="mt-3 rounded-sm bg-indigo-600 px-3 py-2 text-[11px] font-semibold text-white active:scale-95"
        >
          Select Subject
        </button>
      </section>

      <!-- SUBJECT CARDS -->
      <section v-else class="space-y-2 gap-3 grid grid-cols-1 sm:grid-cols-3">
        <article
          v-for="subject in filteredSubjects"
          :key="subject.id"
          class="overflow-hidden rounded-sm border border-gray-200 bg-white shadow-sm transition"
        >
          <!-- CARD TOP -->
          <div class="flex items-center gap-2.5 p-2.5">
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm"
              :class="getSubjectColor(subject.id).bg"
            >
              <Icon
                :name="getSubjectIcon(subject.id)"
                class="h-5 w-5"
                :class="getSubjectColor(subject.id).text"
              />
            </div>

            <div class="min-w-0 flex-1">
              <div class="flex bg-pr items-start justify-between gap-1.5">
                <div class="min-w-0">
                  <h3 class="truncate text-sm font-semibold text-gray-900">
                    {{ subject.name }}
                  </h3>

                
                </div>

                <button
                  type="button"
                  @click="removeSubject(subject)"
                  class="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-gray-50 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                  title="Remove subject"
                >
                  <Icon name="lucide:x" class="h-4 w-4" />
                </button>
              </div>

              <div class="mt-1.5 hidden flex-wrap items-center gap-1.5">
                <span
                  class="flex items-center gap-1 rounded-sm bg-emerald-50 px-1.5 py-1 text-[10px] font-medium text-emerald-700"
                >
                  <Icon name="lucide:check-circle" class="h-2.5 w-2.5" />
                  Selected
                </span>

                <span
                  class="flex items-center gap-1 rounded-sm bg-gray-50 px-1.5 py-1 text-[10px] font-medium text-gray-500"
                >
                  <Icon name="lucide:file-text" class="h-2.5 w-2.5" />
                  {{ subject.questions }} Questions
                </span>
              </div>
            </div>
          </div>

          <!-- CARD SETTINGS -->
          <div class="border-t border-gray-200 bg-[#fcfcfe] p-2.5">
            <div class="grid grid-cols-2 gap-2">
              <!-- YEAR -->
              <div class="min-w-0">
                <label
                  class="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400"
                >
                  <Icon name="lucide:calendar-days" class="h-3 w-3" />
                  Year
                </label>

                <div class="relative">
                  <select
                    v-model="subject.year"
                    class="w-full appearance-none rounded-sm border border-gray-200 bg-white px-2 py-1 pr-6 text-sm font-medium text-gray-700 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-500/10"
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
                    class="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400"
                  />
                </div>
              </div>

              <!-- QUESTION COUNT -->
              <div class="min-w-0">
                <label
                  class="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400"
                >
                  <Icon name="lucide:list-ordered" class="h-3 w-3" />
                  Questions
                </label>

                <div class="relative">
                  <select
                    v-model="subject.questions"
                    class="w-full appearance-none rounded-sm border border-gray-200 bg-white px-2 py-2 pr-6 text-[11px] font-medium text-gray-700 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-500/10"
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
                    class="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400"
                  />
                </div>
              </div>
            </div>

            <!-- TOPIC SELECTOR -->
            <button
              type="button"
              @click="openTopicModal(subject)"
              class="mt-2  hidden w-full items-center justify-between rounded-sm border border-gray-200 bg-white px-2 py-2 text-left transition active:bg-gray-50"
            >
              <div class="flex min-w-0 items-center gap-2">
                <div
                  class="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-indigo-50 text-indigo-500"
                >
                  <Icon name="lucide:folder-open" class="h-3.5 w-3.5" />
                </div>

                <div class="min-w-0">
                  <p
                    class="text-[10px] font-semibold uppercase tracking-wide text-gray-400"
                  >
                    Topics
                  </p>

                  <p
                    class="mt-0.5 truncate text-[10px] font-medium text-gray-700"
                  >
                    {{ getTopicLabel(subject) }}
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-1 text-indigo-500">
                <span class="text-[10px] font-semibold"> Edit </span>

                <Icon name="lucide:chevron-right" class="h-3.5 w-3.5" />
              </div>
            </button>
          </div>
        </article>
      </section>

      <!-- USER PROFILE -->
      <section
        class="mt-3 hidden rounded-sm border border-gray-200 bg-white p-2.5 shadow-sm"
      >
        <div class="mb-2 flex items-center gap-1.5">
          <div
            class="flex h-6 w-6 items-center justify-center rounded-sm bg-indigo-50 text-indigo-500"
          >
            <Icon name="lucide:user-round" class="h-3.5 w-3.5" />
          </div>

          <div class="min-w-0">
            <h3 class="text-[11px] font-semibold text-gray-900">
              Student Profile
            </h3>

            <p class="text-[10px] text-gray-400">
              Save your name for your practice session.
            </p>
          </div>
        </div>

        <input
          v-model="appState.currentsuser"
          type="text"
          list="students"
          placeholder="Enter your name"
          class="w-full rounded-sm border border-gray-200 bg-gray-50 px-2.5 py-2 text-[11px] font-medium text-gray-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-1 focus:ring-indigo-500/10"
        />

        <datalist id="students">
          <option
            v-for="user in appState.users || []"
            :key="user"
            :value="user"
          />
        </datalist>
      </section>
   

      <!-- EXAM SETTINGS -->
      <section class="mt-3">
        <button
          type="button"
          @click="showSettings = !showSettings"
          class="flex w-full items-center justify-between rounded-sm border border-gray-200 bg-white p-2.5 shadow-sm"
        >
          <div class="flex min-w-0 items-center gap-2">
            <div
              class="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm bg-indigo-50 text-indigo-600"
            >
              <Icon name="lucide:settings-2" class="h-4 w-4" />
            </div>

            <div class="min-w-0 text-left">
              <h3 class="text-xs font-semibold text-gray-900">Exam Settings</h3>

              <p class="mt-0.5 text-[10px] text-gray-500">
                {{ examModeLabel }} · {{ formatDurationLabel(examDuration) }}
              </p>
            </div>
          </div>

          <Icon
            :name="showSettings ? 'lucide:chevron-up' : 'lucide:chevron-down'"
            class="h-4 w-4 shrink-0 text-gray-400"
          />
        </button>

        <div
          v-if="showSettings"
          class="mt-1.5 space-y-2.5 rounded-sm border border-gray-200 bg-white p-2.5 shadow-sm"
        >
          <!-- MODE -->
          <div>
            <label class="mb-1.5 block text-[11px] font-semibold text-gray-700">
              Examination Mode
            </label>

            <div class="grid grid-cols-3 gap-1.5">
              <button
                v-for="mode in examModes"
                :key="mode.value"
                type="button"
                @click="examMode = mode.value"
                class="rounded-sm border px-1.5 py-2 text-[10px] font-semibold transition"
                :class="
                  examMode === mode.value
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : 'border-gray-200 bg-gray-50 text-gray-500'
                "
              >
                {{ mode.label }}
              </button>
            </div>
          </div>

          <!-- DURATION -->
          <div>
            <label class="mb-1.5 block text-[11px] font-semibold text-gray-700">
              Exam Duration
            </label>

            <div class="grid grid-cols-2 gap-2">
              <label class="text-[10px] font-medium text-gray-500">
                Hours
                <select
                  v-model.number="examDurationHours"
                  class="mt-1 w-full rounded-sm border border-gray-200 bg-gray-50 px-2 py-2 text-xs font-medium text-gray-700 outline-none focus:border-indigo-400 focus:bg-white"
                >
                  <option v-for="hour in durationHours" :key="hour" :value="hour">
                    {{ String(hour).padStart(2, "0") }} hr
                  </option>
                </select>
              </label>

              <label class="text-[10px] font-medium text-gray-500">
                Minutes
                <select
                  v-model.number="examDurationMinutes"
                  class="mt-1 w-full rounded-sm border border-gray-200 bg-gray-50 px-2 py-2 text-xs font-medium text-gray-700 outline-none focus:border-indigo-400 focus:bg-white"
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
            <p class="mt-1 text-[10px] text-gray-500">
              Duration: {{ formatDurationLabel(examDuration) }}
            </p>
          </div>

          <!-- SHUFFLE QUESTIONS -->
          <label
            class="flex cursor-pointer items-center justify-between rounded-sm bg-gray-50 p-2"
          >
            <div class="flex min-w-0 items-center gap-2">
              <div
                class="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-indigo-50 text-indigo-600"
              >
                <Icon name="lucide:shuffle" class="h-3.5 w-3.5" />
              </div>

              <div class="min-w-0">
                <p class="text-[11px] font-semibold text-gray-700">
                  Shuffle Questions
                </p>

                <p class="text-[10px] text-gray-400">Randomize question order</p>
              </div>
            </div>

            <input
              v-model="shuffleQuestions"
              type="checkbox"
              class="h-3.5 w-3.5 rounded-sm border-gray-300 accent-indigo-600"
            />
          </label>

          <!-- SHUFFLE OPTIONS -->
          <label
            class="flex cursor-pointer items-center justify-between rounded-sm bg-gray-50 p-2"
          >
            <div class="flex min-w-0 items-center gap-2">
              <div
                class="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-emerald-50 text-emerald-600"
              >
                <Icon name="lucide:list-restart" class="h-3.5 w-3.5" />
              </div>

              <div class="min-w-0">
                <p class="text-[11px] font-semibold text-gray-700">
                  Shuffle Options
                </p>

                <p class="text-[10px] text-gray-400">Randomize answer choices</p>
              </div>
            </div>

            <input
              v-model="shuffleOptions"
              type="checkbox"
              class="h-3.5 w-3.5 rounded-sm border-gray-300 accent-indigo-600"
            />
          </label>
        </div>
      </section>



       <div
      class="shrink-0 border-t border-gray-200 bg-white px-2.5 pb-2.5 pt-2 shadow-[0_-2px_10px_rgba(0,0,0,0.03)] sm:px-3"
    >
      <div class="flex items-center gap-1.5">
        <button
          type="button"
          @click="openInstructions"
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-gray-200 bg-gray-50 text-gray-500 transition active:scale-95"
          title="Exam instructions"
        >
          <Icon name="lucide:info" class="h-4 w-4" />
        </button>

        <button
          type="button"
          @click="startExam"
          :disabled="isStarting"
          class="flex h-9 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-sm bg-primary px-2 text-xs font-semibold text-white shadow-sm transition hover:bg-primary/95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Icon
            :name="isStarting ? 'lucide:loader-circle' : 'lucide:play'"
            class="h-3.5 w-3.5 shrink-0"
            :class="{ 'animate-spin': isStarting }"
          />

          <span class="truncate">
            {{ isStarting ? "Preparing Exam..." : "Start Exam" }}
          </span>

          <Icon
            v-if="!isStarting"
            name="lucide:arrow-right"
            class="h-3.5 w-3.5 shrink-0"
          />
        </button>
       
      </div>
    </div>

    </main>

    <!-- FIXED BOTTOM ACTION BAR -->
   
    <!-- MODALS -->
    <Teleport to="body">
      <!-- INSTRUCTIONS MODAL -->
      <div
        v-if="showInstructions"
        class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-2 backdrop-blur-sm sm:items-center"
        @click.self="showInstructions = false"
      >
        <div
          class="w-full max-w-md rounded-sm border border-gray-200 bg-white p-3 shadow-2xl"
        >
          <div class="mb-3 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div
                class="flex h-7 w-7 items-center justify-center rounded-sm bg-indigo-50 text-indigo-600"
              >
                <Icon name="lucide:info" class="h-4 w-4" />
              </div>

              <h2 class="text-sm font-semibold text-gray-900">
                Exam Instructions
              </h2>
            </div>

            <button
              type="button"
              @click="showInstructions = false"
              class="flex h-6 w-6 items-center justify-center rounded-sm bg-gray-100 text-gray-500"
            >
              <Icon name="lucide:x" class="h-3.5 w-3.5" />
            </button>
          </div>

          <div class="space-y-2.5">
            <p
              class="flex items-start gap-2 text-[11px] leading-relaxed text-gray-600"
            >
              <Icon
                name="lucide:check-circle"
                class="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500"
              />
              Select the subjects you want to practice.
            </p>

            <p
              class="flex items-start gap-2 text-[11px] leading-relaxed text-gray-600"
            >
              <Icon
                name="lucide:calendar-days"
                class="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-500"
              />
              Choose your preferred year, topics, and question count.
            </p>

            <p
              class="flex items-start gap-2 text-[11px] leading-relaxed text-gray-600"
            >
              <Icon
                name="lucide:clock"
                class="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-500"
              />
              Complete the examination before the timer ends.
            </p>

            <p
              class="flex items-start gap-2 text-[11px] leading-relaxed text-gray-600"
            >
              <Icon
                name="lucide:shuffle"
                class="mt-0.5 h-3.5 w-3.5 shrink-0 text-purple-500"
              />
              You can shuffle questions and answer options.
            </p>
          </div>

          <button
            type="button"
            @click="showInstructions = false"
            class="mt-4 w-full rounded-sm bg-[#4f46e5] py-2.5 text-xs font-semibold text-white transition active:scale-[0.98]"
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
@import url("https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;600;700&display=swap");

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

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