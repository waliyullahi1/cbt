<template>
  <div
    class="flex h-screen min-h-0 w-full flex-col overflow-hidden bg-bg text-ink font-['Inter',system-ui,sans-serif]"
  >
    <!-- HEADER -->
    <header
      class="z-50 flex h-14 shrink-0 items-center gap-2 bg-primary px-3 text-white shadow-md sm:px-5 lg:px-6"
    >
      <!-- MOBILE MENU -->
      <button
        type="button"
        aria-label="Open lessons menu"
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition hover:bg-white/10 active:bg-white/20 lg:hidden"
        @click="sidebarOpen = !sidebarOpen"
      >
        <Icon name="lucide:menu" class="h-5 w-5" />
      </button>

      <!-- LOGO -->
      <div
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10"
      >
        <Icon name="lucide:graduation-cap" class="h-5 w-5" />
      </div>

      <!-- TITLE -->
      <div class="min-w-0 flex-1">
        <h1
          class="truncate font-['Fraunces',Georgia,serif] text-sm font-semibold sm:text-base"
        >
          Lessons
        </h1>

        <p class="hidden truncate text-[10px] text-white/50 sm:block">
          Learning materials
        </p>
      </div>

      <!-- DESKTOP SEARCH -->
      <div class="relative hidden w-56 sm:block md:w-64 lg:w-72">
        <Icon
          name="lucide:search"
          class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50"
        />

        <input
          v-model="searchTerm"
          type="text"
          placeholder="Search lessons..."
          class="w-full rounded-lg border border-white/10 bg-white/10 py-2 pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-white/50 focus:border-white/30 focus:bg-white/15"
          @input="onSearchInput"
        />
      </div>

      <!-- HOME -->
      <button
        type="button"
        aria-label="Go home"
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition hover:bg-white/10 active:bg-white/20"
        @click="goHome"
      >
        <Icon name="lucide:house" class="h-5 w-5" />
      </button>
    </header>

    <!-- MOBILE SEARCH -->
    <div
      class="shrink-0 border-b border-line bg-surface px-3 py-2.5 sm:hidden"
    >
      <div class="relative">
        <Icon
          name="lucide:search"
          class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft"
        />

        <input
          v-model="searchTerm"
          type="text"
          placeholder="Search lessons..."
          class="w-full rounded-xl border border-line bg-bg py-2 pl-9 pr-3 text-xs text-ink outline-none transition focus:border-navy focus:bg-white"
          @input="onSearchInput"
        />
      </div>
    </div>

    <!-- MAIN LAYOUT -->
    <div class="relative flex min-h-0 flex-1 overflow-hidden">
      <!-- MOBILE BACKDROP -->
      <Transition name="fade">
        <div
          v-if="sidebarOpen"
          class="fixed inset-0 z-40 bg-black/40 lg:hidden"
          @click="sidebarOpen = false"
        ></div>
      </Transition>

      <!-- SIDEBAR -->
      <aside
        class="z-50 w-[min(86vw,320px)] shrink-0 overflow-hidden border-r border-line bg-surface shadow-xl transition-transform duration-300 lg:relative lg:z-20 lg:block lg:w-72 lg:translate-x-0 lg:shadow-none"
        :class="
          sidebarOpen
            ? 'fixed inset-y-0 left-0 translate-x-0'
            : 'fixed inset-y-0 left-0 -translate-x-full lg:relative lg:translate-x-0'
        "
      >
        <!-- MOBILE SIDEBAR HEADER -->
        <div
          class="flex h-14 items-center justify-between border-b border-line bg-primary px-4 text-white lg:hidden"
        >
          <div class="flex min-w-0 items-center gap-2">
            <Icon name="lucide:book-open" class="h-5 w-5 text-gold" />

            <span class="truncate text-sm font-semibold">
              Lessons
            </span>
          </div>

          <button
            type="button"
            aria-label="Close menu"
            class="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white/10"
            @click="sidebarOpen = false"
          >
            <Icon name="lucide:x" class="h-5 w-5" />
          </button>
        </div>

        <!-- SIDEBAR SCROLL -->
        <div class="h-full overflow-y-auto overscroll-contain pb-6">
          <!-- SIDEBAR INFO -->
          <div class="border-b border-line bg-bg px-4 py-3 sm:py-4">
            <p
              class="text-[9px] font-bold uppercase tracking-widest text-ink-soft sm:text-[10px]"
            >
              Learning subjects
            </p>

            <p class="mt-1 text-[11px] leading-5 text-ink-soft sm:text-xs">
              Select a subject and choose a lesson to continue learning.
            </p>
          </div>

          <!-- SUBJECTS -->
          <div class="p-2 sm:p-3">
            <div
              v-if="!sidebar.length"
              class="px-4 py-10 text-center"
            >
              <Icon
                name="lucide:book-open"
                class="mx-auto h-8 w-8 text-ink-soft/40"
              />

              <p class="mt-3 text-xs text-ink-soft">
                No subjects available.
              </p>
            </div>

            <div
              v-for="subject in sidebar"
              :key="subject.id"
              class="mb-1"
            >
              <!-- SUBJECT HEADER -->
              <button
                type="button"
                class="flex min-h-10 w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-semibold text-navy transition hover:bg-bg active:bg-bg sm:min-h-11 sm:px-3 sm:py-2.5 sm:text-sm"
                @click="toggleSubject(subject.id)"
              >
                <!-- SUBJECT ICON -->
                <span
                  class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold sm:h-8 sm:w-8"
                >
                  <Icon
                    :name="subject.icon || 'lucide:book-open'"
                    class="h-3.5 w-3.5 sm:h-4 sm:w-4"
                  />
                </span>

                <!-- SUBJECT NAME -->
                <span class="min-w-0 flex-1 truncate">
                  {{ subject.name }}
                </span>

                <!-- PROGRESS -->
                <span
                  class="hidden text-[9px] font-bold text-gold sm:block"
                >
                  {{ getSubjectProgress(subject.slug) }}%
                </span>

                <!-- ARROW -->
                <Icon
                  name="lucide:chevron-right"
                  class="h-3.5 w-3.5 shrink-0 text-ink-soft transition-transform duration-200 sm:h-4 sm:w-4"
                  :class="{
                    'rotate-90': openSubjects.has(subject.id)
                  }"
                />
              </button>

              <!-- SUBJECT PROGRESS -->
              <div
                class="mx-2 mb-1 h-1 overflow-hidden rounded-full bg-line sm:mx-3"
              >
                <div
                  class="h-full rounded-full bg-gold transition-all duration-500"
                  :style="{
                    width: `${getSubjectProgress(subject.slug)}%`
                  }"
                ></div>
              </div>

              <!-- TOPICS -->
              <div
                v-if="openSubjects.has(subject.id)"
                class="ml-2 border-l border-line pl-2 sm:ml-3 sm:pl-3"
              >
                <div
                  v-for="topic in subject.topics || []"
                  :key="topic.id"
                  class="mb-2 mt-2 sm:mb-3"
                >
                  <!-- TOPIC HEADER -->
                  <div class="flex items-center gap-2 px-2 py-1.5">
                    <Icon
                      name="lucide:folder"
                      class="h-3 w-3 shrink-0 text-gold sm:h-3.5 sm:w-3.5"
                    />

                    <p
                      class="min-w-0 flex-1 truncate text-[9px] font-bold uppercase tracking-wider text-ink-soft sm:text-[10px]"
                    >
                      {{ topic.title }}
                    </p>

                    <span class="shrink-0 text-[9px] text-ink-soft">
                      {{ topic.lessons?.length || 0 }}
                    </span>
                  </div>

                  <!-- LESSONS -->
                  <div class="space-y-0.5">
                    <button
                      v-for="lesson in topic.lessons || []"
                      :key="lesson.id || lesson.slug"
                      type="button"
                      class="group flex min-h-9 w-full min-w-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-xs transition active:scale-[0.99] sm:min-h-10 sm:gap-2 sm:px-2.5 sm:py-2 sm:text-sm"
                      :class="
                        currentLesson?.slug === lesson.slug
                          ? 'bg-primary font-medium text-white shadow-sm'
                          : 'text-ink-soft hover:bg-bg hover:text-ink'
                      "
                      @click="openLesson(lesson.slug)"
                    >
                      <!-- LESSON ICON -->
                      <Icon
                        :name="
                          currentLesson?.slug === lesson.slug
                            ? 'lucide:book-open'
                            : 'lucide:file-text'
                        "
                        class="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4"
                        :class="
                          currentLesson?.slug === lesson.slug
                            ? 'text-gold'
                            : 'text-ink-soft'
                        "
                      />

                      <!-- LESSON TITLE -->
                      <span class="min-w-0 flex-1 truncate">
                        {{ lesson.title }}
                      </span>

                      <!-- READ STATUS -->
                      <Icon
                        v-if="isLessonReadForSubject(subject, lesson)"
                        name="lucide:check-circle-2"
                        class="h-3.5 w-3.5 shrink-0 text-emerald-500 sm:h-4 sm:w-4"
                        title="Read"
                      />

                      <Icon
                        v-else
                        name="lucide:circle"
                        class="h-3 w-3 shrink-0 opacity-40 sm:h-3.5 sm:w-3.5"
                        title="Unread"
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- CONTENT -->
      <main
        class="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden bg-bg"
      >
        <!-- SEARCH RESULTS -->
        <div
          v-if="showSearchResults"
          class="mx-auto w-full max-w-4xl px-3 py-5 sm:px-6 sm:py-8 lg:px-10"
        >
          <div
            class="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div class="min-w-0">
              <p
                class="text-[9px] font-bold uppercase tracking-widest text-gold sm:text-[10px]"
              >
                Search
              </p>

              <h2
                class="mt-1 break-words font-['Fraunces',Georgia,serif] text-lg font-semibold leading-tight text-navy sm:text-2xl"
              >
                Results for "{{ searchTerm }}"
              </h2>
            </div>

            <button
              type="button"
              class="w-full rounded-lg border border-line bg-surface px-3 py-2 text-[11px] font-semibold text-ink-soft transition hover:bg-bg sm:w-auto sm:px-4 sm:text-xs"
              @click="clearSearch"
            >
              Clear search
            </button>
          </div>

          <!-- RESULTS -->
          <ul v-if="results.length" class="space-y-2.5 sm:space-y-3">
            <li
              v-for="row in results"
              :key="row.slug"
              class="cursor-pointer rounded-xl border border-line bg-surface p-3.5 transition hover:border-navy hover:shadow-sm active:scale-[0.99] sm:p-4"
              @click="openLesson(row.slug)"
            >
              <span
                class="mb-1.5 inline-flex max-w-full truncate rounded-full bg-bg px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-gold sm:mb-2 sm:px-2.5 sm:text-[10px]"
              >
                {{ row.subjectName }}
              </span>

              <h3
                class="break-words font-['Fraunces',Georgia,serif] text-sm font-semibold leading-5 text-navy sm:text-lg"
              >
                {{ row.title }}
              </h3>

              <p
                class="mt-1 text-xs leading-5 text-ink-soft sm:text-sm sm:leading-6"
                v-html="renderSnippet(row.snippet)"
              ></p>
            </li>
          </ul>

          <!-- NO RESULTS -->
          <div
            v-else
            class="rounded-2xl border border-dashed border-line bg-surface px-4 py-10 text-center sm:px-5 sm:py-12"
          >
            <Icon
              name="lucide:search-x"
              class="mx-auto h-8 w-8 text-ink-soft/40 sm:h-9 sm:w-9"
            />

            <p class="mt-3 text-xs text-ink-soft sm:text-sm">
              No lessons matched that search.
            </p>
          </div>
        </div>

        <!-- LESSON CONTENT -->
        <article
          v-else-if="currentLesson"
          class="mx-auto w-full max-w-4xl px-3 py-5 sm:px-6 sm:py-8 md:px-8 lg:px-10 lg:py-10"
        >
          <!-- BREADCRUMB -->
          <div
            class="mb-3 flex min-w-0 items-center gap-1 overflow-hidden text-[9px] font-semibold uppercase tracking-wide text-ink-soft sm:mb-4 sm:gap-1.5 sm:text-xs"
          >
            <span class="max-w-[35%] truncate">
              {{ breadcrumbSubject }}
            </span>

            <Icon
              name="lucide:chevron-right"
              class="h-2.5 w-2.5 shrink-0 sm:h-3 sm:w-3"
            />

            <span class="max-w-[50%] truncate">
              {{ breadcrumbTopic }}
            </span>
          </div>

          <!-- TITLE -->
          <h1
            class="break-words font-['Fraunces',Georgia,serif] text-xl font-semibold leading-tight text-navy sm:text-3xl md:text-4xl"
          >
            {{ currentLesson.title }}
          </h1>

          <!-- SUMMARY -->
          <p
            v-if="currentLesson.summary"
            class="mt-2 max-w-3xl text-xs leading-5 text-ink-soft sm:mt-3 sm:text-base sm:leading-7"
          >
            {{ currentLesson.summary }}
          </p>

          <!-- DIVIDER -->
          <div class="my-4 border-t border-dashed border-line sm:my-7"></div>

          <!-- LESSON BODY -->
          <div
            class="prose-lesson min-w-0 max-w-none break-words text-[13px] leading-6 text-ink sm:text-[16px] sm:leading-8"
            v-html="currentLesson.content_html"
          ></div>

          <!-- WORKED EXAMPLES -->
          <div
            v-for="example in examples"
            :key="example.id"
            class="mt-5 overflow-hidden rounded-xl border border-line bg-surface sm:mt-8"
          >
            <div
              class="flex items-start gap-2 border-b border-dashed border-line bg-mid-bg px-3 py-2.5 sm:px-4 sm:py-3"
            >
              <Icon
                name="lucide:flask-round"
                class="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold sm:h-4 sm:w-4"
              />

              <span
                class="min-w-0 text-[10px] font-semibold uppercase tracking-wide text-navy sm:text-xs"
              >
                {{ example.title || 'Try it yourself' }}
              </span>
            </div>

            <div
              class="min-w-0 break-words px-3 py-3 text-[13px] leading-6 text-ink sm:px-5 sm:py-4 sm:text-base sm:leading-8"
              v-html="example.content_html"
            ></div>
          </div>

          <!-- PREVIOUS / NEXT -->
          <div
            class="mt-6 grid gap-2 border-t border-line pt-4 sm:mt-10 sm:grid-cols-2 sm:gap-3 sm:pt-5"
          >
            <!-- PREVIOUS -->
            <button
              v-if="prevLesson"
              type="button"
              class="flex min-w-0 items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2.5 text-left transition hover:border-navy hover:shadow-sm active:scale-[0.99] sm:gap-3 sm:px-4 sm:py-3"
              @click="openLesson(prevLesson.slug)"
            >
              <Icon
                name="lucide:chevron-left"
                class="h-4 w-4 shrink-0 text-ink-soft sm:h-5 sm:w-5"
              />

              <div class="min-w-0">
                <p
                  class="text-[9px] font-semibold uppercase tracking-wide text-ink-soft sm:text-[10px]"
                >
                  Previous
                </p>

                <p
                  class="mt-0.5 truncate text-xs font-semibold text-navy sm:text-sm"
                >
                  {{ prevLesson.title }}
                </p>
              </div>
            </button>

            <!-- NEXT -->
            <button
              v-if="nextLesson"
              type="button"
              class="flex min-w-0 items-center justify-end gap-2 rounded-xl border border-line bg-surface px-3 py-2.5 text-right transition hover:border-navy hover:shadow-sm active:scale-[0.99] sm:gap-3 sm:px-4 sm:py-3"
              @click="openLesson(nextLesson.slug)"
            >
              <div class="min-w-0">
                <p
                  class="text-[9px] font-semibold uppercase tracking-wide text-ink-soft sm:text-[10px]"
                >
                  Next
                </p>

                <p
                  class="mt-0.5 truncate text-xs font-semibold text-navy sm:text-sm"
                >
                  {{ nextLesson.title }}
                </p>
              </div>

              <Icon
                name="lucide:chevron-right"
                class="h-4 w-4 shrink-0 text-ink-soft sm:h-5 sm:w-5"
              />
            </button>
          </div>
        </article>

        <!-- EMPTY STATE -->
        <div
          v-else
          class="flex min-h-full flex-col items-center justify-center px-5 py-12 text-center"
        >
          <div
            class="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-line bg-surface text-gold shadow-sm sm:h-16 sm:w-16"
          >
            <Icon name="lucide:book-open" class="h-6 w-6 sm:h-7 sm:w-7" />
          </div>

          <h2
            class="font-['Fraunces',Georgia,serif] text-base font-semibold text-navy sm:text-xl"
          >
            Pick a lesson to begin
          </h2>

          <p
            class="mt-1 max-w-sm text-xs leading-5 text-ink-soft sm:text-sm sm:leading-6"
          >
            Choose a subject from the sidebar, or search for a lesson above.
          </p>

          <button
            type="button"
            class="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-primary/90 sm:text-sm"
            @click="sidebarOpen = true"
          >
            <Icon name="lucide:book-open" class="h-4 w-4" />
            Browse lessons
          </button>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount
} from 'vue'

const emit = defineEmits(['gohome'])

/* ================================================= */
/* LESSONS */
/* ================================================= */

const {
  sidebar,
  currentLesson,
  examples,
  results,
  loadSidebar,
  loadLesson,
  adjacentLesson,
  search
} = useLessons()

/* ================================================= */
/* LESSON PROGRESS */
/* ================================================= */

const {
  loadLessonProgress,
  getSubjectProgress,
  isLessonRead
} = useLessonProgress()

/* ================================================= */
/* UI STATE */
/* ================================================= */

const sidebarOpen = ref(false)

const openSubjects = ref<Set<string | number>>(new Set())

const searchTerm = ref('')
const showSearchResults = ref(false)

const prevLesson = ref<any>(null)
const nextLesson = ref<any>(null)

let debounceTimer: ReturnType<typeof setTimeout> | null = null

/* ================================================= */
/* SUBJECT PROGRESS */
/* ================================================= */

const getCurrentSubjectSlug = () => {
  return (
    currentLesson.value?.subject_slug ||
    currentLesson.value?.subjectSlug ||
    sidebar.value.find(
      (subject: any) =>
        String(subject.id) ===
        String(currentLesson.value?.subject_id)
    )?.slug ||
    ''
  )
}

const getCurrentSubjectProgress = computed(() => {
  const slug = getCurrentSubjectSlug()

  if (!slug) return 0

  return getSubjectProgress(slug)
})

/* ================================================= */
/* READ STATUS */
/* ================================================= */

const isLessonReadForSubject = (
  subject: any,
  lesson: any
) => {
  const subjectSlug = subject?.slug

  if (!subjectSlug || !lesson) return false

  return isLessonRead(subjectSlug, lesson)
}

/* ================================================= */
/* SUBJECT TOGGLE */
/* ================================================= */

const toggleSubject = (id: string | number) => {
  const next = new Set(openSubjects.value)

  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }

  openSubjects.value = next
}

/* ================================================= */
/* OPEN LESSON */
/* ================================================= */

const openLesson = async (slug: string) => {
  if (!slug) return

  showSearchResults.value = false
  searchTerm.value = ''
  sidebarOpen.value = false

  await loadLesson(slug)

  prevLesson.value = await adjacentLesson('prev')
  nextLesson.value = await adjacentLesson('next')

  const owner = sidebar.value.find((subject: any) =>
    (subject.topics || []).some((topic: any) =>
      (topic.lessons || []).some(
        (lesson: any) => lesson.slug === slug
      )
    )
  )

  if (owner) {
    const next = new Set(openSubjects.value)

    next.add(owner.id)

    openSubjects.value = next
  }
}

/* ================================================= */
/* SEARCH */
/* ================================================= */

const onSearchInput = () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  const term = searchTerm.value.trim()

  if (!term) {
    showSearchResults.value = false
    return
  }

  debounceTimer = setTimeout(async () => {
    showSearchResults.value = true
    await search(term)
  }, 250)
}

const clearSearch = () => {
  searchTerm.value = ''
  showSearchResults.value = false
}

/* ================================================= */
/* BREADCRUMB */
/* ================================================= */

const breadcrumbSubject = computed(() => {
  const lesson = currentLesson.value

  if (!lesson) return ''

  const owner = sidebar.value.find(
    (subject: any) =>
      String(subject.id) ===
      String(lesson.subject_id)
  )

  return owner?.name || lesson.subjectName || ''
})

const breadcrumbTopic = computed(() => {
  const lesson = currentLesson.value

  if (!lesson) return ''

  const owner = sidebar.value.find(
    (subject: any) =>
      String(subject.id) ===
      String(lesson.subject_id)
  )

  const topic = owner?.topics?.find(
    (topic: any) =>
      String(topic.id) ===
      String(lesson.topic_id)
  )

  return topic?.title || lesson.topicTitle || ''
})

/* ================================================= */
/* SEARCH SNIPPET */
/* ================================================= */

const renderSnippet = (snippet: any) => {
  if (!snippet) return ''

  return String(snippet)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(
      /⟦/g,
      '<mark class="bg-transparent font-semibold text-navy border-b-2 border-gold">'
    )
    .replace(/⟧/g, '</mark>')
}

/* ================================================= */
/* HOME */
/* ================================================= */

const goHome = () => {
  sidebarOpen.value = false
  emit('gohome')
}

/* ================================================= */
/* LIFECYCLE */
/* ================================================= */

onMounted(async () => {
  loadLessonProgress()

  await loadSidebar()

  if (sidebar.value.length) {
    const firstSubject = sidebar.value[0]

    openSubjects.value = new Set([
      firstSubject.id
    ])

    const firstLesson =
      firstSubject.topics?.[0]?.lessons?.[0]

    if (firstLesson) {
      await openLesson(firstLesson.slug)
    }
  }
})

onBeforeUnmount(() => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap');

/* ================================================= */
/* LESSON CONTENT */
/* ================================================= */

.prose-lesson {
  max-width: 100%;
  overflow-wrap: anywhere;
  word-break: break-word;
  font-size: 13px;
  line-height: 1.8;
}

/* Paragraphs */
.prose-lesson :deep(p) {
  margin-top: 0.65rem;
  margin-bottom: 0.65rem;
}

/* Headings */
.prose-lesson :deep(h1),
.prose-lesson :deep(h2),
.prose-lesson :deep(h3),
.prose-lesson :deep(h4) {
  margin-top: 1.1rem;
  margin-bottom: 0.5rem;
  color: var(--color-navy, #24304a);
  line-height: 1.35;
  font-weight: 600;
}

.prose-lesson :deep(h1) {
  font-size: 1.25rem;
}

.prose-lesson :deep(h2) {
  font-size: 1.05rem;
}

.prose-lesson :deep(h3) {
  font-size: 0.95rem;
}

.prose-lesson :deep(h4) {
  font-size: 0.875rem;
}

/* Lists */
.prose-lesson :deep(ul),
.prose-lesson :deep(ol) {
  margin: 0.65rem 0;
  padding-left: 1.2rem;
}

.prose-lesson :deep(li) {
  margin: 0.25rem 0;
}

/* Line breaks */
.prose-lesson :deep(br) {
  display: block;
  content: '';
  margin-top: 0.35em;
}

/* Strong text */
.prose-lesson :deep(strong),
.prose-lesson :deep(b) {
  font-weight: 600;
}

/* Images */
.prose-lesson :deep(img) {
  display: block;
  width: auto;
  max-width: 100%;
  height: auto;
  margin: 0.9rem auto;
  border-radius: 0.6rem;
}

/* Tables */
.prose-lesson :deep(table) {
  display: block;
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  border-collapse: collapse;
  font-size: 12px;
  line-height: 1.5;
}

.prose-lesson :deep(th),
.prose-lesson :deep(td) {
  padding: 0.45rem;
  white-space: normal;
}

/* Code blocks */
.prose-lesson :deep(pre) {
  max-width: 100%;
  overflow-x: auto;
  padding: 0.75rem;
  border-radius: 0.6rem;
  font-size: 11px;
  line-height: 1.6;
}

.prose-lesson :deep(code) {
  overflow-wrap: anywhere;
  word-break: break-word;
  font-size: 0.85em;
}

/* Blockquotes */
.prose-lesson :deep(blockquote) {
  margin: 0.8rem 0;
  padding: 0.6rem 0.8rem;
  border-left: 3px solid #b9873b;
  font-size: 12px;
}

/* Embedded content */
.prose-lesson :deep(iframe),
.prose-lesson :deep(video) {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 0.8rem auto;
}

/* ================================================= */
/* TABLET AND DESKTOP */
/* ================================================= */

@media (min-width: 640px) {
  .prose-lesson {
    font-size: 16px;
    line-height: 2;
  }

  .prose-lesson :deep(p) {
    margin-top: 0.9rem;
    margin-bottom: 0.9rem;
  }

  .prose-lesson :deep(h1) {
    font-size: 1.75rem;
  }

  .prose-lesson :deep(h2) {
    font-size: 1.4rem;
  }

  .prose-lesson :deep(h3) {
    font-size: 1.2rem;
  }

  .prose-lesson :deep(h4) {
    font-size: 1rem;
  }

  .prose-lesson :deep(table) {
    font-size: 14px;
  }

  .prose-lesson :deep(pre) {
    font-size: 13px;
  }
}

/* ================================================= */
/* MOBILE SIDEBAR ANIMATION */
/* ================================================= */

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ================================================= */
/* SCROLLBARS */
/* ================================================= */

aside ::-webkit-scrollbar,
main ::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

aside ::-webkit-scrollbar-thumb,
main ::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(100, 116, 139, 0.25);
}

/* ================================================= */
/* SMALL PHONES */
/* ================================================= */

@media (max-width: 380px) {
  .prose-lesson {
    font-size: 12.5px;
    line-height: 1.75;
  }

  .prose-lesson :deep(h1) {
    font-size: 1.1rem;
  }

  .prose-lesson :deep(h2) {
    font-size: 0.98rem;
  }

  .prose-lesson :deep(h3) {
    font-size: 0.9rem;
  }

  .prose-lesson :deep(p) {
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
  }
}
</style>