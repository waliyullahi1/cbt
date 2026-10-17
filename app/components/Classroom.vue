<template>
  <div
    class="flex h-full min-h-screen bg-bg w-full min-h-0 flex-col overflow-hidden bg-cover bg-center bg-no-repeat text-ink font-['Inter',system-ui,sans-serif]"
  >
    <!-- ================================================= -->
    <!-- HEADER -->
    <!-- ================================================= -->
           <div
              class="relative sm:hidden block z-10 shrink-0 sm:bg-[#0B2F6B]  bg-transparent  sm:text-white text-[#5B6E8F] sm:shadow-[0_4px_16px_rgba(11,47,107,0.25)]  shadow-[0_1px_2px_rgba(36 sm:backdrop-blur-[4px] sm:backdrop-saturate-[180%]"
            >
              <div class="flex min-h-12 items-center justify-between gap-3 sm:px-4  px-2 py-2">
                <div class="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  class="flex h-9 p-0.5 w-9 bg-primary/10 shadow-[0_2px_8px_rgba(20,49,109,0.09)] rounded-full bg-primry   shrink-0 items-center justify-center  active:bg-white/10"
                  aria-label="Open menu"
                  @click="menuOpen = true"
                >
                  <img src="/images/logos.svg"   class=" w"  >
                </button>
                  <span
                    class="sm:flex hidden  sm:h-10 sm:w-10 w-8 h-8 shrink-0 items-center justify-center rounded-xl bg-[#0A6CFF] shadow-[0_4px_10px_rgba(10,108,255,0.45)]"
                  >
                    <Icon name="lucide:book-marked" class="sm:h-5 h-3 w-3 sm:w-5" />
                  </span>

                  <div class="min-w-0">
                    <h1 class="truncate  text-[15px] font-bold leading-tight tracking-tight">
                      Classroom
                    </h1>
                    <p class="mt-0.5 truncate font-bold  text-[11px]  leading-tight  sm:text-white/65">
                     Learn . Practice . Succeed
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  class="flex sm:h-11 h-9 w-9 sm:w-11 shrink-0 items-center justify-center rounded-full sm:bg-[#0A6CFF] bg-white sm:shadow-[0_4px_10px_rgba(10,108,255,0.45)] shadow-[0_1px_2px_rgba(36,48,74,0.04)] transition active:scale-95"
                  aria-label="Go home"
                  @click="goHome"
                >
                  <Icon name="lucide:house" class="h-5  w-5" />
                </button>
              </div>
            </div>
    <header
      class="flex flex-col  gap-3 sm:bg-primary  bg-white s4 px-2 py-3 sm:text-white text-black sm:shadow-md sm:px-6"
    >
      <!-- title row -->
      <div class="flex items-center justify-between">
        <div class=" hidden sm:flex items-center gap-3">
          <div
            class="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10"
          >
            <Icon name="lucide:school" class="h-5 w-5" />
          </div>
          <h1
            class="  text-base font-semibold sm:text-lg"
          >
            Classroom
          </h1>
        </div>

        <button
          type="button"
          class="sm:flex hidden h-9 w-9 items-center justify-center rounded-lg transition hover:bg-white/10"
          @click="goHome"
        >
          <Icon name="lucide:house" class="h-5 w-5" />
        </button>
      </div>

      <!-- action row -->

       <div
        
          class="m flex w-full sm:hidden bg-[#0A6CFF]/10 rounded-lg px-1 py-2 items-center justify-between gap-3 px-1"
        >
          <div class="flex min-w-0  items-center gap-3">
          <div class="  h-10 w-10  flex  justify-center items-center bg-[#0A6CFF]/20 rounded-full">
          <Icon name="lucide:user-round" class="  text-xl font-bold shrink-0 text-[#0B2F6B]" />
          </div>
            
            <div class="min-w-0">
              <p class="text-[11px] font-bold tracking-widest text-[#0A6CFF] sm:text-[10px]">
               Welcome back, 
              </p>
              <input
            v-model="appState.currentsuser"
            list="classroom-users"
            placeholder="Select user"
            class="w-32   sm:bg-transparent   text-sm font-medium sm:text-white text-black outline-none p sm:w-40"
          />
          <datalist id="classroom-users">
            <option v-for="u in appState.users || []" :key="u" :value="u" />
          </datalist>
            </div>
          </div>

          <button
          type="button"
          class="flex items-center whitespace-nowrap gap-1.5 sm:bg-none bg-red-400 rounded-full bg-gold px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
          @click="showAddUser = true"
        >
          <Icon name="lucide:user-plus" class="h-3.5 w-3.5" />
          Add User
        </button>
        </div>
      <div class="sm:flex  grid grid-cols-2 flex-wrap justify-between items-center gap-2">
        
      
        <!-- user select -->
        <div class="flex sm:block hidden items-center gap-2 rounded-lg sm:bg-white/10   bg-slate-200 px-3 py-1.5">
          <Icon name="lucide:user-round" class="h-4 w-4 text-black sm:text-white/70" />
          <input
            v-model="appState.currentsuser"
            list="classroom-users"
            placeholder="Select user"
            class="w-32   sm:bg-transparent   text-sm font-medium sm:text-white text-black outline-none placeholder:text-white/50 sm:w-40"
          />
          <datalist id="classroom-users">
            <option v-for="u in appState.users || []" :key="u" :value="u" />
          </datalist>
        </div>

        <button
          type="button"
          class="sm:flex hidden  items-center gap-1.5 sm:bg-none bg-amber-900 rounded-full bg-gold px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
          @click="showAddUser = true"
        >
          <Icon name="lucide:user-plus" class="h-3.5 w-3.5" />
          Add User
        </button>

        <button
          type="button"
          class="flex items-center gap-1.5 rounded-full  sm:bg-none bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
          @click="openSubjectPicker"
        >
          <Icon name="lucide:refresh-cw" class="h-3.5 w-3.5" />
          Set Subject
        </button>

        <button
          type="button"
          class="ml-auto flex sm:bg-none bg-secondary items-center gap-1.5 rounded-full  px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
          @click="showStudyPlan = true"
        >
          <Icon name="lucide:layout-grid" class="h-3.5 w-3.5" />
          Study Plan
        </button>
      </div>
    </header>

       

    <!-- ================================================= -->
    <!-- MAIN -->
    <!-- ================================================= -->


<!-- ================================================= -->
<!-- MAIN -->
<!-- ================================================= -->

<!-- ================================================= -->
<!-- MAIN: RESPONSIVE CLASSROOM SUBJECTS -->
<!-- ================================================= -->

<main class=" h-lvh flex-1 bg-white overflow-y-auto px-2 py-6 sm:px-6 lg:px-4">

  <!-- EMPTY STATE -->
  <div
    v-if="!studySubjects.length"
    class="flex min-h-[60vh] flex-col items-center justify-center text-center"
  >
    <div
      class="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-line bg-surface text-primary"
    >
      <Icon name="lucide:book-open" class="h-7 w-7" />
    </div>

    <h2 class="text-base font-semibold text-navy sm:text-lg">
      No subjects yet
    </h2>

    <p class="mt-1 max-w-xs text-xs text-ink-soft sm:text-sm">
      Tap "Set Subject" above to build {{ currentUser }}'s classroom.
    </p>

    <button
      type="button"
      class="mt-5 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white transition hover:opacity-90 sm:text-sm"
      @click="openSubjectPicker"
    >
      Set Subject
    </button>
  </div>

  <!-- SUBJECTS -->
  <section v-else class="mx-auto w-full max-w-5xl">

    <!-- SECTION HEADING -->
    <div class="mb-3 sm:mb-4">
      <div class="flex items-center gap-1">
       <div class="flex-shrink-0 bg-amber-300  sm:h-9 sm:w-9 h-7 w-7 flex justify-center items-center rounded-full " > <Icon
          name="lucide:book-open"
          class=" shrink-0 text-navy "
        />
       </div>
        <div>
          <h2 class="text-sm font-bold tracking-tight  ">
            Your Study Subjects
          </h2>
          <p class=" text-xs   ">
          Track your learning progress.
          </p>
        </div>
       
      </div>

     
    </div>

    <!-- SUBJECT CARD GRID -->
    <div class="grid grid-cols-1 gap-2 sm:grid-cols-3">

      <article
        v-for="(subject, index) in studySubjects"
        :key="subject.id"
        class="relative min-w-0 overflow-hidden rounded-lg border border-blue-100 sm:bg-white p-2 shadow-[0_5px_20px_rgba(36,48,74,0.06)] transition hover:shadow-[0_8px_24px_rgba(36,48,74,0.10)] sm:rounded-2xl sm:p-3"
      >

        <!-- SUBJECT NUMBER -->
        <div class=" flex justify-between">
         <span
          class=" w-7 h-7  text-center flex justify-center  items-center rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-primary sm:left-5 sm:top-5 sm:px-3 sm:text-xs"
        >
          #{{ index + 1 }}
        </span>

         <div
          class=" 3 flex shrink-0 items-center justify-center sm:static sm:ml-2"
        >
          <ProgressRing :percent="getSubjectProgress(subject.id)" />
        </div>
        </div>
       

        <!-- PROGRESS RING: TOP RIGHT ON MOBILE -->
       

        <!-- SUBJECT DETAILS -->
        <div class="flex min-w-0 items-start gap-3 pt-2 sm:gap-4 sm:pt-4">

          <!-- SUBJECT ICON -->
          <div
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full "
            :class="
              index % 2 === 0
                ? 'bg-blue-100 text-blue-600'
                : 'bg-violet-100 text-violet-600'
            "
          >
            <Icon
              :name="subject.icon || 'lucide:book-open'"
              class="h-8 w-8 "
              stroke-width="1.8"
            />
          </div>

          <!-- TITLE, PROGRESS TEXT AND BUTTON -->
          <div class="min-w-0 flex-1 pr- sm:pr-0">

            <h3
              class="break-words text-sm font-bold leading-snug  "
            >
              {{ subject.name }}
            </h3>

            <p class="mt text-xs leading-relaxed  sm:text-sm">
              {{ subject.topics?.length || 0 }}
              {{ subject.topics?.length === 1 ? 'topic' : 'topics' }} available
            </p>
           <button
              type="button"
              class="mt-3 inline-flex min-h-9 w-full max-w-[250px] items-center justify-center gap-1.5 rounded-xl bg-blue-50 px-2.5 py-2 text-xs font-bold text-primary transition hover:bg-blue-100 active:scale-[0.98] sm:mt-4 sm:min-h-11 sm:gap-2 sm:px-3 sm:py-2.5 sm:text-sm"
              @click="openSubject(subject)"
            >
              <span>Start learning</span>

              <Icon
                name="lucide:arrow-right"
                class="h-4 w-4 shrink-0 sm:h-5 sm:w-5"
              />
            </button>
           

          </div>

          
        </div>
      </article>
    </div>
  </section>
</main>



    <!-- ================================================= -->
    <!-- ADD USER MODAL -->
    <!-- ================================================= -->

    <Teleport to="body">
      <div
        v-if="showAddUser"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 backdrop-blur-sm"
      >
        <div
          class="w-full max-w-sm rounded-lg border border-line bg-white p-2 shadow-2xl"
        >
          <div class="mb-4 flex items-center justify-between">
            <h2
              class=" sm:text-lg font-semibold text-navy"
            >
              Add User
            </h2>
            <button
              class="flex h-8 w-8 items-center justify-center rounded-full bg-bg text-black hover:bg-line"
              @click="closeAddUser"
            >
              <Icon name="lucide:x" class="h-4 w-4" />
            </button>
          </div>

          <label class="mb-1.5 block text-xs font-semibold text-ink-soft"
            >Name</label
          >
          <input
            v-model="newUserName"
            type="text"
            placeholder="e.g. Fatima"
            class="w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm outline-none focus:border-navy-soft focus:ring-2 focus:ring-navy-soft/15"
            @keydown.enter="confirmAddUser"
          />

          <button
            type="button"
            class="mt-4 w-full border border-gray-300 bg-gray-50 rounded-xl bg-navy py-2.5 text-sm font-semibold texe transition hover:opacity-90"
            @click="confirmAddUser"
          >
            Add & Switch
          </button>
        </div>
      </div>
    </Teleport>

    <!-- ================================================= -->
    <!-- STUDY PLAN MODAL -->
    <!-- ================================================= -->

    <Teleport to="body">
      <div
        v-if="showStudyPlan"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 backdrop-blur-sm"
      >
        <div
          class="w-full max-w-md rounded-lg border border-line bg-white p-3 shadow-2xl"
        >
          <div class="mb-4 flex items-center justify-between">
            <div>
              <h2
                class=" text-lg font-semibold text-navy"
              >
                Study Plan
              </h2>
              <p class="text-xs text-ink-soft">
                {{ currentUser }}'s subject order
              </p>
            </div>
            <button
              class="flex h-8 w-8 items-center justify-center rounded-full bg-bg text-ink-soft hover:bg-line"
              @click="showStudyPlan = false"
            >
              <Icon name="lucide:x" class="h-4 w-4" />
            </button>
          </div>

          <ul
            v-if="studySubjects.length"
            class="max-h-80 space-y-2 overflow-y-auto"
          >
            <li
              v-for="(subject, index) in studySubjects"
              :key="subject.id"
              class="flex items-center gap-2 rounded-lg  bg-gray-200 bg-bg px-3 py-2"
            >
              <span
                class="w-5 shrink-0 text-center font-['IBM_Plex_Mono',monospace] text-xs font-semibold text-ink-soft"
              >
                {{ index + 1 }}
              </span>
              <Icon
                :name="subject.icon || 'lucide:book-open'"
                class="h-4 w-4 shrink-0 text-gold"
              />
              <span class="flex-1 truncate text-sm font-medium text-ink">{{
                subject.name
              }}</span>

              <button
                class="flex h-6 w-6 items-center justify-center rounded text-ink-soft hover:bg-line disabled:opacity-30"
                :disabled="index === 0"
                @click="reorderSubject(subject.id, 'up')"
              >
                <Icon name="lucide:chevron-up" class="h-3.5 w-3.5" />
              </button>
              <button
                class="flex h-6 w-6 items-center justify-center rounded text-ink-soft hover:bg-line disabled:opacity-30"
                :disabled="index === studySubjects.length - 1"
                @click="reorderSubject(subject.id, 'down')"
              >
                <Icon name="lucide:chevron-down" class="h-3.5 w-3.5" />
              </button>
              <button
                class="flex h-6 w-6 items-center justify-center rounded text-bad hover:bg-bad-bg"
                @click="removeSubject(subject.id)"
              >
                <Icon name="lucide:trash-2" class="h-3.5 w-3.5" />
              </button>
            </li>
          </ul>
          <p v-else class="py-6 text-center text-sm text-ink-soft">
            No subjects added yet.
          </p>

          <button
            type="button"
            class="mt-4 w-full rounded-lg border border-line bg-bg py-2.5 text-sm font-semibold text-navy transition hover:bg-line"
            @click="
              showStudyPlan = false;
              showSubjectModal = true;
            "
          >
            + Add More Subjects
          </button>
        </div>
      </div>
    </Teleport>

    <!-- ================================================= -->
    <!-- SET SUBJECT (reuses your existing SelectSubject) -->
    <!-- ================================================= -->

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
========================================================= */

onMounted(() => {
  loadClassroom();
  loadAllProgress();
  loadLessonProgress()
  void loadAvailableSubjects()
});

/* =========================================================
   WHEN USER CHANGES, LOAD THAT USER'S SUBJECTS
========================================================= */

watch(
  () => appState.currentsuser,
  () => {
    loadClassroom();
    loadAllProgress();
  }
);

/* =========================================================
   WHEN SUBJECTS CHANGE, UPDATE TOTALS
========================================================= */

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
========================================================= */

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
========================================================= */

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
========================================================= */

const goHome = () => {
  emit("gohome");
};


onMounted(async () => {
  // Load progress saved from the lesson page
  loadLessonProgress()})
</script>
<style scoped>

</style>
