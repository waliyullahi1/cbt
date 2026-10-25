<template>
<div
  class="absolute inset-0 flex min-h-0 w-full flex-col overflow-hidden bg-[#f4f5f9] font-['Roboto','Arial',sans-serif] text-[#1b1b1f]"
>
    <!-- MOBILE HEADER -->
    <header
      class="sticky top-0 z-20 block shrink-0 border-b border-gray-200 bg-white text-gray-900 sm:hidden"
    >
      <div class="flex h-14 items-center gap-2 px-3">
        <button
          type="button"
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-primary/10 p-1 active:bg-primary/20"
          aria-label="Open menu"
          @click="menuOpen = true"
        >
          <img src="/images/logos.svg" alt="" />
        </button>

        <span class="min-w-0 flex-1 truncate text-base font-medium">
          Exam Preparation
        </span>

        <button
          type="button"
          class="flex h-9 w-9 items-center justify-center rounded-sm text-gray-700 active:bg-gray-100"
          aria-label="Go home"
          @click="goHome"
        >
          <Icon name="lucide:house" class="h-5 w-5" />
        </button>
      </div>
    </header>

    <!-- MAIN CONTENT -->
    <main class="min-h-0 flex-1 overflow-y-auto overscroll-contain">
      <div class="mx-auto w-full max-w-5xl pb-4">
        <!-- HERO + STATS -->
        <section
          class="relative mx-2 mt-2 overflow-hidden rounded-sm bg-primary text-white sm:mx-4 sm:mt-4"
        >
          <div class="relative z-10 flex items-start justify-between gap-3 p-3 sm:p-5">
            <div class="min-w-0">
              <div class="mb-1 flex items-center gap-1.5 text-indigo-200">
                <Icon name="lucide:graduation-cap" class="h-3.5 w-3.5" />
                <span class="text-[11px] font-medium uppercase tracking-wider">
                  Exam Preparation
                </span>
              </div>

              <h1 class="text-lg font-medium leading-tight sm:text-2xl">
                Build your practice exam
              </h1>

              <p class="mt-0.5 text-xs leading-4 text-indigo-100/90 sm:text-sm">
                Pick your subjects, tune the settings, then start.
              </p>

              <button
                type="button"
                class="mt-3 inline-flex items-center gap-1.5 rounded-sm bg-white px-3 py-1.5 text-xs font-medium text-[#1e1b4b] transition active:brightness-90 sm:text-sm"
                @click="openSubjectModal"
              >
                <Icon name="lucide:plus" class="h-3.5 w-3.5" />
                Select Subjects
              </button>
            </div>

            <button
              type="button"
              class="hidden h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-white/10 transition hover:bg-white/20 sm:flex"
              aria-label="Go home"
              @click="goHome"
            >
              <Icon name="lucide:house" class="h-5 w-5" />
            </button>
          </div>

          <!-- stats strip -->
          <div class="relative z-10 grid grid-cols-2 border-t border-white/15 bg-black/10">
            <div class="flex items-center gap-2 px-3 py-2 sm:px-5">
              <Icon name="lucide:layers-3" class="h-4 w-4 text-indigo-200" />
              <p class="text-sm">
                <span class="text-base font-medium">{{ selectedSubjects.length }}</span>
                <span class="ml-1 text-xs text-indigo-100">Subjects</span>
              </p>
            </div>

            <div class="flex items-center gap-2 border-l border-white/15 px-3 py-2 sm:px-5">
              <Icon name="lucide:file-text" class="h-4 w-4 text-emerald-200" />
              <p class="text-sm">
                <span class="text-base font-medium">{{ totalQuestions }}</span>
                <span class="ml-1 text-xs text-indigo-100">Questions</span>
              </p>
            </div>
          </div>

          <!-- decoration -->
          <div
            class="pointer-events-none absolute -right-4 -top-4 h-28 w-28 text-indigo-300 opacity-15"
          >
            <Icon name="lucide:graduation-cap" class="h-full w-full" />
          </div>
        </section>

        <!-- SECTION TITLE -->
        <section class="mt-4 flex items-end justify-between px-2 sm:px-4">
          <div class="min-w-0">
            <h2 class="text-base font-medium text-gray-900">Your Subjects</h2>
            <p class="text-xs text-gray-500">Customize each subject before starting.</p>
          </div>

          <button
            type="button"
            class="flex items-center gap-1 rounded-sm px-2 py-1 text-sm font-medium text-indigo-600 active:bg-indigo-50"
            @click="openSubjectModal"
          >
            <Icon name="lucide:plus" class="h-3.5 w-3.5" />
            Add
          </button>
        </section>

        <!-- EMPTY STATE -->
        <section
          v-if="filteredSubjects.length === 0"
          class="mx-2 mt-2 rounded-sm border border-dashed border-gray-300 bg-white px-3 py-8 text-center sm:mx-4"
        >
          <div
            class="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-sm bg-indigo-50 text-indigo-500"
          >
            <Icon name="lucide:book-open" class="h-5 w-5" />
          </div>

          <h3 class="text-sm font-medium text-gray-900">No subjects yet</h3>
          <p class="mt-1 text-xs text-gray-500">Select a subject to get started.</p>

          <button
            type="button"
            class="mt-3 rounded-sm bg-indigo-600 px-3 py-2 text-xs font-medium text-white active:brightness-90"
            @click="openSubjectModal"
          >
            Select Subject
          </button>
        </section>

        <!-- SUBJECT CARDS -->
        <section
          v-else
          class="mt-2 grid grid-cols-1 gap-2 px-2 sm:grid-cols-2 sm:gap-3 sm:px-4 xl:grid-cols-3"
        >
          <article
            v-for="subject in filteredSubjects"
            :key="subject.id"
            class="overflow-hidden rounded-sm border border-gray-200 bg-white"
          >
            <!-- card header -->
            <div class="flex items-center gap-2.5 p-2.5">
              <div
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm"
                :class="getSubjectColor(subject.id).bg"
              >
                <Icon
                  :name="getSubjectIcon(subject.id)"
                  class="h-5 w-5"
                  :class="getSubjectColor(subject.id).text"
                />
              </div>

              <div class="min-w-0 flex-1">
                <h3 class="truncate text-sm font-medium text-gray-900">
                  {{ subject.name }}
                </h3>
                <p class="text-[11px] text-gray-500">
                  {{ subject.questions }} questions ·
                  {{ subject.year === "all" ? "All years" : subject.year }}
                </p>
              </div>

              <button
                type="button"
                class="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                title="Remove subject"
                @click="removeSubject(subject)"
              >
                <Icon name="lucide:x" class="h-4 w-4" />
              </button>
            </div>

            <!-- card settings -->
            <div class="border-t border-gray-100 bg-[#fafbff] p-2.5">
              <div class="grid grid-cols-2 gap-2">
                <!-- year -->
                <div class="min-w-0">
                  <label
                    class="mb-1 flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-gray-400"
                  >
                    <Icon name="lucide:calendar-days" class="h-3 w-3" />
                    Year
                  </label>

                  <div class="relative">
                    <select
                      v-model="subject.year"
                      class="w-full appearance-none rounded-sm border border-gray-200 bg-white px-2 py-1.5 pr-6 text-sm text-gray-700 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-500/20"
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

                <!-- question count -->
                <div class="min-w-0">
                  <label
                    class="mb-1 flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-gray-400"
                  >
                    <Icon name="lucide:list-ordered" class="h-3 w-3" />
                    Questions
                  </label>

                  <div class="relative">
                    <select
                      v-model="subject.questions"
                      class="w-full appearance-none rounded-sm border border-gray-200 bg-white px-2 py-1.5 pr-6 text-sm text-gray-700 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-500/20"
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

              <!-- topics -->
              <button
                type="button"
                class="mt-2 flex w-full items-center justify-between gap-2 rounded-sm border border-gray-200 bg-white px-2 py-2 text-left transition active:bg-gray-50"
                @click="openTopicModal(subject)"
              >
                <div class="flex min-w-0 items-center gap-2">
                  <Icon name="lucide:folder-open" class="h-4 w-4 shrink-0 text-indigo-500" />

                  <div class="min-w-0">
                    <p class="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                      Topics
                    </p>
                    <p class="truncate text-xs text-gray-700">
                      {{ getTopicLabel(subject) }}
                    </p>
                  </div>
                </div>

                <div class="flex shrink-0 items-center gap-1">
                  <span
                    v-if="!isSubscribed"
                    class="flex items-center gap-1 whitespace-nowrap rounded-sm bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-600"
                  >
                    <Icon name="lucide:lock" class="h-3 w-3" />
                    Pro
                  </span>

                  <span v-else class="text-xs font-medium text-indigo-600">Edit</span>

                  <Icon name="lucide:chevron-right" class="h-3.5 w-3.5 text-gray-400" />
                </div>
              </button>
            </div>
          </article>
        </section>

        <!-- USER PROFILE (hidden for now) -->
        <section
          class="mx-2 mt-3 hidden rounded-sm border border-gray-200 bg-white p-2.5 sm:mx-4"
        >
          <div class="mb-2 flex items-center gap-1.5">
            <Icon name="lucide:user-round" class="h-4 w-4 text-indigo-500" />
            <div class="min-w-0">
              <h3 class="text-sm font-medium text-gray-900">Student Profile</h3>
              <p class="text-xs text-gray-400">Save your name for your practice session.</p>
            </div>
          </div>

          <input
            v-model="appState.currentsuser"
            type="text"
            list="students"
            placeholder="Enter your name"
            class="w-full rounded-sm border border-gray-200 bg-gray-50 px-2.5 py-2 text-sm text-gray-700 outline-none transition focus:border-indigo-400 focus:bg-white"
          />

          <datalist id="students">
            <option v-for="user in appState.users || []" :key="user" :value="user" />
          </datalist>
        </section>

        <!-- EXAM SETTINGS -->
        <section class="mt-3 px-2 sm:px-4">
          <button
            type="button"
            class="flex w-full items-center justify-between rounded-sm border border-gray-200 bg-white p-2.5"
            @click="showSettings = !showSettings"
          >
            <div class="flex min-w-0 items-center gap-2.5">
              <div
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-indigo-50 text-indigo-600"
              >
                <Icon name="lucide:settings-2" class="h-4 w-4" />
              </div>

              <div class="min-w-0 text-left">
                <h3 class="text-sm font-medium text-gray-900">Exam Settings</h3>
                <p class="text-xs text-gray-500">
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
            class="mt-1 space-y-3 rounded-sm border border-gray-200 bg-white p-3"
          >
            <!-- mode -->
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-700">
                Examination Mode
              </label>

              <div class="grid grid-cols-3 rounded-sm bg-gray-100 p-0.5">
                <button
                  v-for="mode in examModes"
                  :key="mode.value"
                  type="button"
                  class="rounded-sm py-1.5 text-xs font-medium transition"
                  :class="
                    examMode === mode.value
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-gray-500 active:bg-white'
                  "
                  @click="examMode = mode.value"
                >
                  {{ mode.label }}
                </button>
              </div>
            </div>

            <!-- duration -->
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-700">
                Exam Duration
              </label>

              <div class="grid grid-cols-2 gap-2">
                <label class="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                  Hours
                  <select
                    v-model.number="examDurationHours"
                    class="mt-1 w-full rounded-sm border border-gray-200 bg-gray-50 px-2 py-2 text-sm normal-case tracking-normal text-gray-700 outline-none focus:border-indigo-400 focus:bg-white"
                  >
                    <option v-for="hour in durationHours" :key="hour" :value="hour">
                      {{ String(hour).padStart(2, "0") }} hr
                    </option>
                  </select>
                </label>

                <label class="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                  Minutes
                  <select
                    v-model.number="examDurationMinutes"
                    class="mt-1 w-full rounded-sm border border-gray-200 bg-gray-50 px-2 py-2 text-sm normal-case tracking-normal text-gray-700 outline-none focus:border-indigo-400 focus:bg-white"
                  >
                    <option v-for="minute in durationMinutes" :key="minute" :value="minute">
                      {{ String(minute).padStart(2, "0") }} min
                    </option>
                  </select>
                </label>
              </div>

              <p class="mt-1 text-xs text-gray-500">
                Duration: {{ formatDurationLabel(examDuration) }}
              </p>
            </div>

            <!-- shuffle questions -->
            <label
              class="flex cursor-pointer items-center justify-between gap-2 rounded-sm bg-gray-50 p-2"
            >
              <div class="flex min-w-0 items-center gap-2">
                <Icon name="lucide:shuffle" class="h-4 w-4 shrink-0 text-indigo-600" />
                <div class="min-w-0">
                  <p class="text-sm font-medium text-gray-700">Shuffle Questions</p>
                  <p class="text-xs text-gray-400">Randomize question order</p>
                </div>
              </div>

              <input
                v-model="shuffleQuestions"
                type="checkbox"
                class="h-4 w-4 rounded-sm border-gray-300 accent-indigo-600"
              />
            </label>

            <!-- shuffle options -->
            <label
              class="flex cursor-pointer items-center justify-between gap-2 rounded-sm bg-gray-50 p-2"
            >
              <div class="flex min-w-0 items-center gap-2">
                <Icon name="lucide:list-restart" class="h-4 w-4 shrink-0 text-emerald-600" />
                <div class="min-w-0">
                  <p class="text-sm font-medium text-gray-700">Shuffle Options</p>
                  <p class="text-xs text-gray-400">Randomize answer choices</p>
                </div>
              </div>

              <input
                v-model="shuffleOptions"
                type="checkbox"
                class="h-4 w-4 rounded-sm border-gray-300 accent-indigo-600"
              />
            </label>
          </div>
        </section>
      </div>

      <!-- BOTTOM ACTION BAR -->
      <div
        class="sticky bottom-0 z-20 border-t border-gray-200 bg-white px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 sm:px-4"
      >
        <div class="mx-auto flex w-full max-w-5xl items-center gap-2">
          <button
            type="button"
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-gray-200 bg-gray-50 text-gray-500 transition active:bg-gray-200"
            title="Exam instructions"
            @click="openInstructions"
          >
            <Icon name="lucide:info" class="h-4 w-4" />
          </button>

          <div class="hidden min-w-0 shrink-0 text-xs leading-4 text-gray-500 sm:block">
            <p class="font-medium text-gray-800">{{ totalQuestions }} questions</p>
            <p>{{ selectedSubjects.length }} subject{{ selectedSubjects.length === 1 ? "" : "s" }}</p>
          </div>

          <button
            type="button"
            :disabled="isStarting"
            class="flex h-10 min-w-0 flex-1 items-center justify-center gap-2 rounded-sm bg-primary px-3 text-sm font-medium text-white transition hover:bg-primary/95 active:brightness-125 disabled:cursor-not-allowed disabled:opacity-60"
            @click="startExam"
          >
            <Icon
              :name="isStarting ? 'lucide:loader-circle' : 'lucide:play'"
              class="h-4 w-4 shrink-0"
              :class="{ 'animate-spin': isStarting }"
            />

            <span class="truncate">
              {{ isStarting ? "Preparing Exam..." : "Start Exam" }}
            </span>

            <Icon v-if="!isStarting" name="lucide:arrow-right" class="h-4 w-4 shrink-0" />
          </button>
        </div>
      </div>
      <div class=" h-20 sm:h-0 w-full"></div>
    </main>

    <!-- INSTRUCTIONS MODAL -->
    <Teleport to="body">
      <div
        v-if="showInstructions"
        class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-2 backdrop-blur-sm sm:items-center"
        @click.self="showInstructions = false"
      >
        <div class="w-full max-w-md rounded-sm border border-gray-200 bg-white p-4 shadow-2xl sm:p-5">
          <div class="mb-3 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div
                class="flex h-8 w-8 items-center justify-center rounded-sm bg-indigo-50 text-indigo-600"
              >
                <Icon name="lucide:info" class="h-4 w-4" />
              </div>

              <h2 class="text-base font-medium text-gray-900">Exam Instructions</h2>
            </div>

            <button
              type="button"
              class="flex h-7 w-7 items-center justify-center rounded-sm bg-gray-100 text-gray-500 active:bg-gray-200"
              @click="showInstructions = false"
            >
              <Icon name="lucide:x" class="h-4 w-4" />
            </button>
          </div>

          <ul class="space-y-2.5">
            <li class="flex items-start gap-2 text-sm leading-5 text-gray-600">
              <Icon name="lucide:check-circle" class="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              Select the subjects you want to practice.
            </li>

            <li class="flex items-start gap-2 text-sm leading-5 text-gray-600">
              <Icon name="lucide:calendar-days" class="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
              Choose your preferred year, topics, and question count.
            </li>

            <li class="flex items-start gap-2 text-sm leading-5 text-gray-600">
              <Icon name="lucide:clock" class="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
              Complete the examination before the timer ends.
            </li>

            <li class="flex items-start gap-2 text-sm leading-5 text-gray-600">
              <Icon name="lucide:shuffle" class="mt-0.5 h-4 w-4 shrink-0 text-purple-500" />
              You can shuffle questions and answer options.
            </li>
          </ul>

          <button
            type="button"
            class="mt-4 w-full rounded-sm bg-[#4f46e5] py-2.5 text-sm font-medium text-white transition active:brightness-90"
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

    <!-- TOPIC SELECTOR (subscribers only) -->
    <TopicSelector
      v-if="activeSubject"
      v-model="showTopicModal"
      v-model:modelTopics="activeSubject.topics"
      :topics="activeSubjectTopics"
    />

    <!-- SUBSCRIBE PROMPT -->
    <SubscribePrompt
      v-model="showSubscribe"
      :message="subscribeMessage"
      to=""
      @subscribe="goToActivation"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import subjectsdetails from "~/data/subjectdetail.js";
import { isSoftwareActivated } from "~/composables/useSoftwareSecurity";
import {
  durationToSeconds,
  formatDurationLabel,
  secondsToDuration,
} from "~/utils/examTime";
import {
  getSubjectIcon,
  getSubjectColor,
  normalizeSubjectId,
} from "~/utils/subjectMeta";

const { getQuestions, getTopicsBySubject, loadSubjects } = useQuestionSearch();

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
| Subscription
|--------------------------------------------------------------------------
| Works whether isSoftwareActivated is a ref or a plain function.
| `isSubscribed` is a reactive flag for the template (lock badge).
|--------------------------------------------------------------------------
*/


// Opens the same page as the "Activate account" button on the index page
const goToActivation = () => {
  pendingExam.value = false; // don't open the exam after the prompt closes
  appState.value.currentPage = "ACTIVATEPRODUCT";
  appState.value.showSecond = true;
};

const checkSubscribed = () => {
  try {
    const v = isSoftwareActivated;
    return !!(typeof v === "function" ? v() : v?.value);
  } catch {
    return false;
  }
};

const isSubscribed = ref(false);

const refreshSubscription = () => {
  isSubscribed.value = checkSubscribed();
};

/*
|--------------------------------------------------------------------------
| UI State
|--------------------------------------------------------------------------
*/

const menuOpen = ref(false);
const searchQuery = ref("");
const activeCategory = ref("All");
const showSubjectModal = ref(false);
const showTopicModal = ref(false);
const showInstructions = ref(false);
const showSettings = ref(false);
const activeSubject = ref(null);
const activeSubjectTopics = ref([]);
const isStarting = ref(false);

// Subscribe prompt
const showSubscribe = ref(false);
const subscribeMessage = ref(
  "Please click the button below to subscribe and get full access."
);
const pendingExam = ref(false); // exam is ready, waiting for the prompt to close

const openSubscribePrompt = (message) => {
  subscribeMessage.value = message;
  showSubscribe.value = true;
};

// When the prompt closes (Maybe later, backdrop tap, or X) open the ready exam.
// If the user tapped Subscribe, pendingExam was cleared first, so no navigation.
watch(showSubscribe, async (open) => {
  if (!open && pendingExam.value) {
    pendingExam.value = false;
    await navigateTo("/exam");
  }
});

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
    name: "English Language",
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

    // "All" is the only category in use right now
    const matchesCategory = activeCategory.value === "All";

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
  const count = subject.topics?.length || 0;

  if (!isSubscribed.value) return "All Topics (Subscribe to choose)";
  if (count === 0) return "All Topics";
  if (count === 1) return subject.topics[0];

  return `${count} Topics Selected`;
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
| Free users see the subscribe prompt. Subscribers get topics loaded from
| the questions database, so names always match the `topic` column.
|--------------------------------------------------------------------------
*/

const openTopicModal = async (subject) => {
  refreshSubscription();

  if (!isSubscribed.value) {
    openSubscribePrompt("Choosing topics is a subscriber feature. Subscribe to practice the topics you want.");
    return;
  }

  activeSubject.value = subject;

  try {
    const list = await getTopicsBySubject(subject.id);
    activeSubjectTopics.value = list.map((item) => item.topic);
  } catch (error) {
    console.error("Failed to load topics:", error);
    activeSubjectTopics.value = getSubjectDetails(subject)?.topics || [];
  }

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
| Question Picking Helpers
|--------------------------------------------------------------------------
*/

const qid = (q) => String(q.id ?? q._id);

const randomBetween = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// "all" or empty = no year filter
const yearOf = (subject) =>
  subject.year && subject.year !== "all" ? subject.year : null;

// Free users can never get past years: "all" becomes the latest year
const freeYearOf = (subject) =>
  yearOf(subject) ?? getSubjectDetails(subject)?.years?.at(-1) ?? null;

// Round-robin over topics, 2-3 questions per visit, until wanted is reached
const fillFromTopics = async ({ subject, topics, wanted, year, picked, usedIds }) => {
  let activeTopics = shuffleArray(topics);

  while (picked.length < wanted && activeTopics.length > 0) {
    const stillHasQuestions = [];

    for (const topic of activeTopics) {
      if (picked.length >= wanted) break;

      const take = Math.min(randomBetween(2, 3), wanted - picked.length);

      const rows =
        (await getQuestions({
          subject: subject.id,
          year,
          topic,
          limit: take + usedIds.size, // over-fetch, some may be picked already
        })) ?? [];

      const fresh = rows.filter((q) => !usedIds.has(qid(q))).slice(0, take);

      for (const q of fresh) {
        usedIds.add(qid(q));
        picked.push(q);
      }

      if (fresh.length === take) stillHasQuestions.push(topic);
    }

    activeTopics = shuffleArray(stillHasQuestions);
  }
};

// Subscribed: topic-spread questions, borrowing past years if still short
const pickSubscribedQuestions = async (subject, wanted) => {
  const picked = [];
  const usedIds = new Set();

  let topics = subject.topics?.length ? [...subject.topics] : [];
  if (topics.length === 0) {
    const list = await getTopicsBySubject(subject.id);
    topics = list.map((t) => t.topic);
  }

  // Pass 1: selected year
  await fillFromTopics({ subject, topics, wanted, year: yearOf(subject), picked, usedIds });

  // Pass 2: still short, so borrow from past years
  if (picked.length < wanted && yearOf(subject) !== null) {
    await fillFromTopics({ subject, topics, wanted, year: null, picked, usedIds });
  }

  return picked;
};

// Free: selected year only, never add more
const pickFreeQuestions = async (subject, wanted) =>
  (await getQuestions({
    subject: subject.id,
    year: freeYearOf(subject),
    limit: wanted,
  })) ?? [];

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
    refreshSubscription();
    const subscribed = isSubscribed.value;

    appState.value.selectedSubjects = selectedSubjects.value;

    appState.value.examSettings = {
      mode: examMode.value,
      duration: examDuration.value,
      shuffleQuestions: shuffleQuestions.value,
      shuffleOptions: shuffleOptions.value,
    };

    const examQuestions = [];
    let requested = 0;

    for (const subject of selectedSubjects.value) {
      const wanted = Number(subject.questions) || 0;
      requested += wanted;

      let subjectQuestions = subscribed
        ? await pickSubscribedQuestions(subject, wanted)
        : await pickFreeQuestions(subject, wanted);

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
      if (!subscribed) {
        openSubscribePrompt("No free questions are available for this selection. Subscribe to unlock all years and topics.");
      } else {
        alert("No questions found for the selected subjects.");
      }
      return;
    }

    appState.value.examQuestions = examQuestions;

    // Free user got fewer questions than requested: show the prompt first.
    // The exam opens when the prompt closes (see the watch on showSubscribe).
    if (!subscribed && examQuestions.length < requested) {
      pendingExam.value = true;
      openSubscribePrompt(
        `Only ${examQuestions.length} of ${requested} questions are available on the free plan. Subscribe to get the full set.`
      );
      return;
    }

    await navigateTo("/exam");
  } catch (error) {
    console.error("Failed to start exam:", error);
    alert(
      `Unable to prepare the exam. Please try again.${
        error?.message ? ` Error: ${error.message}` : ""
      }`
    );
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
  refreshSubscription();

  const savedSubjects = appState.value.selectedSubjects;

  if (savedSubjects?.length > 0) {
    selectedSubjects.value = savedSubjects.map((subject) =>
      normalizeSubjectId(subject.id ?? subject.subject ?? subject.name) ===
      "english-language"
        ? { ...subject, id: "english-language", name: "English Language" }
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
/* Responsive, app-like layout polish for phones, tablets and desktop. */
:deep(*) {
  -webkit-tap-highlight-color: transparent;
}

:deep(button),
:deep(select),
:deep(input) {
  touch-action: manipulation;
}

:deep(button:focus-visible),
:deep(select:focus-visible),
:deep(input:focus-visible) {
  outline: 2px solid rgba(79, 70, 229, 0.7);
  outline-offset: 2px;
}

@media (max-width: 380px) {
  :deep(.grid.grid-cols-2) {
    gap: 0.5rem;
  }

  :deep(select) {
    padding-left: 0.5rem;
    padding-right: 1.35rem;
  }
}

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