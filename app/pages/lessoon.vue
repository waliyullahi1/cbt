<template>
  <div class="classroom-page min-h-screen w-full overflow-x-hidden text-ink">
    <!-- APP HEADER -->
    <header class="classroom-header text-white">
      <div class="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between gap-3">
          <div class="flex min-w-0 items-center gap-3">
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500 shadow-sm shadow-blue-950/20">
              <Icon name="lucide:graduation-cap" class="h-6 w-6" />
            </div>
            <h1 class="truncate text-xl font-bold tracking-tight sm:text-2xl">ExamTips</h1>
          </div>

          <div class="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              class="relative flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-white/10"
              aria-label="Notifications"
            >
              <Icon name="lucide:bell" class="h-5 w-5 sm:h-6 sm:w-6" />
              <span class="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-none">2</span>
            </button>
            <button
              type="button"
              class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 transition hover:bg-blue-400"
              aria-label="Go home"
              @click="goHome"
            >
              <Icon name="lucide:user-round" class="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="mx-auto w-full max-w-6xl px-4 pb-10 pt-5 sm:px-6 sm:pt-7 lg:px-8">
      <!-- CLASSROOM CONTROLS -->
      <section class="control-panel mb-7 rounded-3xl p-4 shadow-sm sm:p-6 lg:p-7">
        <div class="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-2 text-sm font-bold text-blue-700 sm:text-base">
          <span class="flex h-7 w-7 items-center justify-center rounded-full bg-white text-blue-600">
            <Icon name="lucide:graduation-cap" class="h-4 w-4" />
          </span>
          Class 10/SS1
        </div>

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <label class="flex min-w-0 items-center gap-3 rounded-2xl border-2 border-blue-100 bg-white px-4 py-3.5 text-[#234675] transition focus-within:border-blue-400">
            <Icon name="lucide:user-round" class="h-5 w-5 shrink-0" />
            <input
              v-model="appState.currentsuser"
              list="classroom-users"
              placeholder="Select user"
              aria-label="Select user"
              class="min-w-0 flex-1 bg-transparent text-base font-semibold outline-none placeholder:text-slate-500"
            />
            <Icon name="lucide:chevron-down" class="h-5 w-5 shrink-0" />
            <datalist id="classroom-users">
              <option v-for="u in appState.users || []" :key="u" :value="u" />
            </datalist>
          </label>

          <button
            type="button"
            class="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600 active:scale-[0.99] sm:min-w-40 sm:text-base"
            @click="showAddUser = true"
          >
            <Icon name="lucide:user-round-plus" class="h-5 w-5" />
            Add User
          </button>
        </div>

        <div class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            class="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99] sm:text-base"
            @click="openSubjectPicker"
          >
            <Icon name="lucide:settings" class="h-5 w-5" />
            Set Subject
          </button>
          <button
            type="button"
            class="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-600 active:scale-[0.99] sm:text-base"
            @click="showStudyPlan = true"
          >
            <Icon name="lucide:calendar-days" class="h-5 w-5" />
            Study Plan
          </button>
        </div>
      </section>

      <!-- SECTION HEADING -->
      <section class="mb-5 flex items-start gap-3 sm:mb-6 sm:gap-4">
        <div class="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center text-blue-900 sm:h-12 sm:w-12">
          <Icon name="lucide:book-open" class="h-9 w-9 sm:h-11 sm:w-11" stroke-width="1.7" />
        </div>
        <div class="min-w-0">
          <h2 class="text-2xl font-extrabold leading-tight tracking-tight text-blue-950 sm:text-3xl">Your Study Subjects</h2>
          <p class="mt-1.5 text-base leading-relaxed text-slate-500 sm:text-lg">Track your learning progress.</p>
        </div>
      </section>

      <!-- EMPTY STATE -->
      <section
        v-if="!studySubjects.length"
        class="rounded-3xl border border-blue-50 bg-white px-5 py-12 text-center shadow-sm sm:py-16"
      >
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <Icon name="lucide:book-open" class="h-8 w-8" />
        </div>
        <h3 class="text-lg font-bold text-blue-950">No subjects yet</h3>
        <p class="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500 sm:text-base">
          Tap “Set Subject” above to build {{ currentUser }}'s classroom.
        </p>
        <button
          type="button"
          class="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
          @click="openSubjectPicker"
        >
          Set Subject
        </button>
      </section>

      <!-- SUBJECT CARDS -->
      <section v-else class="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
        <article
          v-for="(subject, index) in studySubjects"
          :key="subject.id"
          class="subject-card relative min-w-0 rounded-3xl p-5 shadow-[0_6px_24px_rgba(30,91,150,0.08)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(30,91,150,0.12)] sm:p-6"
        >
          <span class="absolute left-5 top-5 inline-flex min-w-12 items-center justify-center rounded-full bg-blue-100 px-3 py-1.5 text-sm font-extrabold text-blue-600 sm:left-6 sm:top-6">
            #{{ index + 1 }}
          </span>

          <div class="grid grid-cols-[76px_minmax(0,1fr)_56px] items-center gap-3 pt-9 sm:grid-cols-[96px_minmax(0,1fr)_76px] sm:gap-5 sm:pt-8">
            <div
              class="flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-full sm:h-24 sm:w-24"
              :class="index % 2 === 0 ? 'bg-blue-100 text-blue-600' : 'bg-violet-100 text-violet-600'"
            >
              <Icon :name="subject.icon || 'lucide:book-open'" class="h-10 w-10 sm:h-12 sm:w-12" stroke-width="1.8" />
            </div>

            <div class="min-w-0 self-center">
              <h3 class="break-words text-lg font-extrabold leading-snug text-blue-950 sm:text-2xl">
                {{ subject.name }}
              </h3>
              <p class="mt-1.5 text-sm leading-relaxed text-slate-500 sm:text-base">
                Track your progress
              </p>
              <button
                type="button"
                class="mt-4 inline-flex min-h-11 w-full max-w-[250px] items-center justify-center gap-2 rounded-2xl bg-blue-50 px-3 py-2.5 text-sm font-bold text-blue-600 transition hover:bg-blue-100 sm:text-base"
                @click="openSubject(subject)"
              >
                Start learning
                <Icon name="lucide:arrow-right" class="h-5 w-5 shrink-0" />
              </button>
            </div>

            <div class="flex items-center justify-center">
              <ProgressRing :percent="getSubjectProgress(subject.id)" />
            </div>
          </div>
        </article>
      </section>
    </main>

    <!-- ADD USER MODAL -->
    <Teleport to="body">
      <div
        v-if="showAddUser"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
        @click.self="closeAddUser"
      >
        <div class="w-full max-w-sm rounded-3xl border border-blue-50 bg-white p-5 shadow-2xl sm:p-6">
          <div class="mb-5 flex items-center justify-between">
            <h2 class="text-lg font-bold text-blue-950">Add User</h2>
            <button
              type="button"
              class="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
              aria-label="Close"
              @click="closeAddUser"
            >
              <Icon name="lucide:x" class="h-5 w-5" />
            </button>
          </div>
          <label class="mb-2 block text-sm font-semibold text-slate-600">Name</label>
          <input
            v-model="newUserName"
            type="text"
            placeholder="e.g. Fatima"
            class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-base outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
            @keydown.enter="confirmAddUser"
          />
          <button
            type="button"
            class="mt-4 w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
            @click="confirmAddUser"
          >
            Add & Switch
          </button>
        </div>
      </div>
    </Teleport>

    <!-- STUDY PLAN MODAL -->
    <Teleport to="body">
      <div
        v-if="showStudyPlan"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
        @click.self="showStudyPlan = false"
      >
        <div class="w-full max-w-md rounded-3xl border border-blue-50 bg-white p-5 shadow-2xl sm:p-6">
          <div class="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 class="text-lg font-bold text-blue-950">Study Plan</h2>
              <p class="mt-1 text-sm text-slate-500">{{ currentUser }}'s subject order</p>
            </div>
            <button
              type="button"
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
              aria-label="Close study plan"
              @click="showStudyPlan = false"
            >
              <Icon name="lucide:x" class="h-5 w-5" />
            </button>
          </div>

          <ul v-if="studySubjects.length" class="max-h-80 space-y-2 overflow-y-auto">
            <li
              v-for="(subject, index) in studySubjects"
              :key="subject.id"
              class="flex min-w-0 items-center gap-2 rounded-xl border border-blue-50 bg-slate-50 px-3 py-2.5"
            >
              <span class="w-6 shrink-0 text-center text-sm font-bold text-slate-500">{{ index + 1 }}</span>
              <Icon :name="subject.icon || 'lucide:book-open'" class="h-5 w-5 shrink-0 text-blue-600" />
              <span class="min-w-0 flex-1 truncate text-sm font-semibold text-slate-700">{{ subject.name }}</span>
              <button
                type="button"
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-blue-100 disabled:opacity-30"
                :disabled="index === 0"
                aria-label="Move subject up"
                @click="reorderSubject(subject.id, 'up')"
              >
                <Icon name="lucide:chevron-up" class="h-4 w-4" />
              </button>
              <button
                type="button"
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-blue-100 disabled:opacity-30"
                :disabled="index === studySubjects.length - 1"
                aria-label="Move subject down"
                @click="reorderSubject(subject.id, 'down')"
              >
                <Icon name="lucide:chevron-down" class="h-4 w-4" />
              </button>
              <button
                type="button"
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-rose-500 transition hover:bg-rose-50"
                aria-label="Remove subject"
                @click="removeSubject(subject.id)"
              >
                <Icon name="lucide:trash-2" class="h-4 w-4" />
              </button>
            </li>
          </ul>
          <p v-else class="py-6 text-center text-sm text-slate-500">No subjects added yet.</p>

          <button
            type="button"
            class="mt-5 w-full rounded-xl border border-blue-100 bg-blue-50 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
            @click="showStudyPlan = false; showSubjectModal = true"
          >
            + Add More Subjects
          </button>
        </div>
      </div>
    </Teleport>

    <!-- SUBJECT PICKER -->
    <SelectSubject
      v-model="showSubjectModal"
      v-model:modelSubjects="studySubjects"
      :subjects="availableSubjects"
      :subjects-loading="availableSubjectsLoading"
      :subjects-error="availableSubjectsError"
      count-label="lessons"
    />
  </div>
</template>

<script setup lang="ts">

import { ref, computed, onMounted, watch } from "vue";

import platform from "~/platforms";



const emit = defineEmits(["gohome", "open-subject"]);



const appState = useAppState();



const {

  currentUser,

  studySubjects,

  availableSubjects,

  availableSubjectsLoading,

  availableSubjectsError,

  loadAvailableSubjects,

  removeSubject,

  reorderSubject,

  addUser,

  loadClassroom,

  loadAllProgress,

  progressFor,

  overallProgress,

  totalLessons,

  completedLessons,

} = useClassroom();

const {

  loadLessonProgress,

  getSubjectProgress,

  getLastReadLessonSlug,

} = useLessonProgress()



const showAddUser = ref(false);

const showSubjectModal = ref(false);

const showStudyPlan = ref(false);



const newUserName = ref("");



/* =========================================================

   INITIALIZE CLASSROOM

\========================================================= */



onMounted(() => {

  loadClassroom();

  loadAllProgress();

  loadLessonProgress()

  void loadAvailableSubjects()

});



/* =========================================================

   WHEN USER CHANGES, LOAD THAT USER'S SUBJECTS

\========================================================= */



watch(

  () => appState.currentsuser,

  () => {

    loadClassroom();

    loadAllProgress();

  }

);



/* =========================================================

   WHEN SUBJECTS CHANGE, UPDATE TOTALS

\========================================================= */



watch(

  studySubjects,

  () => {

    loadAllProgress();

  },

  {

    deep: true,

  }

);



/* =========================================================

   ADD USER

\========================================================= */



const confirmAddUser = () => {

  const success = addUser(newUserName.value);



  if (!success) return;



  newUserName.value = "";

  showAddUser.value = false;

};



const closeAddUser = () => {

  newUserName.value = "";

  showAddUser.value = false;

};



const openSubjectPicker = async () => {

  showSubjectModal.value = true

  await loadAvailableSubjects()

}



/* =========================================================

   OPEN SUBJECT

\========================================================= */



const openSubject = async (subject: any) => {

  if (!subject?.slug && !subject?.id) return;



  const subjectSlug = String(subject.slug || subject.id);

  let lastReadLessonSlug: string | null = null;



  try {

    loadLessonProgress();

    const lessonSubject = await platform.lesson.getSubject(subjectSlug);

    const availableLessons = (lessonSubject?.topics || []).flatMap(

      (topic: any) => topic.lessons || [],

    );



    lastReadLessonSlug = getLastReadLessonSlug(

      subjectSlug,

      availableLessons,

    );

  } catch (error) {

    console.error("Failed to resolve the last-read lesson:", error);

  }



  const destination = lastReadLessonSlug

    ? `/learning/${encodeURIComponent(subjectSlug)}/${encodeURIComponent(lastReadLessonSlug)}`

    : `/learning/${encodeURIComponent(subjectSlug)}`;



  await navigateTo(destination);

};



/* =========================================================

   GO HOME

\========================================================= */



const goHome = () => {

  emit("gohome");

};





onMounted(async () => {

  // Load progress saved from the lesson page

  loadLessonProgress()})

</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;600;700;800&display=swap");

.classroom-page {
  background: #f3f9ff;
  background-image:
    radial-gradient(circle at 8% 26%, rgba(147, 197, 253, 0.13) 0 2px, transparent 3px),
    radial-gradient(circle at 92% 44%, rgba(147, 197, 253, 0.12) 0 2px, transparent 3px),
    linear-gradient(180deg, #f8fcff 0%, #eff7ff 100%);
  font-family: "Roboto", Arial, sans-serif;
}

.classroom-header {
  background: linear-gradient(110deg, #103f79 0%, #0a3268 58%, #07316a 100%);
}

.control-panel {
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(219, 234, 254, 0.9);
}

.subject-card {
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(255, 255, 255, 0.95);
}

.classroom-page button,
.classroom-page input {
  -webkit-tap-highlight-color: transparent;
}

@media (max-width: 380px) {
  .subject-card {
    padding: 1rem;
  }
}
</style>