<template>
  <div
    ref="pageRoot"
    class="relative flex h-[100dvh] min-h-0 w-full flex-col overflow-hidden bg-[#F3F8FF] text-[#0B2F6B] font-['Inter',system-ui,sans-serif]"
  >
    <!-- DECORATIVE BACKGROUND (non-interactive) -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <Icon name="lucide:book-open" class="absolute right-[-10px] top-[300px] h-14 w-14 rotate-12 text-blue-200/60" />
      <Icon name="lucide:flask-conical" class="absolute bottom-[110px] left-3 h-10 w-10 -rotate-12 text-blue-200/60" />
      <Icon name="lucide:pencil" class="absolute bottom-[130px] right-4 h-12 w-12 text-blue-200/60" />
      <Icon name="lucide:atom" class="absolute bottom-6 left-5 h-12 w-12 text-blue-200/60" />
    </div>

    <!-- =========================================================
         APP BAR
    ========================================================== -->
    <header
      class="relative z-10 shrink-0 bg-[#0B2F6B] pt-[env(safe-area-inset-top)] text-white shadow-[0_4px_16px_rgba(11,47,107,0.25)]"
    >
      <div class="mx-auto flex min-h-16 w-full max-w-5xl items-center justify-between gap-3 px-4 py-2 md:px-8">
        <div class="flex min-w-0 items-center gap-3">
          <span
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0A6CFF] shadow-[0_4px_10px_rgba(10,108,255,0.45)]"
          >
            <Icon name="lucide:shield-check" class="h-5 w-5" />
          </span>

          <div class="min-w-0">
            <h1 class="truncate text-[15px] font-bold leading-tight tracking-tight">
              Product Activation
            </h1>

            <p class="mt-0.5 truncate text-[11px] leading-tight text-white/65">
              Activate premium features on this device
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

    <!-- =========================================================
         PAGE TABS (scroll sideways on small phones)
    ========================================================== -->
    <nav class="relative z-10 shrink-0 px-3 pt-3 md:px-8">
      <div
        class="mx-auto flex max-w-5xl gap-2 overflow-x-auto pb-1 [scrollbar-width:none] sm:justify-center [&::-webkit-scrollbar]:hidden"
      >
        <button
          v-for="item in pages"
          :key="item.id"
          type="button"
          class="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-4 text-xs font-bold transition active:scale-95"
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

    <!-- =========================================================
         MAIN CONTENT (this is the part that scrolls)
    ========================================================== -->
    <main
      class="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain  pb-[calc(env(safe-area-inset-bottom)+24px)] pt-3 md:px-8"
    >
      <div class="mx-auto w-full max-w-5xl">
        <!-- =======================================================
             ACTIVATE WITH KEY
        ======================================================== -->
        <section
          v-if="selectedPage === 1"
          class="rounded-3xl bg-white p-2 shadow-[0_8px_24px_rgba(20,49,109,0.07)] ring-1 ring-blue-50 sm:p-6 md:p-8"
        >
          <div class="mx-auto w-full max-w-xl">
            <!-- SECTION INTRO -->
            <div class="mb-6 text-center sm:mb-7">
              <div
                class="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600"
              >
                <Icon name="lucide:key-round" class="h-7 w-7" />
              </div>

              <h2 class="text-lg font-bold text-[#0B2F6B] sm:text-xl">
                Activate with License Key
              </h2>

              <p class="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                Enter your activation key to unlock premium features.
              </p>
            </div>

            <form v-if="!syncing" @submit.prevent="activateWithKey">
              <!-- LICENSE KEY -->
              <div class="mb-5">
                <label
                  for="licenseKey"
                  class="mb-1.5 block text-xs font-bold text-[#0B2F6B] sm:text-sm"
                >
                  License / Activation Key
                  <span class="text-[#0A6CFF]">*</span>
                </label>

                <div
                  class="flex h-14 w-full items-center gap-2 rounded-2xl border bg-white px-4 transition focus-within:border-[#0A6CFF] focus-within:ring-2 focus-within:ring-[#0A6CFF]/20"
                  :class="
                    errors.licenseKey
                      ? 'border-[#0B2F6B] bg-slate-50'
                      : 'border-blue-100'
                  "
                >
                  <Icon name="lucide:key-round" class="h-5 w-5 shrink-0 text-[#0A6CFF]" />

                  <input
                    id="licenseKey"
                    v-model.trim="form.licenseKey"
                    type="text"
                    placeholder="XXXX-XXXX-XXXX-XXXX"
                    autocomplete="off"
                    class="w-full min-w-0 border-0 bg-transparent font-mono text-xs uppercase tracking-wider text-[#0B2F6B] outline-none placeholder:tracking-normal placeholder:text-slate-400 sm:text-sm"
                    @input="formatLicenseKey"
                  />

                  <button
                    v-if="form.licenseKey"
                    type="button"
                    class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#0A6CFF] transition active:scale-90"
                    aria-label="Clear license key"
                    @click="form.licenseKey = ''"
                  >
                    <Icon name="lucide:x" class="h-4 w-4" />
                  </button>
                </div>

                <small
                  v-if="errors.licenseKey"
                  class="mt-1.5 flex items-center gap-1 text-[11px] font-bold text-[#0B2F6B]"
                >
                  <Icon name="lucide:circle-alert" class="h-3.5 w-3.5 shrink-0" />
                  {{ errors.licenseKey }}
                </small>

                <p class="mt-1.5 text-[11px] leading-4 text-slate-500">
                  Your activation key normally contains letters and numbers.
                </p>
              </div>

              <!-- TERMS -->
              <label
                class="mt-5 flex cursor-pointer items-start gap-2.5 text-xs leading-5 text-slate-500"
              >
                <input
                  v-model="form.acceptTerms"
                  type="checkbox"
                  class="mt-1 h-4 w-4 shrink-0 rounded border-blue-200 accent-[#0A6CFF]"
                />

                <span>
                  I agree to the
                  <button
                    type="button"
                    class="font-bold text-[#0A6CFF] underline underline-offset-2"
                    @click="selectedPage = 3"
                  >
                    License Terms & Conditions
                  </button>
                </span>
              </label>

              <p
                v-if="errors.terms"
                class="mt-1.5 flex items-center gap-1 text-[11px] font-bold text-[#0B2F6B]"
              >
                <Icon name="lucide:circle-alert" class="h-3.5 w-3.5 shrink-0" />
                {{ errors.terms }}
              </p>

              <!-- SUBMIT -->
              <button
                type="submit"
                class="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#0A6CFF] px-4 text-sm font-bold text-white shadow-[0_6px_14px_rgba(10,108,255,0.35)] transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
                :disabled="loading"
              >
                <Icon
                  :name="loading ? 'lucide:loader-circle' : 'lucide:shield-check'"
                  :class="{ 'animate-spin': loading }"
                  class="h-5 w-5"
                />

                {{ loading ? "Activating..." : "Activate Product" }}
              </button>
            </form>

            <!-- DOWNLOAD PROGRESS -->
            <div v-else class="space-y-4" role="status" aria-live="polite">
              <p class="text-center text-sm text-slate-500">
                {{ syncPhase }}
              </p>

              <div
                class="h-2.5 overflow-hidden rounded-full bg-blue-100"
                aria-label="Content download progress"
                role="progressbar"
                :aria-valuenow="syncPercentage"
                aria-valuemin="0"
                aria-valuemax="100"
              >
                <div
                  class="h-full rounded-full bg-[#0A6CFF] transition-all duration-300"
                  :style="{ width: `${syncPercentage}%` }"
                />
              </div>

              <p class="text-center text-xs tabular-nums text-slate-500">
                {{ syncPercentage }}%
                <span v-if="syncTotal">
                  · {{ syncDownloaded }} / {{ syncTotal }} items
                </span>
              </p>
            </div>

            <p
              v-if="syncSuccess && !syncing"
              class="mt-4 flex items-start gap-2 rounded-2xl bg-blue-50 p-3 text-sm text-[#0B2F6B]"
              role="status"
            >
              <Icon name="lucide:circle-check" class="mt-0.5 h-5 w-5 shrink-0 text-[#0A6CFF]" />
              <span>{{ syncSuccess }}</span>
            </p>
          </div>
        </section>

        <!-- =======================================================
             PURCHASE ACTIVATION
        ======================================================== -->
        <section
          v-if="selectedPage === 2"
          class="rounded-3xl bg-white p-4 shadow-[0_8px_24px_rgba(20,49,109,0.07)] ring-1 ring-blue-50 sm:p-6 md:p-8"
        >
          <PurchaseActivation @activated="isActivated = true" />
        </section>

        <!-- =======================================================
             LICENSE TERMS
        ======================================================== -->
        <section
          v-if="selectedPage === 3"
          class="rounded-3xl bg-white p-4 shadow-[0_8px_24px_rgba(20,49,109,0.07)] ring-1 ring-blue-50 sm:p-6 md:p-8"
        >
          <div class="mb-5 flex items-start gap-3">
            <div
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600"
            >
              <Icon name="lucide:file-text" class="h-5 w-5" />
            </div>

            <div>
              <h2 class="text-lg font-bold text-[#0B2F6B] sm:text-xl">
                License Terms & Conditions
              </h2>

              <p class="mt-1 text-xs leading-5 text-slate-500">
                Please read the terms before activating the application.
              </p>
            </div>
          </div>

          <div class="space-y-4">
            <article
              v-for="term in licenseTerms"
              :key="term.number"
              class="flex items-start gap-3 border-b border-blue-50 pb-4 last:border-0 last:pb-0"
            >
              <span
                class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0A6CFF] text-[11px] font-bold text-white"
              >
                {{ term.number }}
              </span>

              <p class="text-xs leading-6 text-slate-600 sm:text-sm">
                {{ term.text }}
              </p>
            </article>
          </div>

          <button
            type="button"
            class="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#0A6CFF] px-4 text-sm font-bold text-white shadow-[0_6px_14px_rgba(10,108,255,0.35)] transition hover:brightness-110 active:scale-[0.98]"
            @click="selectedPage = 1"
          >
            <Icon name="lucide:key-round" class="h-5 w-5" />
            Activate with Key
          </button>
        </section>

        <!-- =======================================================
             FEATURES
        ======================================================== -->
        <section class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div
            class="flex items-start gap-3 rounded-3xl bg-white p-4 shadow-[0_8px_24px_rgba(20,49,109,0.05)] ring-1 ring-blue-50"
          >
            <span
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600"
            >
              <Icon name="lucide:book-open-check" class="h-5 w-5" />
            </span>

            <div>
              <h3 class="text-xs font-bold text-[#0B2F6B]">Premium Lessons</h3>

              <p class="mt-1 text-[11px] leading-4 text-slate-500">
                Access protected curriculum content.
              </p>
            </div>
          </div>

          <div
            class="flex items-start gap-3 rounded-3xl bg-white p-4 shadow-[0_8px_24px_rgba(20,49,109,0.05)] ring-1 ring-blue-50"
          >
            <span
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600"
            >
              <Icon name="lucide:bar-chart-3" class="h-5 w-5" />
            </span>

            <div>
              <h3 class="text-xs font-bold text-[#0B2F6B]">Advanced Results</h3>

              <p class="mt-1 text-[11px] leading-4 text-slate-500">
                Unlock detailed performance analysis.
              </p>
            </div>
          </div>

          <div
            class="flex items-start gap-3 rounded-3xl bg-white p-4 shadow-[0_8px_24px_rgba(20,49,109,0.05)] ring-1 ring-blue-50"
          >
            <span
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600"
            >
              <Icon name="lucide:database" class="h-5 w-5" />
            </span>

            <div>
              <h3 class="text-xs font-bold text-[#0B2F6B]">Full Question Bank</h3>

              <p class="mt-1 text-[11px] leading-4 text-slate-500">
                Access the complete available question bank.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>

    <!-- =========================================================
         TOAST (snackbar, stays inside the page above the tab bar)
    ========================================================== -->
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
        class="absolute bottom-[calc(env(safe-area-inset-bottom)+16px)] left-3 right-3 z-[100] flex items-start gap-2.5 rounded-2xl bg-[#0B2F6B] px-4 py-3 text-xs text-white shadow-2xl sm:left-auto sm:right-5 sm:max-w-[400px]"
      >
        <Icon
          :name="messageType === 'success' ? 'lucide:circle-check' : 'lucide:circle-alert'"
          class="mt-0.5 h-[18px] w-[18px] shrink-0"
        />

        <span class="flex-1 leading-5">
          {{ message }}
        </span>

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
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref
} from 'vue'

const emit = defineEmits(['gohome'])
const software = useSoftwareSecurity()
const {
  phase: syncPhase,
  percentage: contentSyncPercentage,
  downloadedTotal: syncDownloaded,
  total: syncTotal,
  completed: contentSyncCompleted,
  error: contentSyncError,
  startDownload
} = useContentSync()
const syncPercentage = computed(() =>
  syncPhase.value === 'Activating product...'
    ? 0
    : contentSyncPercentage.value
)

/* =========================================================
   SELF-FITTING HEIGHT
   Makes the page exactly as tall as the free space between its top
   and the bottom tab bar, so <main> always has something to scroll
   inside, whatever the parent layout does.
========================================================= */

const pageRoot = ref(null)
let resizeObserver = null

const fitHeight = () => {
  const el = pageRoot.value
  if (!el) return

  const top = el.getBoundingClientRect().top
  let bottom = window.innerHeight

  // Is something (a bottom tab bar) pinned to the bottom edge of the screen?
  let node = document.elementFromPoint(
    window.innerWidth / 2,
    window.innerHeight - 2
  )

  while (node && node !== document.body && node !== document.documentElement) {
    if (!el.contains(node)) {
      const r = node.getBoundingClientRect()

      if (
        r.bottom >= window.innerHeight - 2 &&
        r.height < window.innerHeight * 0.3 &&
        r.top > top
      ) {
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

  if (messageTimer) {
    clearTimeout(messageTimer)
  }
})

/* =========================================================
   STATE
========================================================= */

const selectedPage = ref(1)

const loading = ref(false)

const message = ref('')
const messageType = ref('success')

const isActivated = ref(false)
const syncing = ref(false)
const syncSuccess = ref('')

/* =========================================================
   FORM
========================================================= */

const form = reactive({
  licenseKey: '',
  acceptTerms: false
})

const errors = reactive({
  licenseKey: '',
  terms: ''
})

/* =========================================================
   NAVIGATION
========================================================= */

const pages = [
  {
    id: 1,
    name: 'Activate with Key',
    icon: 'lucide:key-round'
  },
  {
    id: 2,
    name: 'Activate with Purchase',
    icon: 'lucide:credit-card'
  },
  {
    id: 3,
    name: 'License Terms',
    icon: 'lucide:file-text'
  }
]

const licenseTerms = [
  {
    number: 1,
    text: 'To activate the application, you can either enter a valid Scratch Card Code or make payment through the approved payment method.'
  },
  {
    number: 2,
    text: 'After your payment or Scratch Card Code is successfully verified, a unique Activation Code will be issued for your computer.'
  },
  {
    number: 3,
    text: 'Your Activation Code unlocks the full features of the application and is valid for one computer only.'
  },
  {
    number: 4,
    text: 'Your license cannot be transferred to another computer. Changing major hardware components may affect your activation and license.'
  },
  {
    number: 5,
    text: 'Reinstalling the application or formatting your computer will not affect your license, provided your major computer hardware remains unchanged.'
  },
  {
    number: 6,
    text: 'This license is valid for version 2026 and does not expire while the supported hardware remains unchanged. Keep your Activation Code safe for future use.'
  }
]

/* =========================================================
   VALIDATION
========================================================= */

const clearErrors = () => {
  errors.licenseKey = ''
  errors.terms = ''
}

const validateKeyForm = () => {
  clearErrors()

  let valid = true

  if (!form.licenseKey) {
    errors.licenseKey = 'Please enter your license key.'
    valid = false
  } else if (form.licenseKey.replace(/-/g, '').length < 8) {
    errors.licenseKey = 'The license key appears to be invalid.'
    valid = false
  }

  if (!form.acceptTerms) {
    errors.terms = 'You must accept the license terms.'
    valid = false
  }

  return valid
}

/* =========================================================
   LICENSE KEY FORMAT
========================================================= */

const formatLicenseKey = () => {
  let value = form.licenseKey
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')

  value = value.match(/.{1,4}/g)?.join('-') || ''

  form.licenseKey = value.slice(0, 19)
}

/* =========================================================
   ACTIVATE WITH KEY
========================================================= */

const activateWithKey = async () => {
  if (!validateKeyForm()) {
    return
  }

  loading.value = true
  syncing.value = true
  syncPhase.value = 'Activating product...'
  syncSuccess.value = ''
  message.value = ''

  try {
    const cleanToken = form.licenseKey.trim().toUpperCase()
    await software.activate(cleanToken)
    await startDownload(cleanToken)
    if (!contentSyncCompleted.value) {
      throw new Error(contentSyncError.value || 'Content download did not complete.')
    }
    isActivated.value = true

    syncSuccess.value = 'Activation successful. Your lessons and questions have been updated.'
    showMessage(syncSuccess.value, 'success')
  } catch (error) {
    console.error('Activation or content download failed:', error)

    showMessage(
      error?.data?.message ||
        error?.message ||
        'Activation or content download failed. Please check your license key and try again.',
      'error'
    )
  } finally {
    loading.value = false
    syncing.value = false
  }
}

/* =========================================================
   MESSAGE
========================================================= */

let messageTimer = null

const showMessage = (text, type = 'success') => {
  message.value = text
  messageType.value = type

  if (messageTimer) {
    clearTimeout(messageTimer)
  }

  messageTimer = setTimeout(() => {
    message.value = ''
  }, 4000)
}

/* =========================================================
   HOME
========================================================= */

const goHome = () => {
  emit('gohome')
}
</script>