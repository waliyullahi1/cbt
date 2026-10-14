
<template>
  <Teleport to="body">

    <!-- =====================================================
         OVERLAY
    ====================================================== -->
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 backdrop-blur-sm sm:p-4"
      @click.self="closeModal"
    >

      <!-- ===================================================
           MODAL
      ==================================================== -->
      <div
        class="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl"
      >

        <!-- =================================================
             HEADER
        ================================================== -->
        <div
          class="flex shrink-0 items-center justify-between bg-primary px-3 py-2 text-white sm:px-4"
        >

          <div class="min-w-0">
            <h2 class="text-sm font-semibold sm:text-base">
              Select Subject
            </h2>

            <p class="mt-0.5 text-[10px] text-white/70 sm:text-xs">
              Choose the subjects you want to practice
            </p>
          </div>


          <!-- CLOSE -->
          <button
            type="button"
            @click="closeModal"
            aria-label="Close"
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition hover:bg-white/15 sm:h-9 sm:w-9"
          >
            <Icon
              name="lucide:x"
              class="h-4 w-4 sm:h-5 sm:w-5"
            />
          </button>

        </div>


        <!-- =================================================
             CONTENT
        ================================================== -->
        <div
          class="min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-4 sm:py-4"
        >

          <!-- ===============================================
               SELECT ALL
          ================================================ -->
          <label
            class="mb-3 flex cursor-pointer items-center justify-between border-b border-slate-200 pb-3"
          >

            <div class="flex items-center gap-2">

              <input
                type="checkbox"
                :checked="allSelected"
                @change="toggleSelectAll"
                class="h-4 w-4 cursor-pointer accent-blue-600"
              />

              <div>
                <span
                  class="block text-xs font-semibold text-slate-700 sm:text-sm"
                >
                  Select All
                </span>

                <span
                  class="block text-[10px] text-slate-400 sm:text-xs"
                >
                  {{ subjects.length }} subjects available
                </span>
              </div>

            </div>


            <!-- TOTAL QUESTIONS -->
            <span
              class="text-[10px] font-medium text-slate-400 sm:text-xs"
            >
              {{ formatNumber(totalQuestions) }} {{ countLabel }}
            </span>

          </label>


          <!-- ===============================================
               SUBJECT LIST
          ================================================ -->
          <div
            v-if="subjectsLoading"
            class="flex min-h-40 items-center justify-center text-sm text-slate-500"
          >
            Loading available subjects...
          </div>

          <div
            v-else-if="subjectsError"
            class="flex min-h-40 items-center justify-center text-center text-sm text-red-600"
          >
            {{ subjectsError }}
          </div>

          <div
            v-else-if="subjects.length > 0"
            class="grid grid-cols-1 gap-1.5 sm:grid-cols-2 sm:gap-2"
          >

            <label
              v-for="subject in subjects"
              :key="subject.id"
              :class="[
                'group flex min-w-0 cursor-pointer items-center gap-2.5 rounded-lg border px-2 py-2 transition',
                isSelected(subject)
                  ? 'border-blue-200 bg-blue-50'
                  : 'border-transparent hover:border-slate-200 hover:bg-slate-50'
              ]"
            >

              <!-- CHECKBOX -->
              <input
                type="checkbox"
                :checked="isSelected(subject)"
                @change="toggleSubject(subject)"
                class="h-4 w-4 shrink-0 cursor-pointer accent-green-600"
              />


              <!-- ICON -->
              <div
                :class="[
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-md sm:h-9 sm:w-9',
                  getSubjectColor(subject).bg
                ]"
              >

                <Icon
                  :name="getSubjectIcon(subject)"
                  :class="[
                    'h-4 w-4 sm:h-[18px] sm:w-[18px]',
                    getSubjectColor(subject).text
                  ]"
                />

              </div>


              <!-- SUBJECT INFORMATION -->
              <div class="min-w-0 flex-1">

                <!-- NAME -->
                <span
                  class="block truncate text-xs font-semibold text-slate-700 sm:text-sm"
                >
                  {{ subject.name }}
                </span>


                <!-- QUESTION COUNT -->
                <span
                  class="mt-0.5 block text-[10px] font-medium text-slate-400 sm:text-xs"
                >
                  {{ formatNumber(subject.questionCount) }}
                  {{ subject.questionCount === 1 ? countLabel.slice(0, -1) : countLabel }}
                </span>

              </div>


              <!-- SELECTED INDICATOR -->
              <div
                v-if="isSelected(subject)"
                class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white"
              >
                <Icon
                  name="lucide:check"
                  class="h-3 w-3"
                />
              </div>

            </label>

          </div>


          <!-- ===============================================
               EMPTY STATE
          ================================================ -->
          <div
            v-else
            class="flex min-h-40 items-center justify-center"
          >

            <div class="text-center">

              <div
                class="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100"
              >
                <Icon
                  name="lucide:book-open"
                  class="h-5 w-5 text-slate-400"
                />
              </div>

              <p
                class="text-xs font-semibold text-slate-600 sm:text-sm"
              >
                No subjects in the local lessons database
              </p>

              <p
                class="mt-1 text-[10px] text-slate-400 sm:text-xs"
              >
                Download lesson content to make subjects available here.
              </p>

            </div>

          </div>

        </div>


        <!-- =================================================
             FOOTER
        ================================================== -->
        <div
          class="flex shrink-0 items-center justify-between border-t border-slate-200 bg-primary px-3 py-2.5 sm:px-4 sm:py-3"
        >

          <!-- SELECTED INFO -->
          <div class="min-w-0">

            <span
              class="block text-[11px] font-semibold text-white sm:text-xs"
            >
              {{ selectedSubjects.length }} selected
            </span>

            <span
              v-if="selectedQuestionCount > 0"
              class="block text-[9px] text-white/65 sm:text-[10px]"
            >
              {{ formatNumber(selectedQuestionCount) }} questions available
            </span>

          </div>


          <!-- BUTTONS -->
          <div class="flex shrink-0 gap-1.5 sm:gap-2">

            <!-- CANCEL -->
            <button
              type="button"
              @click="closeModal"
              class="rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 sm:px-4"
            >
              Cancel
            </button>


            <!-- OKAY -->
            <button
              type="button"
              @click="confirmSubjects"
              :disabled="selectedSubjects.length === 0"
              :class="[
                'rounded-md px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition sm:px-4',
                selectedSubjects.length > 0
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'cursor-not-allowed bg-blue-400/60'
              ]"
            >
              Okay
            </button>

          </div>

        </div>

      </div>

    </div>

  </Teleport>
</template>


<script setup>

import {
  computed,
  ref,
  watch
} from 'vue'
import { normalizeSubjectId } from '~/utils/subjectMeta'


/* =========================================================
   PROPS
========================================================= */

const props = defineProps({

  /*
   * Modal visibility
   */
  modelValue: {
    type: Boolean,
    default: false
  },


  /*
   * ========================================================
   * SUBJECT DATA FROM PARENT
   * ========================================================
   *
   * Parent sends EXACTLY:
   *
   * [
   *   {
   *     subject: "accounting",
   *     questionCount: 1336
   *   },
   *
   *   {
   *     subject: "biology",
   *     questionCount: 383
   *   }
   * ]
   *
   */
  subjects: {
    type: Array,
    default: () => []
  },
  subjectsLoading: {
    type: Boolean,
    default: false
  },
  subjectsError: {
    type: String,
    default: ''
  },
  countLabel: {
    type: String,
    default: 'questions'
  },


  /*
   * Selected subjects
   *
   * Parent can store:
   *
   * [
   *   {
   *     id: "biology",
   *     name: "Biology",
   *     icon: "lucide:dna",
   *     questionCount: 383
   *   }
   * ]
   *
   */
  modelSubjects: {
    type: Array,
    default: () => []
  }

})


/* =========================================================
   EMITS
========================================================= */

const emit = defineEmits([
  'update:modelValue',
  'update:modelSubjects',
  'confirm'
])


/* =========================================================
   SUBJECT ICONS
========================================================= */

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

  english:
    'lucide:book-open',

  'english-language':
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

  literature:
    'lucide:book-text',

  mathematics:
    'lucide:sigma',

  marketing:
    'lucide:megaphone',

  physics:
    'lucide:atom'

}


/* =========================================================
   SUBJECT COLORS
========================================================= */

const subjectColors = {

  accounting:
    ['bg-blue-100', 'text-blue-600'],

  agriculture:
    ['bg-green-100', 'text-green-600'],

  arabic:
    ['bg-orange-100', 'text-orange-600'],

  biology:
    ['bg-emerald-100', 'text-emerald-600'],

  chemistry:
    ['bg-purple-100', 'text-purple-600'],

  'christian-religious-studies':
    ['bg-red-100', 'text-red-600'],

  'civic-education':
    ['bg-indigo-100', 'text-indigo-600'],

  commerce:
    ['bg-yellow-100', 'text-yellow-600'],

  'computer-studies':
    ['bg-cyan-100', 'text-cyan-600'],

  economics:
    ['bg-teal-100', 'text-teal-600'],

  english:
    ['bg-blue-100', 'text-blue-600'],

  'english-language':
    ['bg-blue-100', 'text-blue-600'],

  'fine-art':
    ['bg-pink-100', 'text-pink-600'],

  french:
    ['bg-violet-100', 'text-violet-600'],

  geography:
    ['bg-lime-100', 'text-lime-600'],

  government:
    ['bg-slate-100', 'text-slate-600'],

  hausa:
    ['bg-amber-100', 'text-amber-600'],

  history:
    ['bg-stone-100', 'text-stone-600'],

  'home-economics':
    ['bg-rose-100', 'text-rose-600'],

  igbo:
    ['bg-green-100', 'text-green-600'],

  insurance:
    ['bg-sky-100', 'text-sky-600'],

  'literature-in-english':
    ['bg-fuchsia-100', 'text-fuchsia-600'],

  literature:
    ['bg-fuchsia-100', 'text-fuchsia-600'],

  mathematics:
    ['bg-indigo-100', 'text-indigo-600'],

  marketing:
    ['bg-pink-100', 'text-pink-600'],

  physics:
    ['bg-cyan-100', 'text-cyan-600']

}


/* =========================================================
   LOCAL STATE
========================================================= */

const selectedSubjects = ref([])


/* =========================================================
   NORMALIZE PARENT DATA
========================================================= */

const normalizedSubjects = computed(() => {

  if (!Array.isArray(props.subjects)) {
    return []
  }


  return props.subjects
    .filter(item => item && (item.subject || item.id))
    .map(item => {

      const sourceId =
        typeof item.subject === 'string'
          ? item.subject
          : item.id
      const id = normalizeSubjectId(sourceId)


      return {
        ...item,

        /*
         * Convert:
         *
         * subject
         *
         * into:
         *
         * id
         */
        id,


        /*
         * Convert:
         *
         * english-language
         *
         * into:
         *
         * English Language
         */
        name:
          id === 'english-language'
            ? 'ENGLISH LANGUAGE'
            : item.name || formatSubjectName(id),


        /*
         * Get icon automatically
         */
        icon:
          subjectIcons[id] ||
          item.icon ||
          'lucide:book-open',


        /*
         * Preserve question count
         */
        questionCount:
          Number(item.questionCount ?? item.lessonCount) || 0

      }

    })

})


/*
 * Short alias used by template
 */
const subjects = computed(() => {
  return normalizedSubjects.value
})


/* =========================================================
   TOTAL QUESTIONS
========================================================= */

const totalQuestions = computed(() => {

  return subjects.value.reduce(
    (total, subject) => {

      return total +
        (Number(subject.questionCount) || 0)

    },
    0
  )

})


/* =========================================================
   SELECTED QUESTION COUNT
========================================================= */

const selectedQuestionCount = computed(() => {

  return selectedSubjects.value.reduce(
    (total, subject) => {

      return total +
        (Number(subject.questionCount) || 0)

    },
    0
  )

})


/* =========================================================
   SYNC SELECTED SUBJECTS FROM PARENT
========================================================= */

const syncSelectedSubjects = (value) => {

  if (!Array.isArray(value)) {

    selectedSubjects.value = []

    return

  }


  selectedSubjects.value = value
    .map(selected => {

      /*
       * Parent can send:
       *
       * "biology"
       */
      if (typeof selected === 'string') {

        return subjects.value.find(
          subject =>
            subject.id === normalizeSubjectId(selected)
        )

      }


      /*
       * Parent can send:
       *
       * {
       *   id: "biology"
       * }
       */
      if (
        selected &&
        typeof selected === 'object'
      ) {

        const found =
          subjects.value.find(
            subject =>
              subject.id === normalizeSubjectId(selected.id)
          )


        /*
         * Always use the latest
         * data from parent.
         */
        if (found) {
          return found
        }


        return selected

      }


      return null

    })
    .filter(Boolean)

}


/* =========================================================
   WATCH PARENT SELECTION
========================================================= */

watch(
  () => props.modelSubjects,
  (value) => {

    syncSelectedSubjects(value)

  },
  {
    immediate: true,
    deep: true
  }
)


/* =========================================================
   WATCH SUBJECT DATA
========================================================= */

watch(
  subjects,
  () => {

    /*
     * When parent refreshes the
     * subject list, keep only subjects
     * that still exist.
     */

    selectedSubjects.value =
      selectedSubjects.value
        .map(selected => {

          return subjects.value.find(
            subject =>
              subject.id === normalizeSubjectId(selected.id)
          )

        })
        .filter(Boolean)

  },
  {
    deep: true
  }
)


/* =========================================================
   ALL SELECTED
========================================================= */

const allSelected = computed(() => {

  if (subjects.value.length === 0) {
    return false
  }


  return (
    selectedSubjects.value.length ===
    subjects.value.length
  )

})


/* =========================================================
   CHECK SELECTED
========================================================= */

const isSelected = (subject) => {

  return selectedSubjects.value.some(
    selected =>
      selected.id === subject.id
  )

}


/* =========================================================
   TOGGLE SUBJECT
========================================================= */

const toggleSubject = (subject) => {

  const index =
    selectedSubjects.value.findIndex(
      selected =>
        selected.id === subject.id
    )


  /*
   * REMOVE
   */
  if (index !== -1) {

    selectedSubjects.value.splice(
      index,
      1
    )

    return

  }


  /*
   * ADD
   */
  selectedSubjects.value.push({

    id:
      subject.id,

    name:
      subject.name,

    icon:
      subject.icon,

    questionCount:
      subject.questionCount

  })

}


/* =========================================================
   SELECT ALL
========================================================= */

const toggleSelectAll = () => {

  /*
   * If everything is already selected,
   * clear everything.
   */
  if (allSelected.value) {

    selectedSubjects.value = []

    return

  }


  /*
   * Otherwise select every subject.
   */
  selectedSubjects.value =
    subjects.value.map(subject => ({

      id:
        subject.id,

      name:
        subject.name,

      icon:
        subject.icon,

      questionCount:
        subject.questionCount

    }))

}


/* =========================================================
   CLOSE MODAL
========================================================= */

const closeModal = () => {

  emit(
    'update:modelValue',
    false
  )

}


/* =========================================================
   CONFIRM SUBJECTS
========================================================= */

const confirmSubjects = () => {

  /*
   * Create a clean copy.
   */
  const subjectsToSend =
    selectedSubjects.value.map(
      subject => ({

        id:
          subject.id,

        name:
          subject.name,

        icon:
          subject.icon,

        questionCount:
          Number(
            subject.questionCount
          ) || 0

      })
    )


  /*
   * Send to parent using v-model.
   */
  emit(
    'update:modelSubjects',
    subjectsToSend
  )


  /*
   * Also send confirm event.
   */
  emit(
    'confirm',
    subjectsToSend
  )


  /*
   * Close modal.
   */
  emit(
    'update:modelValue',
    false
  )

}


/* =========================================================
   FORMAT SUBJECT NAME
========================================================= */

const formatSubjectName = (subject) => {

  if (!subject) {
    return ''
  }


  const specialNames = {

    accounting:
      'Accounting',

    agriculture:
      'Agriculture',

    arabic:
      'Arabic',

    biology:
      'Biology',

    chemistry:
      'Chemistry',

    'christian-religious-studies':
      'Christian Religious Studies',

    'civic-education':
      'Civic Education',

    commerce:
      'Commerce',

    'computer-studies':
      'Computer Studies',

    economics:
      'Economics',

    english:
      'ENGLISH LANGUAGE',

    'english-language':
      'ENGLISH LANGUAGE',

    'fine-art':
      'Fine Art',

    french:
      'French',

    geography:
      'Geography',

    government:
      'Government',

    hausa:
      'Hausa',

    history:
      'History',

    'home-economics':
      'Home Economics',

    igbo:
      'Igbo',

    insurance:
      'Insurance',

    literature:
      'Literature in English',

    'literature-in-english':
      'Literature in English',

    mathematics:
      'Mathematics',

    marketing:
      'Marketing',

    physics:
      'Physics'

  }


  if (specialNames[subject]) {
    return specialNames[subject]
  }


  return String(subject)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, char =>
      char.toUpperCase()
    )

}


/* =========================================================
   FORMAT NUMBER
========================================================= */

const formatNumber = (number) => {

  return Number(number || 0)
    .toLocaleString()

}


/* =========================================================
   GET SUBJECT COLOR
========================================================= */

const getSubjectColor = (subject) => {

  const id =
    typeof subject === 'object'
      ? subject?.id
      : subject


  const colors =
    subjectColors[id] || [
      'bg-slate-100',
      'text-slate-600'
    ]


  return {

    bg:
      colors[0],

    text:
      colors[1]

  }

}


/* =========================================================
   GET SUBJECT ICON
========================================================= */

const getSubjectIcon = (subject) => {

  const id =
    typeof subject === 'object'
      ? subject?.id
      : subject


  return (
    subjectIcons[id] ||
    subject?.icon ||
    'lucide:book-open'
  )

}


/* =========================================================
   EXPOSE
========================================================= */

defineExpose({

  subjects,

  selectedSubjects,

  allSelected,

  totalQuestions,

  selectedQuestionCount,

  toggleSubject,

  toggleSelectAll,

  isSelected,

  confirmSubjects

})

</script>
