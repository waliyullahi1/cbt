<template>
  <div
    ref="pageRoot"
    class="relative flex overflow-scroll h-[100dvh] min-h-0 w-full flex-col overflow-hidden bg-[#F3F8FF] text-[#0B2F6B] font-['Inter',system-ui,sans-serif]"
  >
    <!-- DECORATIVE BACKGROUND (non-interactive) -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <Icon name="lucide:book-open" class="absolute right-[-10px] top-[300px] h-14 w-14 rotate-12 text-blue-200/60" />
      <Icon name="lucide:flask-conical" class="absolute bottom-[110px] left-3 h-10 w-10 -rotate-12 text-blue-200/60" />
      <Icon name="lucide:pencil" class="absolute bottom-[130px] right-4 h-12 w-12 text-blue-200/60" />
      <Icon name="lucide:atom" class="absolute bottom-6 left-5 h-12 w-12 text-blue-200/60" />
    </div>

    <!-- APP BAR -->
    <header class="relative z-10 shrink-0 bg-[#0B2F6B] text-white">
      <div class="mx-auto flex min-h-16 w-full max-w-5xl items-center justify-between gap-2 px-1 py-2 sm:gap-3 sm:px-4 md:px-8">
        <div class="flex min-w-0 items-center gap-3">
          <span
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0A6CFF] shadow-[0_4px_10px_rgba(10,108,255,0.45)]"
          >
            <Icon name="lucide:clipboard-list" class="h-5 w-5" />
          </span>

          <div class="min-w-0">
            <h1 class="truncate text-sm font-bold leading-tight tracking-tight sm:text-[15px]">
              Exam Runz
            </h1>
            <p class="mt-0.5 truncate text-[10px] leading-tight text-white/65 sm:text-[11px]">
              WAEC, NECO, NABTEB and JAMB runs
            </p>
          </div>
        </div>

        <button
          type="button"
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0A6CFF] shadow-[0_4px_10px_rgba(10,108,255,0.45)] transition hover:brightness-110 active:scale-95"
          aria-label="Go home"
          @click="goHome"
        >
          <Icon name="lucide:house" class="h-5 w-5" />
        </button>
      </div>
    </header>

    <!-- PAGE TABS -->
    <nav class="relative overflow-scroll z-10 shrink-0 px-1 pt-2 sm:px-3 sm:pt-3 md:px-8">
      <div
        class="mx-auto flex max-w-5xl gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] sm:gap-2 sm:justify-center [&::-webkit-scrollbar]:hidden"
      >
        <button
          v-for="item in pages"
          :key="item.id"
          type="button"
          class="inline-flex h-10 shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-full px-3 text-[11px] font-bold transition active:scale-95 sm:gap-1.5 sm:px-4 sm:text-xs"
          :class="
            selectedPage === item.id
              ? 'bg-[#0A6CFF] text-white shadow-[0_4px_10px_rgba(10,108,255,0.3)]'
              : 'bg-white text-[#0B2F6B] ring-1 ring-blue-100 hover:bg-blue-50'
          "
          @click="selectedPage = item.id"
        >
          <Icon :name="item.icon" class="h-4 w-4 shrink-0" />
          <span>{{ item.name }}</span>
        </button>
      </div>
    </nav>

    <!-- MAIN CONTENT (this is the part that scrolls) -->
    <main
      class="relative z-10 min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain px-1 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-2 sm:px-4 sm:pb-[calc(env(safe-area-inset-bottom)+24px)] sm:pt-3 md:px-8"
    >
      <div class="mx-auto w-full max-w-5xl">
        <!-- =======================================================
             PAGE 1: ENTER ACCESS CODE
        ======================================================== -->
        <section
          v-if="selectedPage === 1"
          class="rounded-2xl bg-white px-1 py-3 shadow-[0_8px_24px_rgba(20,49,109,0.07)] ring-1 ring-blue-50 sm:rounded-3xl sm:p-6 md:p-8"
        >
          <div class="mx-auto w-full max-w-xl">
            <div class="mb-6 text-center sm:mb-7">
              <div class="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Icon name="lucide:clipboard-list" class="h-7 w-7" />
              </div>

              <h2 class="text-base font-bold text-[#0B2F6B] sm:text-xl">Exam Runz</h2>

              <p class="mt-1 text-[11px] leading-5 text-slate-500 sm:text-sm">
                Enter your access code to open your exam paper.
              </p>
            </div>

            <form @submit.prevent="submitCode">
              <div class="mb-5">
                <label for="accessCode" class="mb-1.5 block text-[11px] font-bold text-[#0B2F6B] sm:text-sm">
                  Access code
                  <span class="text-[#0A6CFF]">*</span>
                </label>

                <div
                  class="flex h-14 w-full items-center gap-2 rounded-2xl border bg-white px-4 transition focus-within:border-[#0A6CFF] focus-within:ring-2 focus-within:ring-[#0A6CFF]/20"
                  :class="errors.code ? 'border-[#0B2F6B] bg-slate-50' : 'border-blue-100'"
                >
                  <Icon name="lucide:key-round" class="h-5 w-5 shrink-0 text-[#0A6CFF]" />

                  <input
                    id="accessCode"
                    v-model="form.code"
                    type="text"
                    inputmode="text"
                    maxlength="8"
                    placeholder="e.g. 4821"
                    autocomplete="off"
                    autocapitalize="characters"
                    class="w-full min-w-0 border-0 bg-transparent font-mono text-base uppercase tracking-[0.3em] text-[#0B2F6B] outline-none placeholder:text-sm placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-400"
                    @input="formatCode"
                  />

                  <button
                    v-if="form.code"
                    type="button"
                    class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#0A6CFF] transition active:scale-90"
                    aria-label="Clear code"
                    @click="form.code = ''"
                  >
                    <Icon name="lucide:x" class="h-4 w-4" />
                  </button>
                </div>

                <small
                  v-if="errors.code"
                  class="mt-1.5 flex items-center gap-1 text-[11px] font-bold text-[#0B2F6B]"
                >
                  <Icon name="lucide:circle-alert" class="h-3.5 w-3.5 shrink-0" />
                  {{ errors.code }}
                </small>

                <p class="mt-1.5 text-[11px] leading-4 text-slate-500">
                  Don't have a code yet?
                  <button
                    type="button"
                    class="font-bold text-[#0A6CFF] underline underline-offset-2"
                    @click="selectedPage = 3"
                  >
                    See how to get one
                  </button>
                </p>
              </div>

              <button
                type="submit"
                class="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0A6CFF] px-3 text-xs font-bold text-white shadow-[0_6px_14px_rgba(10,108,255,0.35)] transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none sm:mt-5 sm:h-12 sm:rounded-2xl sm:px-4 sm:text-sm"
                :disabled="loading"
              >
                <Icon
                  :name="loading ? 'lucide:loader-circle' : 'lucide:clipboard-check'"
                  :class="{ 'animate-spin': loading }"
                  class="h-5 w-5"
                />
                {{ loading ? "Checking code..." : "Open exam paper" }}
              </button>
            </form>
          </div>
        </section>

        <!-- =======================================================
             PAGE 2: EXAM LINKS & UPDATES
        ======================================================== -->
        <section
          v-if="selectedPage === 2"
          class="rounded-2xl bg-white px-1 py-3 shadow-[0_8px_24px_rgba(20,49,109,0.07)] ring-1 ring-blue-50 sm:rounded-3xl sm:p-6 md:p-8"
        >
          <div class="mb-5 flex items-start gap-3">
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Icon name="lucide:link" class="h-5 w-5" />
            </div>

            <div>
              <h2 class="text-base font-bold text-[#0B2F6B] sm:text-xl">Exam Links</h2>
              <p class="mt-1 text-xs leading-5 text-slate-500">
                Runs Link: best runs website. Even if you plan to fail, with our legit runz your plan will fail!
              </p>
            </div>
          </div>

          <div class="space-y-4">
            <a
              v-for="link in examLinks"
              :key="link.url"
              :href="link.url"
              target="_blank"
              rel="noopener"
              class="flex items-start gap-3 border-b border-blue-50 pb-4 last:border-0 last:pb-0"
            >
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0A6CFF] text-white">
                <Icon :name="link.icon" class="h-3.5 w-3.5" />
              </span>

              <span class="text-[11px] leading-5 text-slate-600 sm:text-sm sm:leading-6">
                <b class="text-[#0B2F6B]">{{ link.title }}</b>
                <span class="block text-[#0A6CFF]">{{ link.note }}</span>
              </span>
            </a>
          </div>

          <h3 class="mb-3 mt-6 text-sm font-bold text-[#0B2F6B] sm:text-base">Updates &amp; Services</h3>

          <div class="space-y-4">
            <a
              v-for="post in updates"
              :key="post.url"
              :href="post.url"
              target="_blank"
              rel="noopener"
              class="flex items-start gap-3 border-b border-blue-50 pb-4 last:border-0 last:pb-0"
            >
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0A6CFF] text-white">
                <Icon name="lucide:newspaper" class="h-3.5 w-3.5" />
              </span>

              <span class="text-[11px] leading-5 text-slate-600 sm:text-sm sm:leading-6">
                <b class="text-[#0B2F6B]">{{ post.title }}</b>
                <span class="block text-[10px] text-slate-400">{{ post.date }}</span>
              </span>
            </a>
          </div>
        </section>

        <!-- =======================================================
             PAGE 3: HOW TO GET ACCESS CODE
        ======================================================== -->
        <section
          v-if="selectedPage === 3"
          class="rounded-2xl bg-white px-1 py-3 shadow-[0_8px_24px_rgba(20,49,109,0.07)] ring-1 ring-blue-50 sm:rounded-3xl sm:p-6 md:p-8"
        >
          <div class="mb-5 flex items-start gap-3">
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Icon name="lucide:key-round" class="h-5 w-5" />
            </div>

            <div>
              <h2 class="text-base font-bold text-[#0B2F6B] sm:text-xl">How to Get Your Access Code</h2>
              <p class="mt-1 text-xs leading-5 text-slate-500">
                Follow these steps to get your Exam Runz access code.
              </p>
            </div>
          </div>

          <div class="space-y-4">
            <article
              v-for="step in codeSteps"
              :key="step.number"
              class="flex items-start gap-3 border-b border-blue-50 pb-4 last:border-0 last:pb-0"
            >
              <span
                class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0A6CFF] text-[11px] font-bold text-white"
              >
                {{ step.number }}
              </span>

              <p class="text-[11px] leading-5 text-slate-600 sm:text-sm sm:leading-6">
                {{ step.text }}
              </p>
            </article>
          </div>

          <div class="mt-5 grid grid-cols-1 gap-2 sm:mt-6 sm:grid-cols-2 sm:gap-3">
            <a
              :href="`https://wa.me/${contact.whatsapp}`"
              target="_blank"
              rel="noopener"
              class="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0A6CFF] px-3 text-xs font-bold text-white shadow-[0_6px_14px_rgba(10,108,255,0.35)] transition hover:brightness-110 active:scale-[0.98] sm:h-12 sm:rounded-2xl sm:px-4 sm:text-sm"
            >
              <Icon name="lucide:message-circle" class="h-5 w-5" />
              WhatsApp {{ contact.display }}
            </a>

            <a
              :href="`tel:+${contact.whatsapp}`"
              class="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white px-3 text-xs font-bold text-[#0A6CFF] ring-1 ring-blue-100 transition hover:bg-blue-50 active:scale-[0.98] sm:h-12 sm:rounded-2xl sm:px-4 sm:text-sm"
            >
              <Icon name="lucide:phone" class="h-5 w-5" />
              Call {{ contact.display }}
            </a>
          </div>

          <button
            type="button"
            class="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0A6CFF] px-3 text-xs font-bold text-white shadow-[0_6px_14px_rgba(10,108,255,0.35)] transition hover:brightness-110 active:scale-[0.98] sm:h-12 sm:rounded-2xl sm:px-4 sm:text-sm"
            @click="selectedPage = 1"
          >
            <Icon name="lucide:clipboard-list" class="h-5 w-5" />
            I Have My Code
          </button>
        </section>

        <!-- =======================================================
             EXAM CARDS (WAEC / NECO / NABTEB / JAMB)
        ======================================================== -->
        <section class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div
            v-for="exam in examCards"
            :key="exam.title"
            class="flex items-start gap-2.5 rounded-2xl bg-white p-3 shadow-[0_8px_24px_rgba(20,49,109,0.05)] ring-1 ring-blue-50 sm:gap-3 sm:rounded-3xl sm:p-4"
          >
            <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Icon :name="exam.icon" class="h-5 w-5" />
            </span>

            <div>
              <h3 class="text-[11px] font-bold text-[#0B2F6B] sm:text-xs">{{ exam.title }}</h3>
              <p class="mt-1 text-[11px] leading-4 text-slate-500">{{ exam.text }}</p>
            </div>
          </div>
        </section>
      </div>
    </main>

    <!-- TOAST -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-2 opacity-0"
    >
      <div
        v-if="message"
        class="absolute bottom-[calc(env(safe-area-inset-bottom)+12px)] left-1 right-1 z-[100] flex items-start gap-2 rounded-xl bg-[#0B2F6B] px-3 py-2.5 text-[11px] text-white shadow-2xl sm:bottom-[calc(env(safe-area-inset-bottom)+16px)] sm:left-auto sm:right-5 sm:max-w-[400px] sm:gap-2.5 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-xs"
      >
        <Icon
          :name="messageType === 'success' ? 'lucide:circle-check' : 'lucide:circle-alert'"
          class="mt-0.5 h-[18px] w-[18px] shrink-0"
        />

        <span class="flex-1 leading-5">{{ message }}</span>

        <button
          type="button"
          class="flex shrink-0 text-white/80 hover:text-white"
          aria-label="Close message"
          @click="message = ''"
        >
          <Icon name="lucide:x" class="h-4 w-4" />
        </button>
      </div>
    </Transition>
  </div>
</template>
<script setup>
import { nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'

const emit = defineEmits(['gohome'])
const router = useRouter()

// Shared cache so /cbt/[id] can reuse the paper without fetching again
const paperCache = useState('cbt-papers', () => ({}))

/* =========================================================
   SELF-FITTING HEIGHT
========================================================= */

const pageRoot = ref(null)
let resizeObserver = null

const fitHeight = () => {
  const el = pageRoot.value
  if (!el) return

  const top = el.getBoundingClientRect().top
  let bottom = window.innerHeight

  let node = document.elementFromPoint(window.innerWidth / 2, window.innerHeight - 2)

  while (node && node !== document.body && node !== document.documentElement) {
    if (!el.contains(node)) {
      const r = node.getBoundingClientRect()

      if (r.bottom >= window.innerHeight - 2 && r.height < window.innerHeight * 0.3 && r.top > top) {
        bottom = Math.min(bottom, r.top)
      }
    }

    node = node.parentElement
  }

  el.style.height = `${Math.max(240, Math.floor(bottom - top))}px`
}

onMounted(() => {
  fitHeight()
  void nextTick(fitHeight)
  setTimeout(fitHeight, 150)
  setTimeout(fitHeight, 600)

  window.addEventListener('resize', fitHeight)
  window.addEventListener('orientationchange', fitHeight)

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(fitHeight)
    resizeObserver.observe(document.body)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', fitHeight)
  window.removeEventListener('orientationchange', fitHeight)
  resizeObserver?.disconnect()

  if (messageTimer) clearTimeout(messageTimer)
})

/* =========================================================
   STATE
========================================================= */

const selectedPage = ref(1)
const loading = ref(false)
const message = ref('')
const messageType = ref('success')

const form = reactive({ code: '' })
const errors = reactive({ code: '' })

/* =========================================================
   CONTENT (edit the text here)
========================================================= */

const pages = [
  { id: 1, name: 'Exam Runz', icon: 'lucide:clipboard-list' },
  { id: 2, name: 'Exam Links', icon: 'lucide:link' },
  { id: 3, name: 'How to Get Code', icon: 'lucide:key-round' }
]

const contact = {
  whatsapp: '2348039845684',
  display: '08039845684'
}

const codeSteps = [
  { number: 1, text: 'Choose the exam runs you need: WAEC, NECO, NABTEB, JAMB, IJMB, JUPEB or GCE.' },
  { number: 2, text: 'Contact Runs Link on WhatsApp, by call or by SMS to subscribe for Exam Runz.' },
  { number: 3, text: 'Make your payment and send your proof of payment to the same number.' },
  { number: 4, text: 'You will receive your access code. Keep it safe and do not share it with anyone.' },
  { number: 5, text: 'Go to the Exam Runz tab, enter your code and tap Open exam paper.' }
]

const examLinks = [
  {
    title: 'Runs Link Answers Page',
    note: 'answer.runslink.com',
    icon: 'lucide:external-link',
    url: 'https://answer.runslink.com'
  },
  {
    title: 'NABTEB Runz',
    note: 'Click here',
    icon: 'lucide:file-check',
    url: 'https://runslink.com/nabteb/'
  },
  {
    title: 'IJMB & JUPEB Runz',
    note: 'Click here',
    icon: 'lucide:file-check',
    url: 'https://runslink.com/ijmb-and-jupeb-runs/'
  },
  {
    title: "All GCE's Runz",
    note: 'Click here',
    icon: 'lucide:file-check',
    url: 'https://runslink.com/all-gce-runs/'
  },
  {
    title: 'Daily Subscription Price',
    note: 'Click here',
    icon: 'lucide:calendar-days',
    url: 'https://runslink.com/daily-subscription/'
  },
  {
    title: 'Results Testimonies',
    note: 'Past results and testimonies',
    icon: 'lucide:badge-check',
    url: 'https://runslink.com/jamb-past-results/'
  },
  {
    title: 'Join Our WhatsApp Group',
    note: 'Click here to join',
    icon: 'lucide:message-circle',
    url: 'https://chat.whatsapp.com/FAIRLjy7MJw4PQGevFjN1Y'
  }
]

const updates = [
  {
    title: '2026 Final WAEC Time Table',
    date: 'March 30, 2026',
    url: 'https://runslink.com/latest-update/2026-final-waec-time-table/'
  },
  {
    title: 'FG Moves to Cut Education Costs, Promote Sustainability with Reusable Textbook Policy',
    date: 'January 10, 2026',
    url: 'https://runslink.com/latest-update/fg-moves-to-cut-education-costs-promote-sustainability-with-reusable-textbook-policy/'
  },
  {
    title: 'Verify Your NIN Details Before Registration: JAMB Urges UTME Candidates',
    date: 'January 8, 2026',
    url: 'https://runslink.com/latest-update/verify-your-nin-details-before-registration-_-jamb-urges-utme-candidates/'
  },
  {
    title: 'Before You Rush to Generate Profile Code for 2026 JAMB, Know These Facts',
    date: 'December 15, 2025',
    url: 'https://runslink.com/latest-update/before-you-rush-to-generate-profile-code-for-2026-jamb-know-this-facts/'
  },
  {
    title: 'WAEC Decides to Continue with CBT for 2026 Internal Exam',
    date: 'November 28, 2025',
    url: 'https://runslink.com/latest-update/waec-decides-to-continue-with-cbt-for-2026-internal-exam/'
  },
  {
    title: 'WAEC Shifts Full CBT Examination to 2027',
    date: 'November 21, 2025',
    url: 'https://runslink.com/latest-update/waec-shifts-full-cbt-examination-to-2027/'
  }
]

const examCards = [
  { title: 'WAEC Runs', text: 'WAEC questions and answers.', icon: 'lucide:book-open-check' },
  { title: 'NECO Runs', text: 'NECO questions and answers.', icon: 'lucide:file-text' },
  { title: 'NABTEB Runs', text: 'NABTEB questions and answers.', icon: 'lucide:clipboard-check' },
  { title: 'JAMB Runs', text: 'JAMB questions and answers.', icon: 'lucide:graduation-cap' }
]

/* =========================================================
   ACCESS CODE
========================================================= */

const MIN_CODE_LENGTH = 3

// Uppercase letters and numbers only, no spaces or dashes
const formatCode = () => {
  form.code = form.code.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)
  errors.code = ''
}

const validateCode = () => {
  errors.code = ''

  if (!form.code) {
    errors.code = 'Please enter your access code.'
    return false
  }

  if (form.code.length < MIN_CODE_LENGTH) {
    errors.code = 'The access code is too short.'
    return false
  }

  return true
}

const submitCode = async () => {
  if (loading.value || !validateCode()) return

  loading.value = true
  message.value = ''

  try {
    // Backend returns the paper with its id
    const paper = await getCbtSubjectByAccessCode(form.code)

    if (!paper?.id) {
      throw new Error('Paper not found for this access code.')
    }

    paperCache.value[paper.id] = paper

    await router.push(`/cbt/${encodeURIComponent(paper.id)}`)
  } catch (error) {
    console.error('Access code check failed:', error)

    showMessage(
      error?.data?.message ||
        error?.message ||
        'Invalid access code. Please check it and try again.',
      'error'
    )
  } finally {
    loading.value = false
  }
}

/* =========================================================
   MESSAGE + HOME
========================================================= */

let messageTimer = null

const showMessage = (text, type = 'success') => {
  message.value = text
  messageType.value = type

  if (messageTimer) clearTimeout(messageTimer)

  messageTimer = setTimeout(() => {
    message.value = ''
  }, 4000)
}

const goHome = () => {
  emit('gohome')
}
</script>