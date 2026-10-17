<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  amount: {
    type: Number,
    default: 4000
  },
  currency: {
    type: String,
    default: 'NGN'
  },
  // Website payment page; pass the real URL when integrating payments.
  payUrl: {
    type: String,
    default: 'https://www.examtips.abanise.com'
  },
  // International WhatsApp number without the + sign.
  whatsappNumber: {
    type: String,
    default: '2347068393706'
  },
  accounts: {
    type: Array,
    default: () => [
      {
        bankName: 'Wema Bank',
        accountNumber: '0223489006',
        accountName: 'Waheed Ambali'
      },
      {
        bankName: 'Zenith Bank',
        accountNumber: '1014381194',
        accountName: 'Waheed Ambali'
      }
    ]
  }
})

const { openExternal } = useOpenExternal()

const paymentMethod = ref('card')
const opening = ref(false)

const formattedAmount = computed(() => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: props.currency,
    minimumFractionDigits: 2
  }).format(props.amount)
})

const whatsappUrl = computed(() => {
  const text = `Hello, I have made a bank transfer/payment and I would like to confirm my payment and receive my activation code.\n\nAmount: ${formattedAmount.value}`
  return `https://wa.me/${props.whatsappNumber}?text=${encodeURIComponent(text)}`
})

const pay = async () => {
  if (opening.value) return

  opening.value = true
  try {
    await openExternal(props.payUrl)
  } finally {
    // Prevent accidental repeated taps.
    setTimeout(() => {
      opening.value = false
    }, 1500)
  }
}

const contactOnWhatsApp = () => {
  openExternal(whatsappUrl.value)
}
</script>

<template>
  <section class="w-full min-w-0 font-['Roboto',system-ui,sans-serif] text-slate-800">
    <div class="mx-auto w-full max-w-3xl">
      <!-- Header -->
      <div class="mb-4 flex items-center gap-3 sm:mb-5">
        <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 sm:h-11 sm:w-11 sm:rounded-full">
          <Icon name="lucide:credit-card" class="h-5 w-5" />
        </span>
        <div class="min-w-0">
          <h2 class="text-base font-bold leading-tight text-[#0B2F6B] sm:text-lg">
            Buy Activation
          </h2>
          <p class="mt-1 text-xs leading-4 text-slate-500 sm:text-sm sm:leading-5">
            Choose your preferred payment method.
          </p>
        </div>
      </div>

      <!-- Payment method selector -->
      <div class="grid grid-cols-2 gap-1 rounded-xl bg-blue-50 p-1 sm:mx-auto sm:max-w-xl sm:rounded-2xl">
        <button
          type="button"
          class="flex min-h-11 items-center justify-center rounded-lg px-2 py-2 text-xs font-bold leading-tight transition active:scale-[0.98] sm:rounded-xl sm:px-3 sm:text-sm"
          :class="paymentMethod === 'card'
            ? 'bg-white text-[#0A6CFF] shadow-[0_2px_8px_rgba(20,49,109,0.12)]'
            : 'text-slate-500 hover:text-[#0B2F6B]'"
          :aria-pressed="paymentMethod === 'card'"
          @click="paymentMethod = 'card'"
        >
          <Icon name="lucide:credit-card" class="mr-1.5 h-4 w-4 shrink-0" />
          <span>Pay by Card</span>
        </button>

        <button
          type="button"
          class="flex min-h-11 items-center justify-center rounded-lg px-2 py-2 text-xs font-bold leading-tight transition active:scale-[0.98] sm:rounded-xl sm:px-3 sm:text-sm"
          :class="paymentMethod === 'bank'
            ? 'bg-white text-[#0A6CFF] shadow-[0_2px_8px_rgba(20,49,109,0.12)]'
            : 'text-slate-500 hover:text-[#0B2F6B]'"
          :aria-pressed="paymentMethod === 'bank'"
          @click="paymentMethod = 'bank'"
        >
          <Icon name="lucide:landmark" class="mr-1.5 h-4 w-4 shrink-0" />
          <span>Bank Transfer</span>
        </button>
      </div>

      <!-- Payment panel -->
      <div class="mt-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_4px_18px_rgba(36,48,74,0.05)] sm:mt-5 sm:p-6">
        <!-- Pay online -->
        <div v-if="paymentMethod === 'card'">
          <h3 class="text-sm font-bold text-[#0B2F6B] sm:text-base">
            Pay Online
          </h3>
          <p class="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
            Pay securely using Paystack.
          </p>

          <!-- Price -->
          <div class="mt-4 flex min-w-0 items-center justify-between gap-3 rounded-xl bg-blue-50 px-3 py-3 sm:mt-5 sm:rounded-2xl sm:px-4">
            <div class="min-w-0">
              <p class="text-xs text-slate-500 sm:text-sm">Activation price</p>
              <p class="mt-0.5 text-[11px] text-slate-400 sm:text-xs">One-time payment</p>
            </div>
            <strong class="shrink-0 text-sm font-bold tabular-nums text-[#0B2F6B] sm:text-base">
              {{ formattedAmount }}
            </strong>
          </div>

          <!-- Pay button -->
          <button
            type="button"
            :disabled="opening"
            class="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0A6CFF] px-4 py-3 text-sm font-bold text-white shadow-[0_4px_12px_rgba(10,108,255,0.24)] transition hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none sm:mt-5 sm:min-h-12 sm:rounded-2xl"
            @click="pay"
          >
            <Icon
              :name="opening ? 'lucide:loader-circle' : 'lucide:external-link'"
              :class="{ 'animate-spin': opening }"
              class="h-4 w-4 shrink-0 sm:h-5 sm:w-5"
            />
            <span class="min-w-0 truncate">
              {{ opening ? 'Opening payment…' : `Pay ${formattedAmount}` }}
            </span>
          </button>

          <p class="mt-3 text-xs leading-5 text-slate-500 sm:mt-4 sm:text-sm">
            Your payment will be verified before activation is completed.
          </p>
        </div>

        <!-- Bank transfer -->
        <div v-else>
          <h3 class="text-sm font-bold text-[#0B2F6B] sm:text-base">
            Transfer / Bank Deposit
          </h3>
          <p class="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
            Transfer the exact amount to one of these accounts.
          </p>

          <!-- Bank accounts -->
          <div class="mt-4 space-y-3 sm:mt-5">
            <article
              v-for="account in accounts"
              :key="account.accountNumber"
              class="flex min-w-0 items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/80 p-3 sm:rounded-2xl sm:p-4"
            >
              <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#0A6CFF] ring-1 ring-blue-100 sm:h-10 sm:w-10 sm:rounded-xl">
                <Icon name="lucide:landmark" class="h-4 w-4 sm:h-5 sm:w-5" />
              </span>

              <div class="min-w-0 flex-1 space-y-1 text-xs leading-5 sm:text-sm">
                <p class="min-w-0 break-words text-slate-500">
                  Bank name:
                  <span class="font-bold text-[#0B2F6B]">{{ account.bankName }}</span>
                </p>
                <p class="min-w-0 break-words text-slate-500">
                  Account number:
                  <span class="font-bold tabular-nums text-[#0B2F6B]">{{ account.accountNumber }}</span>
                </p>
                <p class="min-w-0 break-words text-slate-500">
                  Account name:
                  <span class="font-bold text-[#0B2F6B]">{{ account.accountName }}</span>
                </p>
              </div>
            </article>
          </div>

          <!-- Payment confirmation -->
          <div class="mt-4 rounded-xl border border-slate-200 bg-white p-3 sm:mt-5 sm:rounded-2xl sm:p-4">
            <div class="flex items-start gap-2.5">
              <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <Icon name="lucide:message-circle" class="h-4 w-4" />
              </span>
              <div class="min-w-0">
                <h4 class="text-sm font-bold text-[#0B2F6B]">
                  Payment confirmation
                </h4>
                <p class="mt-1.5 text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
                  After making your transfer or deposit, contact us on WhatsApp and send your receipt or transaction reference. We will verify your payment before issuing your activation code.
                </p>
              </div>
            </div>

            <button
              type="button"
              class="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0A6CFF] px-4 py-3 text-sm font-bold text-white shadow-[0_4px_12px_rgba(10,108,255,0.24)] transition hover:brightness-110 active:scale-[0.99] sm:mt-4 sm:min-h-12 sm:rounded-2xl"
              @click="contactOnWhatsApp"
            >
              <Icon name="lucide:message-circle" class="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
              Contact us on WhatsApp
            </button>
          </div>

          <p class="mt-3 text-xs leading-5 text-slate-500 sm:mt-4 sm:text-sm">
            Please make sure your payment details are clear so we can confirm the transaction.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
