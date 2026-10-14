<template>
  <div class="flex h-full min-h-0 flex-col overflow-hidden bg-[#f6f3ec] text-[#201f22] font-['Inter',system-ui,sans-serif]">

    <!-- ================================================= -->
    <!-- HEADER -->
    <!-- ================================================= -->

    <header
      class="flex h-14 shrink-0 items-center justify-between
             bg-[#24304a] px-4 text-[#f4efe2] shadow-[0_1px_0_rgba(0,0,0,0.08)] sm:px-6"
    >
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
          <Icon name="lucide:graduation-cap" class="h-5 w-5" />
        </div>
        <div>
          <h1 class="font-['Fraunces',Georgia,serif] text-sm font-semibold tracking-wide sm:text-base">
            Practice for UTME
          </h1>
          <p class="hidden text-xs text-white/60 sm:block">
            Select your subjects and start practicing
          </p>
        </div>
      </div>

      <button
        type="button"
        @click="goHome"
        class="group flex h-10 w-10 items-center justify-center rounded-xl
               transition hover:bg-white/10"
        title="Go Home"
      >
        <Icon name="lucide:house" class="h-5 w-5 transition-transform group-hover:scale-110" />
      </button>
    </header>

    <!-- ================================================= -->
    <!-- MAIN -->
    <!-- ================================================= -->

    <main class="min-h-0 flex-1 overflow-y-auto px-3 pb-24 pt-4 sm:px-6">

      <!-- ================================================= -->
      <!-- TOP CONTROL BAR -->
      <!-- ================================================= -->

      <section
        class="mb-4 flex flex-col gap-4 rounded-xl border border-[#e6e0d2]
               bg-[#fffdf8] p-3 shadow-[0_1px_2px_rgba(36,48,74,0.05)]
               sm:p-4 md:flex-row md:items-center md:justify-between"
      >
        <!-- Select subjects -->
        <div class="flex items-center gap-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f6f3ec] text-[#b9873b]">
            <Icon name="lucide:layers-3" class="h-5 w-5" />
          </div>

          <button
            type="button"
            @click="openSubjectModal()"
            class="rounded-lg bg-[#24304a] px-4 py-2 text-sm font-semibold text-[#f4efe2]
                   transition hover:opacity-90 active:scale-95"
          >
            Select Subject
          </button>
        </div>

        <!-- User + Start -->
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div class="flex items-center gap-2">
            <Icon name="lucide:user-round" class="h-4 w-4 text-[#6b665c]" />
            <label for="user" class="text-sm font-medium text-[#6b665c]">User</label>

            <input
              id="user"
              v-model="appState.currentsuser"
              list="subjects"
              class="rounded-lg border border-[#e6e0d2] bg-[#fffdf8] px-3 py-1.5
                     text-sm font-medium text-[#201f22] outline-none transition
                     focus:border-[#3c4c6e] focus:ring-2 focus:ring-[#3c4c6e]/15"
            />

            <datalist id="subjects">
              <option
                v-for="option in appState.users || []"
                :key="option"
                :value="option"
              />
            </datalist>
          </div>

          <button
            type="button"
            @click="startExam"
            class="flex items-center justify-center gap-2 rounded-lg bg-[#b9873b]
                   px-5 py-2 text-sm font-semibold text-white shadow-sm
                   transition hover:opacity-90 active:scale-95"
          >
            <Icon name="lucide:play" class="h-4 w-4" />
            Start Exam
          </button>
        </div>
      </section>

      <!-- ================================================= -->
      <!-- SUBJECT GRID -->
      <!-- ================================================= -->

      <section class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">

        <!-- SUBJECT CARD -->
        <article
          v-for="subject in selectedSubjects"
          :key="subject.id"
          class="group relative overflow-hidden rounded-xl border border-[#e6e0d2]
                 bg-[#fffdf8] shadow-[0_1px_2px_rgba(36,48,74,0.04)] transition
                 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-14px_rgba(36,48,74,0.25)]"
        >
          <!-- Card Header -->
          <div class="flex items-center justify-between border-b border-dashed border-[#e6e0d2] bg-[#f8f6ef] px-4 py-3">
            <div class="flex items-center gap-3">
              <div
                class="flex h-8 w-8 items-center justify-center rounded-lg"
                :class="subject.iconBg || 'bg-[#f6f3ec]'"
              >
                <Icon :name="subject.icon" class="h-4 w-4" :class="subject.iconColor || 'text-[#b9873b]'" />
              </div>

              <div>
                <h3 class="font-['Fraunces',Georgia,serif] text-base font-semibold text-[#24304a]">
                  {{ subject.name }}
                </h3>
                <p v-if="subject.description" class="text-xs text-[#6b665c]">
                  {{ subject.description }}
                </p>
              </div>
            </div>

            <!-- Selected checkbox -->
            <button
              type="button"
              @click="toggleSubject(subject)"
              class="flex h-5 w-5 items-center justify-center rounded-full transition"
              :class="isSelected(subject)
                ? 'bg-[#24304a] text-white'
                : 'bg-[#f6f3ec] text-[#6b665c]'"
            >
              <Icon :name="isSelected(subject) ? 'lucide:minus' : 'lucide:plus'" class="h-3.5 w-3.5" />
            </button>
          </div>

          <!-- Card Body -->
          <div class="space-y-3 p-4">

            <!-- YEAR -->
            <div class="flex items-center gap-3">
              <label class="flex w-16 shrink-0 items-center gap-1.5 text-xs font-semibold text-[#6b665c]">
                <Icon name="lucide:calendar-days" class="h-3.5 w-3.5 text-[#3c4c6e]" />
                Year
              </label>

              <div class="relative w-full">
                <select
                  v-model="subject.year"
                  class="w-full appearance-none rounded-lg border border-[#e6e0d2]
                         bg-[#f6f3ec] px-3 py-1.5 font-['IBM_Plex_Mono',monospace] text-xs
                         font-medium text-[#201f22] outline-none transition
                         focus:border-[#3c4c6e] focus:bg-[#fffdf8] focus:ring-2 focus:ring-[#3c4c6e]/15"
                >
                  <option value="all">All</option>
                  <option v-for="year in getSubjectDetails(subject)?.years" :key="year" :value="year">
                    {{ year }}
                  </option>
                </select>
                <Icon
                  name="lucide:chevron-down"
                  class="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b665c]"
                />
              </div>
            </div>

            <!-- QUESTIONS -->
            <div class="flex items-center gap-3">
              <label class="flex w-16 shrink-0 items-center gap-1.5 text-xs font-semibold text-[#6b665c]">
                <Icon name="lucide:list-ordered" class="h-3.5 w-3.5 text-[#3f7a5c]" />
                Count
              </label>

              <div class="relative w-full">
                <select
                  v-model="subject.questions"
                  class="w-full appearance-none rounded-lg border border-[#e6e0d2]
                         bg-[#f6f3ec] px-3 py-1.5 font-['IBM_Plex_Mono',monospace] text-xs
                         font-medium text-[#201f22] outline-none transition
                         focus:border-[#3c4c6e] focus:bg-[#fffdf8] focus:ring-2 focus:ring-[#3f7a5c]/15"
                >
                  <option v-for="number in subject.questionOptions" :key="number" :value="number">
                    {{ number }} Questions
                  </option>
                </select>
                <Icon
                  name="lucide:chevron-down"
                  class="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b665c]"
                />
              </div>
            </div>

            <!-- TOPIC -->
            <div class="flex items-center justify-between rounded-lg border border-[#e6e0d2] bg-[#f6f3ec] px-3 py-2">
              <div class="flex items-center gap-1.5 text-xs font-semibold text-[#6b665c]">
                <Icon name="lucide:folder-open" class="h-3.5 w-3.5 text-[#3f7a5c]" />
                Topic
                <span class="rounded-full bg-[#fffdf8] px-2 py-0.5 text-[10px] font-semibold text-[#b9873b]">
                  {{
                    !subject.topics ||
                    subject.topics.length === 0 ||
                    subject.topics.length === getSubjectDetails(subject)?.topics?.length
                      ? "All"
                      : `${subject.topics.length} Topics`
                  }}
                </span>
              </div>

              <button
                type="button"
                @click="openTopicModal(subject)"
                class="flex h-7 w-7 items-center justify-center rounded-full
                       bg-[#e7f0e8] text-[#3f7a5c] transition hover:bg-[#3f7a5c] hover:text-white"
                title="Edit Topic"
              >
                <Icon name="lucide:pencil" class="h-3.5 w-3.5" />
              </button>

              <TopicSelector
                v-if="activeSubject"
                v-model="showTopicModal"
                v-model:modelTopics="activeSubject.topics"
                :topics="getSubjectDetails(activeSubject)?.topics || []"
              />
            </div>

          </div>
        </article>

      </section>

    </main>

    <!-- ================================================= -->
    <!-- EXAM OPTIONS (footer) -->
    <!-- ================================================= -->

    <section class="shrink-0 border-t border-[#e6e0d2] bg-[#fffdf8] px-3 py-3 sm:px-6">

      <div class="mb-3 flex items-center gap-2">
        <div class="h-px flex-1 bg-[#e6e0d2]"></div>
        <div class="flex items-center gap-2 rounded-full bg-[#fffdf8] px-2">
          <Icon name="lucide:settings-2" class="h-4 w-4 text-[#b9873b]" />
          <h2 class="text-xs font-semibold uppercase tracking-wide text-[#6b665c]">Exam Options</h2>
        </div>
        <div class="h-px flex-1 bg-[#e6e0d2]"></div>
      </div>

      <div class="grid grid-cols-1 gap-3 lg:grid-cols-3">

        <!-- MODE -->
        <div class="rounded-lg border border-[#e6e0d2] bg-[#f6f3ec] p-3">
          <label class="mb-1.5 flex items-center gap-2 text-xs font-semibold text-[#24304a]">
            <Icon name="lucide:monitor-play" class="h-4 w-4 text-[#b9873b]" />
            Select Mode
          </label>

          <select
            v-model="examMode"
            class="w-full rounded-lg border border-[#e6e0d2] bg-[#fffdf8] px-3 py-1.5
                   text-sm font-medium text-[#201f22] outline-none
                   focus:border-[#3c4c6e] focus:ring-2 focus:ring-[#3c4c6e]/15"
          >
            <option value="practice">Practice</option>
            <option value="exam">Examination</option>
            <option value="timed">Timed Practice</option>
          </select>
        </div>

        <!-- DURATION -->
        <div class="rounded-lg border border-[#e6e0d2] bg-[#f6f3ec] p-3">
          <label class="mb-1.5 flex items-center gap-2 text-xs font-semibold text-[#24304a]">
            <Icon name="lucide:timer" class="h-4 w-4 text-[#b9873b]" />
            Exam Duration
          </label>

          <input
            v-model="examDuration"
            type="time"
            step="1"
            class="w-full rounded-lg border border-[#e6e0d2] bg-[#fffdf8] px-3 py-1.5
                   font-['IBM_Plex_Mono',monospace] text-sm font-medium text-[#201f22] outline-none
                   focus:border-[#3c4c6e] focus:ring-2 focus:ring-[#3c4c6e]/15"
          />
        </div>

        <!-- CHECKBOXES -->
        <div class="space-y-2 rounded-lg border border-[#e6e0d2] bg-[#f6f3ec] p-3">
          <label class="flex cursor-pointer items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="flex h-6 w-6 items-center justify-center rounded-md bg-[#e9edf5] text-[#3c4c6e]">
                <Icon name="lucide:shuffle" class="h-3.5 w-3.5" />
              </div>
              <span class="text-xs font-semibold text-[#201f22]">Shuffle Questions</span>
            </div>
            <input
              v-model="shuffleQuestions"
              type="checkbox"
              class="h-4 w-4 rounded border-[#e6e0d2] accent-[#24304a]"
            />
          </label>

          <label class="flex cursor-pointer items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="flex h-6 w-6 items-center justify-center rounded-md bg-[#f4ecda] text-[#b9873b]">
                <Icon name="lucide:list-restart" class="h-3.5 w-3.5" />
              </div>
              <span class="text-xs font-semibold text-[#201f22]">Shuffle Options</span>
            </div>
            <input
              v-model="shuffleOptions"
              type="checkbox"
              class="h-4 w-4 rounded border-[#e6e0d2] accent-[#24304a]"
            />
          </label>
        </div>

      </div>
    </section>

    <!-- ================================================= -->
    <!-- INSTRUCTIONS MODAL -->
    <!-- ================================================= -->

    <Teleport to="body">
      <div
        v-if="showInstructions"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      >
        <div class="w-full max-w-lg rounded-2xl border border-[#e6e0d2] bg-[#fffdf8] p-6 shadow-2xl">

          <div class="mb-5 flex items-center justify-between">
            <h2 class="font-['Fraunces',Georgia,serif] text-lg font-semibold text-[#24304a]">
              Exam Instructions
            </h2>
            <button
              @click="showInstructions = false"
              class="flex h-9 w-9 items-center justify-center rounded-full bg-[#f6f3ec] text-[#6b665c] hover:bg-[#e6e0d2]"
            >
              <Icon name="lucide:x" class="h-4 w-4" />
            </button>
          </div>

          <div class="space-y-3 text-sm text-[#6b665c]">
            <p class="flex items-start gap-2">
              <Icon name="lucide:check-circle" class="mt-0.5 h-4 w-4 shrink-0 text-[#3f7a5c]" />
              Select the subjects you want to practice.
            </p>
            <p class="flex items-start gap-2">
              <Icon name="lucide:clock" class="mt-0.5 h-4 w-4 shrink-0 text-[#3f7a5c]" />
              Complete the examination before the timer ends.
            </p>
            <p class="flex items-start gap-2">
              <Icon name="lucide:shuffle" class="mt-0.5 h-4 w-4 shrink-0 text-[#3f7a5c]" />
              You can shuffle questions and answer options.
            </p>
          </div>

          <button
            @click="showInstructions = false"
            class="mt-6 w-full rounded-xl bg-[#24304a] py-3 text-sm font-semibold text-white
                   transition hover:opacity-90"
          >
            Got It
          </button>
        </div>
      </div>
    </Teleport>

    <!-- ================================================= -->
    <!-- SUBJECT SELECTOR MODAL -->
    <!-- ================================================= -->

    <SelectSubject
      v-model="showSubjectModal"
      v-model:modelSubjects="selectedSubjects"
    />

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import subjectsdetails  from '~/data/subjectdetail.js'
import questions from '~/data/questions.js'
import { normalizeSubjectId } from '~/utils/subjectMeta'
const  {getQuestions} = useQuestionSearch()
/*
|--------------------------------------------------------------------------
| Emits
|--------------------------------------------------------------------------
*/

const emit = defineEmits(['gohome'])
const appState = useAppState()
/*
|--------------------------------------------------------------------------
| Users
|--------------------------------------------------------------------------
*/

const users = [
  'WAHEED',
  'Student 2',
  'Student 3'
]
/*
|--------------------------------------------------------------------------
| SAVE  User Name
|--------------------------------------------------------------------------
*/

const selectedUser = ref('WAHEED')
const saveUser = () => {
  const name = (appState.value.currentsuser || '').trim()

  if (!name || name.toLowerCase() === 'unknown') {
    return
  }

  if (!appState.value.users) {
    appState.value.users = []
  }

  const exists = appState.value.users.some(
    user => user.toLowerCase() === name.toLowerCase()
  )

  if (!exists) {
    appState.value.users.push(name)
  }
  console.log(appState.value.users,'ppState.value.users');
  
  appState.value.currentsuser = name
}




const showSubjectModal = ref(false)
const showTopicModal = ref(false)
const activeSubject = ref(null)

const openTopicModal = (subject) => {
  activeSubject.value = subject
  showTopicModal.value = true
}
const selectedSubjects = ref([
   {
    id: 'english-language',
    name: 'ENGLISH LANGUAGE',
    icon: 'lucide:book-open'
  }
])
/*
|--------------------------------------------------------------------------
| Exam Settings
|--------------------------------------------------------------------------
*/

const examMode = ref('practice')

const examDuration = ref('02:00:00')

const shuffleQuestions = ref(true)

const shuffleOptions = ref(true)

/*
|--------------------------------------------------------------------------
| All Available Subjects
|--------------------------------------------------------------------------
*/

const SUBJECTS = [
  'accounting',
  'agriculture',
  'arabic',
  'biology',
  'chemistry',
  'christian-religious-studies',
  'civic-education',
  'commerce',
  'computer-studies',
  'economics',
  'english',
  'fine-art',
  'french',
  'geography',
  'government',
  'hausa',
  'history',
  'home-economics',
  'igbo',
  'insurance',
  'literature-in-english',
  'mathematics',
  'marketing',
  'physics'
]

/*
|--------------------------------------------------------------------------
| Subject Icons
|--------------------------------------------------------------------------
*/

const subjectIcons = {

  accounting:
    'lucide:calculator',

  agriculture:
    'lucide:wheat',

  arabic:
    'lucide:languages',

  biology:
    'lucide:dna',

  chemistry:
    'lucide:flask-conical',

  'christian-religious-studies':
    'lucide:church',

  'civic-education':
    'lucide:landmark',

  commerce:
    'lucide:shopping-cart',

  'computer-studies':
    'lucide:monitor',

  economics:
    'lucide:chart-no-axes-combined',

  'english':
    'lucide:book-open',

  'fine-art':
    'lucide:palette',

  french:
    'lucide:languages',

  geography:
    'lucide:globe-2',

  government:
    'lucide:building-2',

  hausa:
    'lucide:languages',

  history:
    'lucide:scroll-text',

  'home-economics':
    'lucide:house',

  igbo:
    'lucide:languages',

  insurance:
    'lucide:shield-check',

  'literature-in-english':
    'lucide:book-text',

  mathematics:
    'lucide:sigma',

  marketing:
    'lucide:megaphone',

  physics:
    'lucide:atom'

}


const getSubjectDetails = (subject) => {
   console.log(subject )
  
  return subjectsdetails.find(
    item => item.id === subject.id
  )
}

/*
|--------------------------------------------------------------------------
| Subject Colors
|--------------------------------------------------------------------------
*/

const subjectColors = {

  accounting: {
    bg: 'bg-blue-100',
    text: 'text-blue-600'
  },

  agriculture: {
    bg: 'bg-green-100',
    text: 'text-green-600'
  },

  arabic: {
    bg: 'bg-orange-100',
    text: 'text-orange-600'
  },

  biology: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-600'
  },

  chemistry: {
    bg: 'bg-purple-100',
    text: 'text-purple-600'
  },

  'christian-religious-studies': {
    bg: 'bg-red-100',
    text: 'text-red-600'
  },

  'civic-education': {
    bg: 'bg-indigo-100',
    text: 'text-indigo-600'
  },

  commerce: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-600'
  },

  'computer-studies': {
    bg: 'bg-cyan-100',
    text: 'text-cyan-600'
  },

  economics: {
    bg: 'bg-teal-100',
    text: 'text-teal-600'
  },

  'english': {
    bg: 'bg-blue-100',
    text: 'text-blue-600'
  },

  'fine-art': {
    bg: 'bg-pink-100',
    text: 'text-pink-600'
  },

  french: {
    bg: 'bg-violet-100',
    text: 'text-violet-600'
  },

  geography: {
    bg: 'bg-lime-100',
    text: 'text-lime-600'
  },

  government: {
    bg: 'bg-slate-100',
    text: 'text-slate-600'
  },

  hausa: {
    bg: 'bg-amber-100',
    text: 'text-amber-600'
  },

  history: {
    bg: 'bg-stone-100',
    text: 'text-stone-600'
  },

  'home-economics': {
    bg: 'bg-rose-100',
    text: 'text-rose-600'
  },

  igbo: {
    bg: 'bg-green-100',
    text: 'text-green-600'
  },

  insurance: {
    bg: 'bg-sky-100',
    text: 'text-sky-600'
  },

  'literature-in-english': {
    bg: 'bg-fuchsia-100',
    text: 'text-fuchsia-600'
  },

  mathematics: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-600'
  },

  marketing: {
    bg: 'bg-pink-100',
    text: 'text-pink-600'
  },

  physics: {
    bg: 'bg-cyan-100',
    text: 'text-cyan-600'
  }

}

/*
|--------------------------------------------------------------------------
| Format Subject Name
|--------------------------------------------------------------------------
*/

const formatSubjectName = (subject) => {

  return subject
    .replace(/-/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase())

}

/*
|--------------------------------------------------------------------------
| Get Subject Icon
|--------------------------------------------------------------------------
*/

const getSubjectIcon = (subject) => {

  return (
    subjectIcons[subject] ||
    'lucide:book-open'
  )

}

/*
|--------------------------------------------------------------------------
| Get Subject Color
|--------------------------------------------------------------------------
*/

const getSubjectColor = (subject) => {

  return (
    subjectColors[subject] || {
      bg: 'bg-slate-100',
      text: 'text-slate-600'
    }
  )

}

/*
|--------------------------------------------------------------------------
| Check If Subject Is Selected
|--------------------------------------------------------------------------
*/

const isSelected = (subject) => {
  return selectedSubjects.value.some(
    item => item.id === subject.id
  )
}

/*
|--------------------------------------------------------------------------
| Toggle One Subject
|--------------------------------------------------------------------------
*/
const createSubject = (subject) => {
  const details = getSubjectDetails(subject)

  return {
    ...subject,
    year: details?.years?.at(-1) ?? "all",
    topics: [], // <-- add this
    questions: normalizeSubjectId(
      subject.id ?? subject.subject ?? subject.name
    ) === "english-language" ? 60 : 40,
    questionOptions: [20, 30, 40, 50, 60, 70, 80, 90, 100]
  }
}
const toggleSubject = (subject) => {

  if (
    isSelected(subject)
  ) {

    selectedSubjects.value =
      selectedSubjects.value.filter(
        item => item !== subject
      )

  } else {

    selectedSubjects.value.push(createSubject(subject))

  }

}

/*
|--------------------------------------------------------------------------
| Open Subject Modal
|--------------------------------------------------------------------------
*/

const openSubjectModal = () => {

  showSubjectModal.value = true

}

const handleSubjectsConfirmed = (subjects) => {
  console.log('DATA FROM SELECT SUBJECT:', subjects)

  selectedSubjects.value = subjects
}
/*
|--------------------------------------------------------------------------
| Close Subject Modal
|--------------------------------------------------------------------------
*/

const closeSubjectModal = () => {

  showSubjectModal.value = false

}

/*
|--------------------------------------------------------------------------
| Select All Subjects
|--------------------------------------------------------------------------
*/

const selectAllSubjects = computed({

  get() {

    return (
      selectedSubjects.value.length ===
      SUBJECTS.length
    )

  },

  set(value) {

    if (value) {

      selectedSubjects.value = [
        ...SUBJECTS
      ]

    } else {

      selectedSubjects.value = []

    }

  }

})

/*
|--------------------------------------------------------------------------
| Toggle Select All
|--------------------------------------------------------------------------
*/

const toggleSelectAll = () => {

  if (
    selectedSubjects.value.length ===
    SUBJECTS.length
  ) {

    selectedSubjects.value = []

  } else {

    selectedSubjects.value = [
      ...SUBJECTS
    ]

  }

}

/*
|--------------------------------------------------------------------------
| Confirm Subjects
|--------------------------------------------------------------------------
*/

const confirmSubjects = () => {

  console.log(
    'Selected Subjects:',
    selectedSubjects.value
  )

  showSubjectModal.value = false

}

/*
|--------------------------------------------------------------------------
| Topic
|--------------------------------------------------------------------------
*/

const topicSubject = ref(null)

const topics = [

  'All',

  'Algebra',

  'Geometry',

  'Probability',

  'Statistics',

  'Grammar',

  'Comprehension',

  'Organic Chemistry'

]

/*
|--------------------------------------------------------------------------
| Open Topic
|--------------------------------------------------------------------------
*/

const editTopic = (subject) => {

  topicSubject.value = subject

}

/*
|--------------------------------------------------------------------------
| Select Topic
|--------------------------------------------------------------------------
*/

const selectTopic = (topic) => {
  
  if (
    topicSubject.value
  ) {

    topicSubject.value.topic =
      topic

  }

  topicSubject.value = null

}

/*
|--------------------------------------------------------------------------
| Instructions
|--------------------------------------------------------------------------
*/

const showInstructions = ref(false)
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
/*
|--------------------------------------------------------------------------
| Start Exam
|--------------------------------------------------------------------------
*/

function shuffleArray(array) {
  const arr = [...array] // Copy to avoid mutating original

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }

  return arr
}

function shuffleQuestionOptions(question) {
  // Keep only options that actually exist
  const entries = Object.entries(question.options)
    .filter(([_, value]) => value !== undefined && value !== null && value !== "")

  // Correct answer text
  const correctText = question.options[question.answer]

  // Fisher-Yates shuffle
  for (let i = entries.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[entries[i], entries[j]] = [entries[j], entries[i]]
  }

  const newOptions = {}
  let newAnswer = ""

  entries.forEach(([, value], index) => {
    // Generate keys: a, b, c, d, e, f, g, h...
    const key = String.fromCharCode(97 + index)

    newOptions[key] = value

    if (value === correctText) {
      newAnswer = key
    }
  })

  return {
    ...question,
    options: newOptions,
    answer: newAnswer,
    userAnswer:null,

  }
}



const startExam = async () => {
  appState.value.reviewQuestions = false
  if (
    selectedSubjects.value.length === 0
  ) {
    alert(
      'Please select at least one subject.'
    )

    return
  }
 appState.value.selectedSubjects =  selectedSubjects.value 

  // Save exam settings
  appState.value.examSettings = {
    mode: examMode.value,

    duration:
      examDuration.value,

    shuffleQuestions:
      shuffleQuestions.value,

    shuffleOptions:
      shuffleOptions.value
  }


 
  let examQuestions = []

 for (const subject of appState.value.selectedSubjects) {
      console.log(subject, 'subject');
  // Get all questions for this subject
let subjectQuestions = await getQuestions({
  subject:subject.id,
  year:subject.year,
  limit:subject.questions
    })  

  if (subjectQuestions.length <= 0) {

   subjectQuestions =  await getQuestions({
  subject:subject.id,
  limit:subject.questions
    }) 
  }
  // Shuffle question order
  if (shuffleQuestions.value) {
    subjectQuestions = shuffleArray(subjectQuestions)
  }

  // Take only the required number of questions
  // subjectQuestions = subjectQuestions.slice(
  //   0,
  //   subject.questions
  // )

  // Shuffle options if enabled
  if (shuffleOptions.value) {
    subjectQuestions = subjectQuestions.map(question =>
      shuffleQuestionOptions(question)
    )
  }

  // Append to final exam
  examQuestions.push(...subjectQuestions)
}

console.log(examQuestions);


  appState.value.examQuestions = examQuestions
  saveUser()
console.log( await getQuestions({subject:"english-language"  }) );

  // Go to exam
  await navigateTo('/exam')
}



/*
|--------------------------------------------------------------------------
| Go Home
|--------------------------------------------------------------------------
*/
onMounted(() => {

console.log(appState.value.selectedSubjects, 'appState.value.selectedSubjects');

if (appState.value.selectedSubjects.length > 0) {
  selectedSubjects.value = appState.value.selectedSubjects.map((subject) =>
    normalizeSubjectId(subject.id ?? subject.subject ?? subject.name) === "english-language"
      ? { ...subject, id: "english-language", name: "ENGLISH LANGUAGE" }
      : subject
  )

      examDuration.value =appState.value.examSettings.duration 
      shuffleQuestions.value = appState.value.examSettings.shuffleQuestions 

      shuffleOptions.value = appState.value.examSettings.shuffleOptions 
}

})

import { watch } from "vue"

watch(
  selectedSubjects,
  (subjects) => {
    subjects.forEach((subject) => {
      const details = getSubjectDetails(subject)

      // default year
      if (!subject.year) {
        subject.year =
          details?.years?.[details.years.length - 1] || "all"
      }

      // default topic
      if (!subject.topic) {
        subject.topic =
          details?.topics?.[0] || "All"
      }

      // default questions
        if (!subject.questions) {
          subject.questions =
            ["english", "english-language"].includes(subject.id) ? 60 : 40
        }
       

      
      
      if (!subject.questionOptions) {
        subject.questionOptions = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
      }
    })
  },
  {
    immediate: true,
    deep: true
  }
)
const goHome = () => {

  emit('gohome')

}

</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap');
</style>