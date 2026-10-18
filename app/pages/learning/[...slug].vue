<template>
  <div
    class="flex h-full min-h-0 flex-col overflow-hidden bg-white font-['Inter',system-ui,sans-serif] text-slate-800"
  >
    <!-- ========================================================= -->
    <!-- TOP BAR -->
    <!-- ========================================================= -->

    <header
      class="z-40 flex h-14 shrink-0 items-center gap-2 border-b border-slate-200 bg-primary px-3 text-white sm:gap-3 sm:px-6"
    >
      <!-- MOBILE MENU -->
      <button
        type="button"
        aria-label="Open menu"
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition hover:bg-white/10 lg:hidden"
        @click="sidebarOpen = !sidebarOpen"
      >
        <Icon name="lucide:menu" class="h-5 w-5" />
      </button>

      <!-- BACK -->
      <button
        type="button"
        aria-label="Go home"
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition hover:bg-white/10"
        @click="goHome"
      >
        <Icon name="lucide:arrow-left" class="h-5 w-5" />
      </button>

      <!-- TITLE -->
      <div class="min-w-0 flex-1">
        <p class="truncate text-[10px] uppercase tracking-widest text-white/60">
          {{ breadcrumbSubject || "Learning" }}

          <span v-if="breadcrumbTopic && !lessonLoading && !lessonNotFound">
            / {{ breadcrumbTopic }}
          </span>
        </p>

        <h1 class="truncate text-sm font-semibold sm:text-base">
          {{ headerTitle }}
        </h1>
      </div>

      <!-- LESSON LOADING SPINNER (top bar) -->
      <Icon
        v-if="lessonLoading"
        name="lucide:loader-2"
        class="h-4 w-4 shrink-0 animate-spin text-white/70"
      />

      <!-- GLOBAL SEARCH -->
      <div class="relative hidden sm:block">
        <Icon
          name="lucide:search"
          class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50"
        />

        <input
          v-model="searchTerm"
          type="text"
          placeholder="Search lessons..."
          class="w-52 rounded-lg border border-white/10 bg-white/10 py-2 pl-9 pr-3 text-sm text-white outline-none placeholder:text-white/50 transition focus:border-white/30 focus:bg-white/15"
          @input="onSearchInput"
        />
      </div>
    </header>

    <!-- ========================================================= -->
    <!-- MOBILE SEARCH -->
    <!-- ========================================================= -->

    <div class="shrink-0 border-b border-slate-200 bg-white p-3 sm:hidden">
      <div class="relative">
        <Icon
          name="lucide:search"
          class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        />

        <input
          v-model="searchTerm"
          type="text"
          placeholder="Search lessons..."
          class="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-navy focus:bg-white"
          @input="onSearchInput"
        />
      </div>
    </div>

    <!-- SUBJECT PROGRESS / LOADING BAR -->
    <div class="relative h-1 w-full shrink-0 overflow-hidden bg-slate-100">
      <!-- Indeterminate bar while a lesson or the sidebar is loading -->
      <div
        v-if="showMainLoading"
        class="loading-bar absolute inset-y-0 w-1/3 bg-gold"
      ></div>

      <div
        v-else
        class="h-full bg-gold transition-all duration-300"
        :style="{ width: `${progressPercent}%` }"
      ></div>
    </div>

    <!-- ========================================================= -->
    <!-- BODY -->
    <!-- ========================================================= -->

    <div class="relative flex min-h-0 flex-1">
      <!-- MOBILE OVERLAY -->
      <div
        v-if="sidebarOpen"
        class="fixed inset-0 z-20 bg-black/40 lg:hidden"
        @click="sidebarOpen = false"
      ></div>

      <!-- ======================================================= -->
      <!-- SIDEBAR -->
      <!-- ======================================================= -->

      <aside
        class="z-30 w-[min(84vw,288px)] shrink-0 overflow-y-auto border-r border-slate-200 bg-slate-50 lg:relative lg:block lg:w-72"
        :class="
          sidebarOpen
            ? 'absolute inset-y-0 left-0 block h-full shadow-xl'
            : 'hidden'
        "
      >
        <!-- SELECTED SUBJECT -->
        <div class="border-b border-slate-200 bg-white px-4 py-4">
          <p
            class="text-[10px] font-bold uppercase tracking-widest text-slate-400"
          >
            Current Subject
          </p>

          <div class="mt-2 flex items-center gap-2">
            <div
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold"
            >
              <Icon name="lucide:book-open" class="h-5 w-5" />
            </div>

            <div class="min-w-0">
              <h2 class="truncate text-sm font-bold text-navy">
                {{ selectedSubject?.name || breadcrumbSubject || "Subject" }}
              </h2>

              <p class="mt-0.5 text-xs text-slate-500">
                <span v-if="sidebarLoading">Loading...</span>
                <span v-else>{{ totalLessons }} lessons</span>
              </p>
            </div>
          </div>

          <!-- SUBJECT PROGRESS -->
          <div class="mt-4">
            <div class="mb-1 flex items-center justify-between">
              <span class="text-[11px] text-slate-400">
                Reading progress
              </span>

              <span class="text-[11px] font-bold text-navy">
                {{ progressPercent }}%
              </span>
            </div>

            <div class="h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                class="h-full rounded-full bg-gold transition-all"
                :style="{ width: `${progressPercent}%` }"
              ></div>
            </div>
          </div>
        </div>

        <!-- ===================================================== -->
        <!-- SELECTED TOPIC HEADER -->
        <!-- ===================================================== -->

        <div
          v-if="selectedTopic"
          class="border-b border-slate-200 bg-white px-4 py-3"
        >
          <button
            type="button"
            class="mb-3 flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 transition hover:text-navy"
            @click="clearSelectedTopic"
          >
            <Icon name="lucide:arrow-left" class="h-3.5 w-3.5" />
            All topics
          </button>

          <div class="flex items-center gap-2">
            <div
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold"
            >
              <Icon name="lucide:folder-open" class="h-4 w-4" />
            </div>

            <div class="min-w-0">
              <p class="truncate text-xs font-bold text-navy">
                {{ selectedTopic.title }}
              </p>

              <p class="text-[10px] text-slate-400">
                {{ selectedTopicLessons.length }} lessons
              </p>
            </div>
          </div>

          <!-- TOPIC SEARCH -->
          <div class="relative mt-3">
            <Icon
              name="lucide:search"
              class="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
            />

            <input
              v-model="topicSearchTerm"
              type="text"
              placeholder="Search lessons in this topic..."
              class="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-xs text-slate-700 outline-none transition focus:border-navy focus:bg-white"
            />
          </div>
        </div>

        <!-- ===================================================== -->
        <!-- TOPICS -->
        <!-- ===================================================== -->

        <div class="py-3">
          <!-- SIDEBAR LOADING -->
          <div
            v-if="sidebarLoading"
            class="space-y-3 px-4 py-2"
            role="status"
            aria-live="polite"
          >
            <div
              v-for="n in 4"
              :key="n"
              class="flex animate-pulse items-center gap-2"
            >
              <div class="h-4 w-4 shrink-0 rounded bg-slate-200"></div>
              <div class="h-3 flex-1 rounded bg-slate-200"></div>
              <div class="h-3 w-5 shrink-0 rounded bg-slate-200"></div>
            </div>

            <span class="sr-only">Loading topics...</span>
          </div>

          <!-- NO TOPICS -->
          <div
            v-else-if="!selectedSubjectTopics.length"
            class="px-4 py-8 text-center"
          >
            <Icon
              name="lucide:book-open"
              class="mx-auto h-8 w-8 text-slate-300"
            />

            <p class="mt-3 text-xs text-slate-500">
              No topics available for this subject.
            </p>
          </div>

          <!-- TOPIC LIST -->
          <template v-else>
            <div
              v-for="topic in selectedSubjectTopics"
              :key="topic.id"
              class="mb-2" :class=" topic.lessons?.length ? 'block' : '  hidden '"
            >
              <!-- TOPIC HEADER -->
              <button
                type="button"
                class="flex w-full items-center gap-2 px-4 py-2 text-left transition hover:bg-white"
                :class="
                  String(selectedTopicId) === String(topic.id)
                    ? 'bg-white'
                    : ''
                "
                @click="selectTopic(topic)"
              >
                <Icon
                  :name="
                    String(selectedTopicId) === String(topic.id)
                      ? 'lucide:folder-open'
                      : 'lucide:folder'
                  "
                  class="h-4 w-4 shrink-0 text-gold"
                />

                <p
                  class="min-w-0 flex-1 truncate text-[11px] font-bold uppercase tracking-wide"
                  :class="
                    String(selectedTopicId) === String(topic.id)
                      ? 'text-navy'
                      : 'text-slate-500'
                  "
                >
                  {{ topic.title }}
                </p>

                <span class="text-[10px] text-slate-400">
                  {{ topic.lessons?.length || 0 }}
                </span>

                <Icon
                  :name="
                    String(selectedTopicId) === String(topic.id)
                      ? 'lucide:chevron-down'
                      : 'lucide:chevron-right'
                  "
                  class="h-3.5 w-3.5 shrink-0 text-slate-400"
                />
              </button>

              <!-- ================================================= -->
              <!-- LESSONS -->
              <!-- ================================================= -->

              <div
                v-if="String(selectedTopicId) === String(topic.id)"
                class="space-y-0.5 border-t border-slate-100 bg-white/50 py-1"
              >
                <!-- LOADING -->
                <div
                  v-if="topicLoading"
                  class="flex items-center gap-2 px-4 py-4 text-xs text-slate-400"
                >
                  <Icon
                    name="lucide:loader-2"
                    class="h-4 w-4 animate-spin"
                  />

                  Loading lessons...
                </div>

                <!-- EMPTY -->
                <div
                  v-else-if="!filteredTopicLessons.length"
                  class="px-4 py-5 text-center"
                >
                  <Icon
                    name="lucide:search-x"
                    class="mx-auto h-6 w-6 text-slate-300"
                  />

                  <p class="mt-2 text-[11px] text-slate-400">
                    {{
                      topicSearchTerm
                        ? "No lessons match your search."
                        : "No lessons available in this topic."
                    }}
                  </p>
                </div>

                <!-- LESSONS -->
                <template v-else>
                  <NuxtLink
                    v-for="lesson in filteredTopicLessons"
                    :key="lesson.id || lesson.slug"
                    :to="lessonUrl(lesson)"
                    class="group flex min-w-0 items-center gap-2 border-l-[3px] px-4 py-2.5 text-[13px] transition"
                    :class="
                      isCurrentLesson(lesson)
                        ? 'border-navy bg-white font-semibold text-navy'
                        : 'border-transparent text-slate-600 hover:bg-white hover:text-navy'
                    "
                    @click="handleLessonNavigation"
                  >
                    <!-- Spinner on the lesson that is currently loading -->
                    <Icon
                      v-if="lessonLoading && isCurrentLesson(lesson)"
                      name="lucide:loader-2"
                      class="h-4 w-4 shrink-0 animate-spin text-gold"
                    />

                    <Icon
                      v-else
                      name="lucide:file-text"
                      class="h-4 w-4 shrink-0"
                      :class="
                        isCurrentLesson(lesson)
                          ? 'text-gold'
                          : 'text-slate-400'
                      "
                    />

                    <span class="min-w-0 flex-1 truncate">
                      {{ lesson.title }}
                    </span>

                    <span
                      v-if="getCurrentLessonTime(lesson) > 0"
                      class="hidden text-[9px] text-slate-400 xl:inline"
                    >
                      {{ formatReadingTime(getCurrentLessonTime(lesson)) }}
                    </span>

                    <Icon
                      v-if="isCurrentLessonRead(lesson)"
                      name="lucide:check-circle-2"
                      class="h-4 w-4 shrink-0 text-emerald-500"
                      title="Read"
                    />

                    <Icon
                      v-else
                      name="lucide:circle"
                      class="h-4 w-4 shrink-0 text-slate-300"
                      title="Unread"
                    />
                  </NuxtLink>
                </template>
              </div>
            </div>
          </template>
        </div>
      </aside>

      <!-- ======================================================= -->
      <!-- MAIN -->
      <!-- ======================================================= -->

      <main
        class="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden bg-white"
      >
        <!-- ===================================================== -->
        <!-- GLOBAL SEARCH -->
        <!-- ===================================================== -->

        <div
          v-if="showSearchResults"
          class="mx-auto w-full max-w-3xl px-4 py-6 sm:px-10 sm:py-8"
        >
          <div class="mb-6 flex items-center justify-between gap-3">
            <div class="min-w-0">
              <p
                class="text-xs font-semibold uppercase tracking-widest text-gold"
              >
                Search
              </p>

              <h2 class="mt-1 truncate text-xl font-bold text-slate-900">
                Results for "{{ searchTerm }}"
              </h2>
            </div>

            <button
              type="button"
              class="shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-50"
              @click="clearSearch"
            >
              Clear
            </button>
          </div>

          <!-- SEARCH LOADING -->
          <div
            v-if="loading"
            class="flex min-h-[250px] flex-col items-center justify-center"
          >
            <Icon
              name="lucide:loader-2"
              class="h-8 w-8 animate-spin text-gold"
            />

            <p class="mt-3 text-sm font-medium text-slate-500">
              Searching lessons...
            </p>

            <p class="mt-1 text-xs text-slate-400">
              Please wait while we find matching lessons.
            </p>
          </div>

          <!-- RESULTS -->
          <ul
            v-else-if="results.length"
            class="space-y-3"
          >
            <li
              v-for="row in results"
              :key="row.slug"
              class="cursor-pointer rounded-xl border border-slate-200 p-4 transition hover:border-navy hover:shadow-sm"
              @click="navigateTo(lessonSearchUrl(row))"
            >
              <span
                class="mb-2 inline-block rounded bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500"
              >
                {{ row.subjectName }}
              </span>

              <h3 class="text-base font-semibold text-navy">
                {{ row.title }}
              </h3>

              <p
                class="mt-1 text-sm text-slate-500"
                v-html="renderSnippet(row.snippet)"
              ></p>
            </li>
          </ul>

          <!-- NO RESULTS -->
          <div
            v-else
            class="py-12 text-center"
          >
            <Icon
              name="lucide:search-x"
              class="mx-auto h-10 w-10 text-slate-300"
            />

            <p class="mt-3 text-sm font-semibold text-slate-600">
              No lessons found
            </p>

            <p class="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-400">
              No lessons matched
              <span class="font-semibold text-slate-500">
                "{{ searchTerm }}"
              </span>.
              Try another lesson title or keyword.
            </p>

            <button
              type="button"
              class="mt-4 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white transition hover:bg-primary/90"
              @click="clearSearch"
            >
              Clear search
            </button>
          </div>
        </div>

        <!-- ===================================================== -->
        <!-- LESSON / PAGE LOADING                                 -->
        <!-- Replaces the old content while a lesson is loading,   -->
        <!-- so the previous lesson never stays on screen.         -->
        <!-- ===================================================== -->

        <div
          v-else-if="showMainLoading"
          class="mx-auto w-full max-w-3xl px-4 py-6 sm:px-10 sm:py-10"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <div class="flex items-center gap-3">
            <Icon
              name="lucide:loader-2"
              class="h-6 w-6 shrink-0 animate-spin text-gold"
            />

            <div class="min-w-0">
              <p class="text-sm font-semibold text-slate-700">
                {{ lessonLoading ? "Loading lesson..." : "Loading learning materials..." }}
              </p>

              <p class="mt-0.5 text-xs text-slate-400">
                Please wait a moment.
              </p>
            </div>
          </div>

          <!-- SKELETON -->
          <div class="mt-8 animate-pulse space-y-4" aria-hidden="true">
            <div class="h-3 w-40 rounded bg-slate-200"></div>
            <div class="h-8 w-3/4 rounded bg-slate-200"></div>

            <div class="space-y-2.5 pt-4">
              <div class="h-3 w-full rounded bg-slate-100"></div>
              <div class="h-3 w-full rounded bg-slate-100"></div>
              <div class="h-3 w-5/6 rounded bg-slate-100"></div>
            </div>

            <div class="space-y-2.5 pt-4">
              <div class="h-3 w-full rounded bg-slate-100"></div>
              <div class="h-3 w-11/12 rounded bg-slate-100"></div>
              <div class="h-3 w-2/3 rounded bg-slate-100"></div>
            </div>

            <div class="h-40 w-full rounded-xl bg-slate-100"></div>
          </div>
        </div>

        <!-- ===================================================== -->
        <!-- NO LESSON FOUND                                       -->
        <!-- Shown when the lesson slug does not exist (or fails   -->
        <!-- to load), instead of silently showing the subject     -->
        <!-- landing page.                                         -->
        <!-- ===================================================== -->

        <div
          v-else-if="lessonNotFound"
          class="mx-auto w-full max-w-3xl px-4 py-16 text-center sm:px-10"
          role="alert"
        >
          <Icon
            name="lucide:file-x"
            class="mx-auto h-12 w-12 text-slate-300"
          />

          <h2 class="mt-4 text-lg font-bold text-slate-700">
            No lesson found
          </h2>

          <p class="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
            This lesson does not exist or may have been removed. Choose another
            lesson from the sidebar.
          </p>

          <p
            v-if="lessonError"
            class="mx-auto mt-3 max-w-sm break-words rounded-lg bg-slate-50 p-3 text-left text-[11px] text-slate-500"
          >
            {{ lessonError }}
          </p>

          <div class="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              class="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white transition hover:bg-primary/90"
              @click="navigateTo(`/learning/${subjectSlug}`)"
            >
              Back to subject
            </button>

            <button
              v-if="lessonError"
              type="button"
              class="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              @click="openLessonBySlug(routeLessonSlug)"
            >
              Try again
            </button>
          </div>
        </div>

        <!-- ===================================================== -->
        <!-- SUBJECT LANDING -->
        <!-- ===================================================== -->

        <article
          v-else-if="!currentLesson"
          class="mx-auto w-full max-w-5xl px-4 py-7 sm:px-10 sm:py-10"
        >
          <!-- SUBJECT INTRO -->
          <div class="mb-8">
            <span
              class="inline-flex items-center gap-2 rounded-full bg-gold/10 px-3 py-1.5 text-xs font-semibold text-gold"
            >
              <Icon name="lucide:book-open" class="h-4 w-4" />
              Subject Overview
            </span>

            <h1 class="mt-4 text-2xl font-bold text-slate-900 sm:text-4xl">
              {{ selectedSubject?.name || breadcrumbSubject || "Subject" }}
            </h1>

            <p class="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              Read the subject material below or select a topic and lesson from
              the sidebar to begin learning.
            </p>
          </div>

          <!-- SUBJECT PDF -->
          <div
            v-if="subjectPdfUrl"
            class="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm"
          >
            <div
              class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3"
            >
              <div class="flex items-center gap-2">
                <Icon
                  name="lucide:file-pdf"
                  class="h-5 w-5 text-red-500"
                />

                <span class="text-sm font-semibold text-slate-700">
                  Subject PDF
                </span>
              </div>

              <a
                :href="subjectPdfUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Open PDF

                <Icon
                  name="lucide:external-link"
                  class="h-3.5 w-3.5"
                />
              </a>
            </div>

            <iframe
              :src="subjectPdfUrl"
              title="Subject PDF"
              class="h-[70vh] w-full"
            ></iframe>
          </div>

          <!-- NO PDF -->
          <div
            v-else
            class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-12 text-center sm:px-6 sm:py-16"
          >
            <Icon
              name="lucide:file-text"
              class="mx-auto h-12 w-12 text-slate-300 sm:h-14 sm:w-14"
            />

            <h2 class="mt-4 text-lg font-bold text-slate-700">
              Welcome to {{ selectedSubject?.name || "this subject" }}
            </h2>

            <p class="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Choose a topic from the sidebar, then select a lesson to start
              studying.
            </p>

            <button
              v-if="firstLesson"
              type="button"
              class="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/90"
              @click="navigateTo(lessonUrl(firstLesson))"
            >
              Start Learning

              <Icon
                name="lucide:arrow-right"
                class="h-4 w-4"
              />
            </button>
          </div>

          <!-- TOPIC SUMMARY -->
          <div
            v-if="selectedSubjectTopics.length"
            class="mt-8 grid gap-3 sm:grid-cols-2"
          >
            <button
              v-for="topic in selectedSubjectTopics"
              :key="topic.id"
              type="button"
              class="rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-navy hover:shadow-sm"
              @click="selectTopic(topic, { openSidebar: true })"
            >
              <div class="flex items-center gap-2">
                <Icon
                  name="lucide:folder"
                  class="h-4 w-4 text-gold"
                />

                <h3
                  class="min-w-0 flex-1 truncate text-sm font-bold text-navy"
                >
                  {{ topic.title }}
                </h3>

                <Icon
                  name="lucide:chevron-right"
                  class="h-4 w-4 shrink-0 text-slate-300"
                />
              </div>

              <p class="mt-2 text-xs text-slate-500">
                {{ topic.lessons?.length || 0 }} lessons available
              </p>
            </button>
          </div>
        </article>

        <!-- ===================================================== -->
        <!-- LESSON CONTENT -->
        <!-- ===================================================== -->

        <article
          v-else
          class="mx-auto w-full max-w-3xl px-4 py-6 sm:px-10 sm:py-10"
        >
          <!-- BREADCRUMB -->
          <div
            class="mb-4 flex flex-wrap items-center gap-2 text-xs text-slate-400"
          >
            <span>{{ breadcrumbSubject }}</span>

            <Icon
              name="lucide:chevron-right"
              class="h-3.5 w-3.5"
            />

            <span>{{ breadcrumbTopic }}</span>

            <Icon
              name="lucide:chevron-right"
              class="h-3.5 w-3.5"
            />

            <span class="font-semibold text-slate-600">
              Lesson
            </span>
          </div>

          <!-- LESSON TITLE -->
          <div class="flex min-w-0 items-start justify-between gap-3">
            <h1
              class="min-w-0 text-2xl font-bold leading-tight text-slate-900 sm:text-4xl"
            >
              {{ currentLesson.title }}
            </h1>

            <!-- READ -->
            <span
              v-if="isCurrentLessonRead(currentLesson)"
              class="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-1.5 text-[10px] font-semibold text-emerald-600 sm:px-3 sm:text-xs"
            >
              <Icon
                name="lucide:check-circle-2"
                class="h-4 w-4"
              />

              <span class="hidden sm:inline">
                Read
              </span>
            </span>

            <span
              v-else
              class="inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-2 py-1.5 text-[10px] font-semibold text-slate-500 sm:px-3 sm:text-xs"
            >
              <Icon
                name="lucide:circle"
                class="h-4 w-4"
              />

              <span class="hidden sm:inline">
                Unread
              </span>
            </span>
          </div>

          <!-- TOPIC IMPORTER -->
          <div class="mt-5">
            <!--
            <TopicImporter
              :lesson-id="currentLesson.id ?? currentLesson.lessonId"
              @updated="handleLessonUpdated"
            />
            -->
          </div>

          <!-- LESSON BLOCKS -->
          <div class="mt-6">
            <LessonBlock
              v-for="(block, index) in currentLesson.blocks || []"
              :key="index"
              :block="block"
            />
          </div>

          <!-- =================================================== -->
          <!-- READING PROGRESS -->
          <!-- =================================================== -->

          <div
            class="mt-10 hidden rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex min-w-0 items-start gap-3">
                <div
                  class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  :class="
                    isCurrentLessonRead(currentLesson)
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-gold/10 text-gold'
                  "
                >
                  <Icon
                    :name="
                      isCurrentLessonRead(currentLesson)
                        ? 'lucide:check-circle-2'
                        : 'lucide:book-open'
                    "
                    class="h-5 w-5"
                  />
                </div>

                <div class="min-w-0 hidden">
                  <h3
                    class="text-sm hidden font-bold text-slate-800 sm:text-base"
                  >
                    {{
                      isCurrentLessonRead(currentLesson)
                        ? "Reading completed"
                        : "Study this lesson"
                    }}
                  </h3>

                  <p
                    class="mt-1 text-xs leading-5 text-slate-500 sm:text-sm"
                  >
                    {{
                      isCurrentLessonRead(currentLesson)
                        ? "Your active reading time has been saved for this lesson."
                        : "Read and understand the material. The lesson will be marked as read after 80% of the estimated reading time."
                    }}
                  </p>
                </div>
              </div>

              <span
                class="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold sm:text-xs"
                :class="
                  isCurrentLessonRead(currentLesson)
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-white text-slate-500'
                "
              >
                {{ isCurrentLessonRead(currentLesson) ? "Read" : "In progress" }}
              </span>
            </div>

            <!-- TIME CARDS -->
            <div class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div class="rounded-xl bg-white p-3">
                <p
                  class="text-[10px] uppercase tracking-wide text-slate-400"
                >
                  Estimated time
                </p>

                <p class="mt-1 text-lg font-bold text-navy">
                  {{ estimatedReadingMinutes }} min
                </p>
              </div>

              <div class="rounded-xl bg-white p-3">
                <p
                  class="text-[10px] uppercase tracking-wide text-slate-400"
                >
                  Required time
                </p>

                <p class="mt-1 text-lg font-bold text-navy">
                  {{ requiredReadingMinutes }} min
                </p>
              </div>

              <div
                class="col-span-2 rounded-xl bg-white p-3 sm:col-span-1"
              >
                <p
                  class="text-[10px] uppercase tracking-wide text-slate-400"
                >
                  Saved active time
                </p>

                <p class="mt-1 text-lg font-bold text-navy">
                  {{ formatReadingTime(readingSeconds) }}
                </p>
              </div>
            </div>

            <!-- READING PROGRESS -->
            <div class="mt-5">
              <div
                class="mb-2 flex items-center justify-between gap-3"
              >
                <span class="text-xs font-semibold text-slate-600">
                  Reading progress
                </span>

                <span class="text-xs font-bold text-gold">
                  {{ readingProgressPercent }}%
                </span>
              </div>

              <div
                class="h-2.5 overflow-hidden rounded-full bg-slate-200"
              >
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :class="
                    isCurrentLessonRead(currentLesson)
                      ? 'bg-emerald-500'
                      : 'bg-gold'
                  "
                  :style="{
                    width: `${readingProgressPercent}%`,
                  }"
                ></div>
              </div>

              <p class="mt-2 text-[11px] leading-5 text-slate-500">
                <span v-if="!isCurrentLessonRead(currentLesson)">
                  Scroll to the lesson navigation buttons to mark this lesson as read.
                </span>

                <span
                  v-else
                  class="font-semibold text-emerald-600"
                >
                  Great work! This lesson has been marked as read.
                </span>
              </p>
            </div>
          </div>

          <!-- =================================================== -->
          <!-- PREVIOUS / NEXT -->
          <!-- =================================================== -->

          <div
            class="mt-8 flex items-stretch justify-between gap-3 border-t border-slate-200 pt-6"
            ref="lessonCompletionTarget"
          >
            <!-- PREVIOUS -->
            <NuxtLink
              v-if="prevLesson"
              :to="lessonUrl(prevLesson)"
              class="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-200 px-3 py-3 text-left transition hover:border-navy sm:px-4"
            >
              <Icon
                name="lucide:chevron-left"
                class="h-4 w-4 shrink-0 text-slate-400"
              />

              <div class="min-w-0">
                <p
                  class="text-[10px] uppercase tracking-wide text-slate-400"
                >
                  Previous
                </p>

                <p
                  class="truncate text-xs font-semibold text-navy sm:text-sm"
                >
                  {{ prevLesson.title }}
                </p>
              </div>
            </NuxtLink>

            <div
              v-else
              class="flex-1"
            ></div>

            <!-- NEXT -->
            <NuxtLink
              v-if="nextLesson"
              :to="lessonUrl(nextLesson)"
              class="flex min-w-0 flex-1 items-center justify-end gap-2 rounded-xl border border-slate-200 px-3 py-3 text-right transition hover:border-navy sm:px-4"
            >
              <div class="min-w-0">
                <p
                  class="text-[10px] uppercase tracking-wide text-slate-400"
                >
                  Next
                </p>

                <p
                  class="truncate text-xs font-semibold text-navy sm:text-sm"
                >
                  {{ nextLesson.title }}
                </p>
              </div>

              <Icon
                name="lucide:chevron-right"
                class="h-4 w-4 shrink-0 text-slate-400"
              />
            </NuxtLink>

            <div
              v-else
              class="flex-1"
            ></div>
          </div>
        </article>
      </main>
    </div>

    <!-- ========================================================= -->
    <!-- DELETE MODAL -->
    <!-- ========================================================= -->

    <Teleport to="body">
      <div
        v-if="showDelete"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
        @click.self="closeDelete"
      >
        <div class="w-full max-w-md">
          <Delete
            :type="deleteType"
            :id="deleteId"
            :name="deleteName"
            @deleted="handleDeleted"
            @cancel="closeDelete"
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  nextTick,
  watch,
  onMounted,
  onBeforeUnmount,
} from "vue";

/*
|--------------------------------------------------------------------------
| ROUTE
|--------------------------------------------------------------------------
*/

const route = useRoute();

/*
|--------------------------------------------------------------------------
| LESSONS COMPOSABLE
|--------------------------------------------------------------------------
*/

const {
  sidebar,
  currentLesson,
  results,
  loadSidebar,
  loadLesson,
  adjacentLesson,
  search,
  loading,
} = useLessons();

/*
|--------------------------------------------------------------------------
| LESSON PROGRESS
|--------------------------------------------------------------------------
*/

const {
  readingSeconds,
  estimatedReadingMinutes,
  readingCompleted,
  requiredReadingMinutes,
  readingProgressPercent,
  loadLessonProgress,
  getLessonTime,
  isLessonRead,
  markLessonAsRead,
  recordLastOpenedLesson,
  getSubjectProgress,
  flushReadingTime,
  resetReadingTracker,
  stopReadingTimer,
  formatReadingTime,
} = useLessonProgress();

/*
|--------------------------------------------------------------------------
| ROUTE PARAMETERS
|--------------------------------------------------------------------------
*/

const routeSegments = computed(() => {
  const value = route.params.slug;

  if (Array.isArray(value)) {
    return value.map(String);
  }

  if (value) {
    return [String(value)];
  }

  return [];
});

const routeSubjectSlug = computed(() => {
  return routeSegments.value[0] || "";
});

const routeLessonSlug = computed(() => {
  return routeSegments.value[1] || "";
});

/*
|--------------------------------------------------------------------------
| UI STATE
|--------------------------------------------------------------------------
*/

const sidebarOpen = ref(false);

const searchTerm = ref("");

const showSearchResults = ref(false);

const prevLesson = ref<any>(null);

const nextLesson = ref<any>(null);

const openSubjects = ref(new Set());

/*
|--------------------------------------------------------------------------
| LOADING STATE
|--------------------------------------------------------------------------
| lessonLoading  -> a lesson is being fetched (starts true when the page
|                   is opened directly on a lesson URL, so the subject
|                   landing page never flashes first)
| sidebarLoading -> subjects / topics / lessons list is being fetched
| lessonNotFound -> the lesson slug does not exist (or failed to load)
| lessonError    -> error message when loading the lesson threw an error
|--------------------------------------------------------------------------
*/

const lessonLoading = ref(!!routeLessonSlug.value);

const sidebarLoading = ref(true);

const lessonNotFound = ref(false);

const lessonError = ref("");

// Guards against a slow, older request finishing after a newer one
let lessonRequestId = 0;

const showMainLoading = computed(() => {
  return (
    lessonLoading.value ||
    (sidebarLoading.value && !currentLesson.value)
  );
});

const headerTitle = computed(() => {
  if (lessonLoading.value) {
    return "Loading lesson...";
  }

  if (lessonNotFound.value) {
    return "Lesson not found";
  }

  return (
    currentLesson.value?.title ||
    selectedSubject.value?.name ||
    "Learning"
  );
});

const fetchSidebar = async () => {
  sidebarLoading.value = true;

  try {
    await loadSidebar();
  } catch (error) {
    console.error("Failed to load sidebar:", error);
  } finally {
    sidebarLoading.value = false;
  }
};

/*
|--------------------------------------------------------------------------
| LESSON COMPLETION OBSERVER
|--------------------------------------------------------------------------
*/

const lessonCompletionTarget = ref<HTMLElement | null>(null);
let lessonCompletionObserver: IntersectionObserver | null = null;

const observeLessonCompletion = async () => {
  lessonCompletionObserver?.disconnect();
  lessonCompletionObserver = null;

  if (
    !import.meta.client ||
    lessonLoading.value ||
    lessonNotFound.value ||
    !currentLesson.value ||
    (currentLesson.value.slug &&
      currentLesson.value.slug !== routeLessonSlug.value) ||
    isLessonRead(currentSubjectKey.value, currentLesson.value)
  ) {
    return;
  }

  // Wait for the lesson article to render so the target element exists
  await nextTick();

  const target = lessonCompletionTarget.value;
  if (!target) return;

  lessonCompletionObserver = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;

      lessonCompletionObserver?.disconnect();
      lessonCompletionObserver = null;

      const lesson = currentLesson.value;
      if (
        lesson &&
        (!lesson.slug || lesson.slug === routeLessonSlug.value) &&
        !isLessonRead(currentSubjectKey.value, lesson)
      ) {
        markLessonAsRead(
          currentSubjectKey.value,
          lesson,
          totalLessons.value,
        );
      }
    },
    { threshold: 0.25 },
  );

  lessonCompletionObserver.observe(target);
};

/*
|--------------------------------------------------------------------------
| TOPIC STATE
|--------------------------------------------------------------------------
*/

const selectedTopicId = ref<string | null>(null);

const topicSearchTerm = ref("");

const topicLoading = ref(false);

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

/*
|--------------------------------------------------------------------------
| DELETE STATE
|--------------------------------------------------------------------------
*/

const showDelete = ref(false);

const deleteType = ref("topic");

const deleteId = ref("");

const deleteName = ref("");

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const lessonKey = (lesson: any) => {
  return String(
    lesson?.id ||
      lesson?.lessonId ||
      lesson?.slug ||
      "",
  );
};

const createSlug = (text = "") => {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

/*
|--------------------------------------------------------------------------
| SUBJECT
|--------------------------------------------------------------------------
*/

const selectedSubject = computed(() => {
  const subjectSlug = routeSubjectSlug.value;

  if (!subjectSlug) return null;

  return (
    sidebar.value.find((subject: any) =>
      subject.slug === subjectSlug ||
      String(subject.id) === String(subjectSlug) ||
      createSlug(subject.name) === subjectSlug
    ) || null
  );
});

const currentSubjectKey = computed(() => {
  
  return (
    selectedSubject.value?.slug ||
    routeSubjectSlug.value ||
    "default-subject"
  );
});

/*
|--------------------------------------------------------------------------
| SUBJECT TOPICS
|--------------------------------------------------------------------------
*/

const selectedSubjectTopics = computed(() => {
  return selectedSubject.value?.topics || [];
});

/*
|--------------------------------------------------------------------------
| SELECTED TOPIC
|--------------------------------------------------------------------------
*/

const selectedTopic = computed(() => {
  if (!selectedTopicId.value) {
    return null;
  }

  return (
    selectedSubjectTopics.value.find(
      (topic: any) =>
        String(topic.id) ===
        String(selectedTopicId.value),
    ) || null
  );
});

const selectedTopicLessons = computed(() => {
  return selectedTopic.value?.lessons || [];
});

/*
|--------------------------------------------------------------------------
| FILTER TOPIC LESSONS
|--------------------------------------------------------------------------
*/

const filteredTopicLessons = computed(() => {
  const lessons = selectedTopicLessons.value;

  const term = topicSearchTerm.value
    .trim()
    .toLowerCase();

  if (!term) {
    return lessons;
  }

  return lessons.filter((lesson: any) => {
    const title = String(
      lesson?.title || "",
    ).toLowerCase();

    const slug = String(
      lesson?.slug || "",
    ).toLowerCase();

    return (
      title.includes(term) ||
      slug.includes(term)
    );
  });
});

/*
|--------------------------------------------------------------------------
| TOTAL LESSONS
|--------------------------------------------------------------------------
*/

const totalLessons = computed(() => {
  return selectedSubjectTopics.value.reduce(
    (total: number, topic: any) => {
      return (
        total +
        (topic.lessons?.length || 0)
      );
    },
    0,
  );
});

/*
|--------------------------------------------------------------------------
| ALL LESSONS
|--------------------------------------------------------------------------
*/

const allSubjectLessons = computed(() => {
  return selectedSubjectTopics.value.flatMap(
    (topic: any) => topic.lessons || [],
  );
});

const firstLesson = computed(() => {
  return allSubjectLessons.value[0] || null;
});

/*
|--------------------------------------------------------------------------
| PDF
|--------------------------------------------------------------------------
*/

const subjectPdfUrl = computed(() => {
  const subject = selectedSubject.value;

  return (
    subject?.pdfUrl ||
    subject?.pdf_url ||
    subject?.pdf ||
    subject?.documentUrl ||
    subject?.document_url ||
    ""
  );
});

/*
|--------------------------------------------------------------------------
| LESSON PROGRESS HELPERS
|--------------------------------------------------------------------------
*/

const getCurrentLessonTime = (lesson: any) => {
  return getLessonTime(
    currentSubjectKey.value,
    lesson,
  );
};

const isCurrentLessonRead = (lesson: any) => {
  return isLessonRead(
    currentSubjectKey.value,
    lesson,
  );
};

/*
|--------------------------------------------------------------------------
| SUBJECT PROGRESS
|--------------------------------------------------------------------------
*/

const progressPercent = computed(() => {
  return getSubjectProgress(
    currentSubjectKey.value,
  );
});

/*
|--------------------------------------------------------------------------
| ROUTE HELPERS
|--------------------------------------------------------------------------
*/

const subjectSlug = computed(() => {
  return (
    selectedSubject.value?.slug ||
    routeSubjectSlug.value ||
    createSlug(breadcrumbSubject.value)
  );
});

const lessonUrl = (lesson: any) => {
  if (!lesson?.slug) {
    return `/learning/${subjectSlug.value}`;
  }

  return `/learning/${subjectSlug.value}/${lesson.slug}`;
};

const lessonSearchUrl = (row: any) => {
  const subject =
    row?.subjectSlug ||
    subjectSlug.value;

  const lesson = row?.slug;

  if (subject && lesson) {
    return `/learning/${subject}/${lesson}`;
  }

  if (subject) {
    return `/learning/${subject}`;
  }

  return "/learning";
};

const isCurrentLesson = (lesson: any) => {
  return (
    routeLessonSlug.value ===
    String(lesson?.slug || "")
  );
};

/*
|--------------------------------------------------------------------------
| SELECT TOPIC
|--------------------------------------------------------------------------
*/

const selectTopic = (
  topic: any,
  options: { openSidebar?: boolean } = {},
) => {
  if (!topic) return;

  selectedTopicId.value = String(topic.id);

  topicSearchTerm.value = "";
  searchTerm.value = "";
  showSearchResults.value = false;
  topicLoading.value = false;

  // Only open the sidebar when the topic was picked from the main page
  // (the subject landing cards), so mobile users can then choose a lesson.
  // A tap inside the sidebar leaves it open.
  if (options.openSidebar) {
    sidebarOpen.value = true;
  }
};

/*
|--------------------------------------------------------------------------
| CLEAR SELECTED TOPIC
|--------------------------------------------------------------------------
*/

const clearSelectedTopic = () => {
  selectedTopicId.value = null;

  topicSearchTerm.value = "";

  searchTerm.value = "";

  showSearchResults.value = false;
};

/*
|--------------------------------------------------------------------------
| LESSON NAVIGATION
|--------------------------------------------------------------------------
*/

const handleLessonNavigation = () => {
  flushReadingTime();

  stopReadingTimer();

  sidebarOpen.value = false;
};

/*
|--------------------------------------------------------------------------
| BREADCRUMBS
|--------------------------------------------------------------------------
*/

const breadcrumbSubject = computed(() => {
  return (
    selectedSubject.value?.name ||
    currentLesson.value?.subjectName ||
    ""
  );
});

const breadcrumbTopic = computed(() => {
  if (!currentLesson.value) {
    return "";
  }

  const topicId =
    currentLesson.value.topic_id ||
    currentLesson.value.topicId;

  const topic =
    selectedSubjectTopics.value.find(
      (item: any) => {
        return (
          String(item.id) ===
          String(topicId)
        );
      },
    );

  return (
    topic?.title ||
    currentLesson.value?.topicTitle ||
    ""
  );
});

/*
|--------------------------------------------------------------------------
| SYNC SELECTED TOPIC WITH LESSON SLUG
| Uses only sidebar data, so it can run before the lesson finishes loading.
|--------------------------------------------------------------------------
*/

const syncSelectedTopic = (slug: string) => {
  const owner = sidebar.value.find(
    (subject: any) => {
      return subject.topics?.some(
        (topic: any) => {
          return topic.lessons?.some(
            (lesson: any) => lesson.slug === slug,
          );
        },
      );
    },
  );

  if (!owner) return;

  openSubjects.value = new Set([
    ...openSubjects.value,
    owner.id,
  ]);

  const currentTopic = owner.topics?.find(
    (topic: any) => {
      return topic.lessons?.some(
        (lesson: any) => lesson.slug === slug,
      );
    },
  );

  if (currentTopic) {
    selectedTopicId.value = String(currentTopic.id);
  }
};

/*
|--------------------------------------------------------------------------
| OPEN LESSON
|--------------------------------------------------------------------------
*/

const openLessonBySlug = async (
  slug: string,
) => {
  const requestId = ++lessonRequestId;

  flushReadingTime();

  stopReadingTimer();

  sidebarOpen.value = false;

  showSearchResults.value = false;

  // Clear any previous "no lesson" state before trying again
  lessonNotFound.value = false;

  lessonError.value = "";

  if (!slug) {
    prevLesson.value = null;

    nextLesson.value = null;

    lessonLoading.value = false;

    return;
  }

  // Show the loading state right away and clear stale prev / next buttons
  lessonLoading.value = true;

  prevLesson.value = null;

  nextLesson.value = null;

  // Highlight the right topic in the sidebar immediately
  syncSelectedTopic(slug);

  try {
    console.log(slug, 'slugslugslugslugslug');
    
    await loadLesson(slug);

    // A newer lesson was requested while this one was loading
    if (requestId !== lessonRequestId) return;

    const lesson = currentLesson.value;

    // No lesson came back, or it is a leftover from a different lesson
    if (
      !lesson ||
      (lesson.slug && String(lesson.slug) !== String(slug))
    ) {
      lessonNotFound.value = true;

      return;
    }

    recordLastOpenedLesson(
      currentSubjectKey.value,
      lesson,
    );

    resetReadingTracker(
      currentSubjectKey.value,
      lesson,
    );
  } catch (error) {
    // A newer request owns the screen now, so ignore this old failure
    if (requestId !== lessonRequestId) return;

    console.error("Failed to load lesson:", error);

    lessonNotFound.value = true;

    lessonError.value =
      error instanceof Error
        ? error.message
        : String(error);

    return;
  } finally {
    // Only the latest request is allowed to hide the loading state
    if (requestId === lessonRequestId) {
      lessonLoading.value = false;
    }
  }

  // Lesson content is visible now. Previous / Next load in the background.
  const previous = await adjacentLesson("previous");

  if (requestId !== lessonRequestId) return;

  prevLesson.value = previous;

  const next = await adjacentLesson("next");

  if (requestId !== lessonRequestId) return;

  nextLesson.value = next;
};

/*
|--------------------------------------------------------------------------
| GLOBAL SEARCH
|--------------------------------------------------------------------------
*/

const onSearchInput = () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  const term =
    searchTerm.value.trim();

  if (!term) {
    showSearchResults.value = false;

    return;
  }

  debounceTimer = setTimeout(
    async () => {
      showSearchResults.value = true;

      await search(term);
    },
    250,
  );
};

/*
|--------------------------------------------------------------------------
| CLEAR SEARCH
|--------------------------------------------------------------------------
*/

const clearSearch = () => {
  searchTerm.value = "";

  showSearchResults.value = false;
};

/*
|--------------------------------------------------------------------------
| DELETE
|--------------------------------------------------------------------------
*/

const openDelete = (
  type: string,
  item: any,
) => {
  deleteType.value = type;

  deleteId.value =
    item?.id || "";

  deleteName.value =
    type === "subject"
      ? item?.name || ""
      : item?.title || "";

  showDelete.value = true;
};

const closeDelete = () => {
  showDelete.value = false;
};

const handleDeleted = async () => {
  showDelete.value = false;

  await fetchSidebar();

  if (currentLesson.value?.slug) {
    await openLessonBySlug(
      currentLesson.value.slug,
    );
  }
};

/*
|--------------------------------------------------------------------------
| LESSON UPDATED
|--------------------------------------------------------------------------
*/

const handleLessonUpdated =
  async () => {
    flushReadingTime();

    if (routeLessonSlug.value) {
      await openLessonBySlug(
        routeLessonSlug.value,
      );
    }
  };

/*
|--------------------------------------------------------------------------
| SEARCH SNIPPET
|--------------------------------------------------------------------------
*/

const renderSnippet = (
  snippet: any,
) => {
  if (!snippet) {
    return "";
  }

  return String(snippet)
    .replace(
      /&/g,
      "&amp;",
    )
    .replace(
      /</g,
      "&lt;",
    )
    .replace(
      />/g,
      "&gt;",
    )
    .replace(
      /⟦/g,
      '<mark class="bg-transparent font-semibold text-navy border-b-2 border-gold">',
    )
    .replace(
      /⟧/g,
      "</mark>",
    );
};

/*
|--------------------------------------------------------------------------
| HOME
|--------------------------------------------------------------------------
*/

const goHome = () => {
  flushReadingTime();

  stopReadingTimer();

  navigateTo("/");
};

/*
|--------------------------------------------------------------------------
| VISIBILITY
|--------------------------------------------------------------------------
*/

const handleReadingVisibility =
  () => {
    if (document.visibilityState !== "visible" || !document.hasFocus()) {
      stopReadingTimer();
    } else if (
      currentLesson.value &&
      !lessonLoading.value &&
      !lessonNotFound.value
    ) {
      resetReadingTracker(
        currentSubjectKey.value,
        currentLesson.value,
      );
    }
  };

const handleReadingWindowBlur = () => {
  stopReadingTimer();
};

const handleReadingWindowFocus = () => {
  handleReadingVisibility();
};

/*
|--------------------------------------------------------------------------
| WATCH SUBJECT
|--------------------------------------------------------------------------
*/

watch(
  () => routeSubjectSlug.value,
  () => {
    selectedTopicId.value = null;

    topicSearchTerm.value = "";

    searchTerm.value = "";

    showSearchResults.value =
      false;

    loadLessonProgress();
  },
);

/*
|--------------------------------------------------------------------------
| WATCH LESSON
|--------------------------------------------------------------------------
*/

watch(
  () => routeLessonSlug.value,
  (
    lessonSlug,
    oldLessonSlug,
  ) => {
    if (
      lessonSlug !== oldLessonSlug
    ) {
      openLessonBySlug(
        lessonSlug,
      );
    }
  },
);

// Re-attach the "mark as read" observer whenever the lesson article is
// (re)rendered, including when the loading state ends.
watch(
  () => [
    currentSubjectKey.value,
    currentLesson.value?.slug,
    lessonLoading.value,
    lessonNotFound.value,
    isLessonRead(
      currentSubjectKey.value,
      currentLesson.value,
    ),
  ],
  () => {
    void observeLessonCompletion();
  },
  { flush: "post" },
);

/*
|--------------------------------------------------------------------------
| LIFECYCLE
|--------------------------------------------------------------------------
*/

onMounted(async () => {
  loadLessonProgress();

  if (import.meta.client) {
    document.addEventListener(
      "visibilitychange",
      handleReadingVisibility,
    );
    window.addEventListener("blur", handleReadingWindowBlur);
    window.addEventListener("focus", handleReadingWindowFocus);
  }

  await fetchSidebar();

  const lessonSlug =
    routeLessonSlug.value;

  if (lessonSlug) {
    await openLessonBySlug(
      lessonSlug,
    );
  } else {
    lessonLoading.value = false;
  }
});

/*
|--------------------------------------------------------------------------
| CLEANUP
|--------------------------------------------------------------------------
*/

onBeforeUnmount(() => {
  flushReadingTime();

  stopReadingTimer();

  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  if (import.meta.client) {
    lessonCompletionObserver?.disconnect();
    lessonCompletionObserver = null;
    document.removeEventListener(
      "visibilitychange",
      handleReadingVisibility,
    );
    window.removeEventListener("blur", handleReadingWindowBlur);
    window.removeEventListener("focus", handleReadingWindowFocus);
  }
});
</script>

<style scoped>
.prose-lesson :deep(br) {
  display: block;
  content: "";
  margin-top: 0.7em;
}

/* Indeterminate loading bar under the top bar */
.loading-bar {
  animation: loading-slide 1.1s ease-in-out infinite;
}

@keyframes loading-slide {
  0% {
    left: -35%;
  }
  100% {
    left: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .loading-bar {
    animation: none;
    left: 0;
    width: 100%;
    opacity: 0.6;
  }
}
</style>