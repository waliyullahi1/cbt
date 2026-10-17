<template>
<div class=" overflow-scroll h-full">
  <div class="flex h-full min-h-0 flex-col  overflow-scroll en bg-bg text-ink font-['Inter',system-ui,sans-serif]">
 
    <header class="flex h-14 shrink-0 items-center justify-between bg-primary px-4 text-white shadow-md sm:px-6">
      <div class="flex items-center gap-3">
        <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
          <Icon name="lucide:graduation-cap" class="h-5 w-5" />
        </div>
        <h1 class="font-['Fraunces',Georgia,serif] text-base font-semibold">Lessons</h1>
      </div>
      <button type="button" class="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white/10" @click="navigateTo('/')">
        <Icon name="lucide:house" class="h-5 w-5" />
      </button>
    </header>

    <main class="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6">
      <div v-if="!sidebar.length" class="flex h-full items-center justify-center">
        <Icon name="lucide:loader-2" class="h-6 w-6 animate-spin text-ink-soft" />
      </div>

      <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="subject in sidebar"
          :key="subject.id"
          class="rounded-xl border border-line bg-surface p-5 shadow-[0_1px_2px_rgba(36,48,74,0.04)]"
        >
       
          <div class="mb-3 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-bg text-navy">
              <Icon :name="subject.icon || 'lucide:book-open'" class="h-5 w-5" />
            </div>
            <h2 class="font-['Fraunces',Georgia,serif] text-base font-semibold text-navy">{{ subject.name }}</h2>
          </div>

          <div v-for="topic in subject.topics" :key="topic.id" class="mb-3">
            <p class="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-soft">{{ topic.title }}</p>
            <NuxtLink
              v-for="lesson in topic.lessons"
              :key="lesson.id"
              :to="`/${lesson.slug}`"
              class="block rounded-md px-2 py-1.5 text-sm text-ink transition hover:bg-bg hover:text-navy"
            >
              {{ lesson.title }}
            </NuxtLink>
          </div>
        </article>
      </div>
    </main>
    
  </div>
   <CurriculumImporter @imported="loadSidebar" @error="onImportError" />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

const { sidebar, loadSidebar } = useLessons()

onMounted(() => {
  loadSidebar()
  
  console.log(sidebar,'sidebar');
  
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&display=swap');
</style>