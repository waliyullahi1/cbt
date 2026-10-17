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

  // The page on your website that opens when the user taps "Pay".
  // Put your real link here (or pass it in: <PurchaseActivation pay-url="..." />)
  payUrl: {
    type: String,
    default: 'https://your-website.com/pay'
  },

  // WhatsApp number in international format, no "+" (234... for Nigeria)
  whatsappNumber: {
    type: String,
    default: '2348012345678'
  },

  accounts: {
    type: Array,
    default: () => [
      {
        bankName: 'GTBank',
        accountNumber: '0227300274',
        accountName: 'Your Company Name'
      },
      {
        bankName: 'Zenith Bank',
        accountNumber: '1014381194',
        accountName: 'Your Company Name'
      }
    ]
  }
})

// opens links in the phone / computer browser (see composables/useOpenExternal.ts)
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
  const text = `Hello, I have made a bank transfer/payment and I would like to confirm my payment and receive my activation code.

Amount: ${formattedAmount.value}`

  return `https://wa.me/${props.whatsappNumber}?text=${encodeURIComponent(text)}`
})

/* =========================================================
   PAY  ->  opens your website
========================================================= */

const pay = async () => {
  if (opening.value) return

  opening.value = true

  try {
    await openExternal(props.payUrl)
  } finally {
    // short pause so a double tap doesn't open two pages
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
  <div class="w-full">
    <!-- =========================
         HEADER
    ========================== -->
    <div class="mb-4 flex items-center gap-3">
      <span
        class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600"
      >
        <Icon name="lucide:credit-card" class="h-5 w-5" />
      </span>

      <h2 class="text-lg font-bold text-[#0B2F6B]">Buy Activation</h2>
    </div>

    <!-- =========================
         PAYMENT METHOD (segmented control)
    ========================== -->
    <div class="mx-auto grid max-w-xl grid-cols-2 gap-1 rounded-2xl bg-blue-50 p-1">
      <button
        type="button"
        class="min-h-10 rounded-xl px-3 py-2 text-xs font-bold transition active:scale-[0.98]"
        :class="
          paymentMethod === 'card'
            ? 'bg-white text-[#0A6CFF] shadow-[0_2px_8px_rgba(20,49,109,0.12)]'
            : 'text-slate-500 hover:text-[#0B2F6B]'
        "
        @click="paymentMethod = 'card'"
      >
        Pay with Card
      </button>

      <button
        type="button"
        class="min-h-10 rounded-xl px-3 py-2 text-xs font-bold transition active:scale-[0.98]"
        :class="
          paymentMethod === 'bank'
            ? 'bg-white text-[#0A6CFF] shadow-[0_2px_8px_rgba(20,49,109,0.12)]'
            : 'text-slate-500 hover:text-[#0B2F6B]'
        "
        @click="paymentMethod = 'bank'"
      >
        Transfer / Bank Deposit
      </button>
    </div>

    <!-- =========================
         PAYMENT CONTENT
    ========================== -->
    <div class="mx-auto mt-5 w-full max-w-xl">
      <!-- =====================================
           PAY ONLINE
      ====================================== -->
      <div v-if="paymentMethod === 'card'">
        <h3 class="text-base font-bold text-[#0B2F6B]">Pay Online</h3>

        <p class="mt-1 text-sm text-slate-500">
          Pay securely using Paystack.
        </p>

        <!-- PRICE -->
        <div
          class="mt-5 flex items-center justify-between gap-3 rounded-2xl bg-blue-50 px-4 py-3"
        >
          <span class="text-sm text-slate-500">Activation Price</span>

          <strong class="text-base font-bold tabular-nums text-[#0B2F6B]">
            {{ formattedAmount }}
          </strong>
        </div>

        <!-- PAY BUTTON -->
        <button
          type="button"
          :disabled="opening"
          class="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#0A6CFF] px-4 text-sm font-bold text-white shadow-[0_6px_14px_rgba(10,108,255,0.35)] transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
          @click="pay"
        >
          <Icon
            :name="opening ? 'lucide:loader-circle' : 'lucide:external-link'"
            :class="{ 'animate-spin': opening }"
            class="h-5 w-5"
          />

          {{ opening ? 'Opening Payment...' : `Pay ${formattedAmount}` }}
        </button>

        <p class="mt-4 text-xs leading-5 text-slate-500">
          Your payment will be verified before your activation
          is completed.
        </p>
      </div>

      <!-- =====================================
           BANK TRANSFER
      ====================================== -->
      <div v-else>
        <h3 class="text-base font-bold text-[#0B2F6B]">
          Transfer / Bank Deposit
        </h3>

        <!-- BANK ACCOUNTS -->
        <div class="mt-5 space-y-3">
          <div
            v-for="account in accounts"
            :key="account.accountNumber"
            class="flex items-start gap-3 rounded-2xl bg-blue-50 p-4"
          >
            <span
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#0A6CFF] ring-1 ring-blue-100"
            >
              <Icon name="lucide:landmark" class="h-5 w-5" />
            </span>

            <div class="min-w-0 space-y-0.5">
              <p class="text-sm text-slate-500">
                Bank Name:
                <span class="font-bold text-[#0B2F6B]">
                  {{ account.bankName }}
                </span>
              </p>

              <p class="text-sm text-slate-500">
                Account Number:
                <span class="font-bold tabular-nums text-[#0B2F6B]">
                  {{ account.accountNumber }}
                </span>
              </p>

              <p class="break-words text-sm text-slate-500">
                Account Name:
                <span class="font-bold text-[#0B2F6B]">
                  {{ account.accountName }}
                </span>
              </p>
            </div>
          </div>
        </div>

        <!-- WHATSAPP PAYMENT NOTICE -->
        <div class="mt-5 rounded-2xl border border-blue-100 bg-white p-4">
          <h4 class="text-sm font-bold text-[#0B2F6B]">
            Payment Confirmation
          </h4>

          <p class="mt-2 text-sm leading-6 text-slate-500">
            After making your transfer or bank deposit, please contact us
            on WhatsApp and send your payment details. Your payment will
            be verified before your activation code is issued.
          </p>

          <button
            type="button"
            class="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#0A6CFF] px-4 text-sm font-bold text-white shadow-[0_6px_14px_rgba(10,108,255,0.35)] transition hover:brightness-110 active:scale-[0.98]"
            @click="contactOnWhatsApp"
          >
            <Icon name="lucide:message-circle" class="h-5 w-5" />
            Contact Us on WhatsApp
          </button>
        </div>

        <p class="mt-4 text-xs leading-5 text-slate-500">
          Please send your payment receipt or transaction reference on
          WhatsApp so we can verify your payment and issue your activation
          code.
        </p>
      </div>
    </div>
  </div>
</template>