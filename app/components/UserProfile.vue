<template>
  <div
     class="flex h-dvh min-h-0 w-full flex-col overflow-hidden bg-[#f4f6fb] font-['Roboto',system-ui,sans-serif] text-[#201f22]"
  >
    <!-- ================= MOBILE HEADER (navy, rounded bottom) ================= -->
    <header
      class="shrink-0 rounded-b-[28px] bg-gradient-to-b from-[#14316d] to-[#1d4190] pb-14 sm:hidden"
    >
      <div class="flex h-12 items-center gap-1 px-2">
        <button
          type="button"
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white active:bg-white/10"
          aria-label="Go back"
          @click="goHome"
        >
          <Icon name="lucide:chevron-left" class="text-2xl" />
        </button>

        <button
          type="button"
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white p-1 active:bg-white/80"
          aria-label="Open menu"
          @click="emit('open-menu')"
        >
          <img src="/images/logos.svg" alt="" />
        </button>

        <span class="min-w-0 flex-1 truncate px-1.5 text-base font-medium tracking-[0.15px] text-white">
          Profile
        </span>

        <button
          type="button"
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white active:bg-white/10"
          aria-label="Home"
          @click="emit('gohome')"
        >
          <Icon name="lucide:home" class="text-xl" />
        </button>
      </div>
    </header>

    <main
      class="relative z-10 -mt-10 min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain px-3 pb-24 [-webkit-overflow-scrolling:touch] sm:mt-0 sm:px-4 sm:py-4"
    >
      <div class="mx-auto w-full max-w-md sm:max-w-4xl">
        <div class="sm:grid sm:grid-cols-[280px_1fr] sm:items-start sm:gap-3">
          <!-- ================= PROFILE CARD ================= -->
          <section
            class="mb-3 rounded-2xl bg-white p-4 text-center shadow-[0_4px_16px_rgba(20,49,109,0.10)] sm:sticky sm:top-2 sm:mb-0"
          >
            <div
              class="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#14316d] to-[#2c5bc4] text-xl font-medium tracking-[1px] text-white shadow-md ring-4 ring-[#e3ebff]"
              aria-hidden="true"
            >
              {{ initials }}
            </div>

            <!-- View mode -->
            <template v-if="!editing">
              <h2 class="truncate text-base font-medium text-gray-900">
                {{ profile.fullName || "Your name" }}
              </h2>

              <p
                class="mt-0.5 break-all text-sm"
                :class="profile.email ? 'text-gray-600' : 'text-gray-400'"
              >
                {{ profile.email || "No email added" }}
              </p>

              <p
                class="mt-0.5 text-xs"
                :class="profile.phone ? 'text-gray-500' : 'text-gray-400'"
              >
                {{ profile.phone || "No phone number added" }}
              </p>

              <button
                type="button"
                class="mt-3 inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-[#14316d] px-5 text-sm font-medium tracking-[0.1px] text-white shadow-sm transition active:brightness-125"
                @click="startEdit"
              >
                <Icon name="lucide:pencil" class="h-3.5 w-3.5" />
                Edit Profile
              </button>

              <p
                v-if="profileNotice.text"
                class="mt-2 text-xs"
                :class="profileNotice.type === 'error' ? 'text-red-600' : 'text-emerald-600'"
              >
                {{ profileNotice.text }}
              </p>
            </template>

            <!-- Edit mode: only last name and phone can change -->
            <form v-else class="space-y-2 text-left" @submit.prevent="saveEdit">
              <label class="block">
                <span class="mb-1 flex items-center gap-1 text-xs font-medium tracking-[0.4px] text-gray-500">
                  First name
                  <Icon name="lucide:lock" class="h-3 w-3 text-gray-400" />
                </span>
                <input :value="profile.firstName" type="text" readonly tabindex="-1" :class="lockedClass" />
              </label>

              <label class="block">
                <span class="mb-1 block text-xs font-medium tracking-[0.4px] text-gray-500">Last name</span>
                <input
                  v-model="draft.lastName"
                  type="text"
                  autocomplete="family-name"
                  placeholder="Your last name"
                  :class="inputClass"
                />
              </label>

              <label class="block">
                <span class="mb-1 flex items-center gap-1 text-xs font-medium tracking-[0.4px] text-gray-500">
                  Email
                  <Icon name="lucide:lock" class="h-3 w-3 text-gray-400" />
                </span>
                <input :value="profile.email" type="email" readonly tabindex="-1" :class="lockedClass" />
              </label>

              <label class="block">
                <span class="mb-1 block text-xs font-medium tracking-[0.4px] text-gray-500">Phone number</span>
                <input
                  v-model="draft.phone"
                  type="tel"
                  autocomplete="tel"
                  placeholder="Your phone number"
                  :class="inputClass"
                />
              </label>

              <p class="text-[11px] tracking-[0.4px] text-gray-400">
                Your first name and email can't be changed.
              </p>

              <p v-if="profileNotice.type === 'error'" class="text-xs text-red-600">
                {{ profileNotice.text }}
              </p>

              <div class="flex gap-2 pt-0.5">
                <button
                  type="button"
                  class="h-9 flex-1 rounded-full border border-gray-200 bg-white text-sm font-medium text-gray-700 transition active:bg-gray-100"
                  @click="cancelEdit"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  :disabled="saving"
                  class="h-9 flex-1 rounded-full bg-[#14316d] text-sm font-medium text-white transition active:brightness-125 disabled:opacity-60"
                >
                  {{ saving ? "Saving..." : "Save" }}
                </button>
              </div>
            </form>
          </section>

          <!-- ================= SETTINGS ================= -->
          <div class="space-y-3">
            <section v-for="group in groups" :key="group.id">
              <p class="px-2 pb-1 text-[11px] font-medium uppercase tracking-[0.5px] text-gray-500">
                {{ group.title }}
              </p>

              <div
                class="divide-y divide-gray-100 overflow-hidden rounded-2xl bg-white shadow-[0_2px_10px_rgba(20,49,109,0.07)]"
              >
                <div v-for="row in group.rows" :key="row.key">
                  <!-- Static row (no panel), e.g. app version -->
                  <div v-if="row.static" class="flex w-full items-center gap-2.5 px-3 py-2.5">
                    <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#14316d]/10 text-[#14316d]">
                      <Icon :name="row.icon" class="h-4 w-4" />
                    </div>
                    <span class="min-w-0 flex-1 truncate text-sm font-medium tracking-[0.1px] text-gray-900">
                      {{ row.label }}
                    </span>
                    <span class="shrink-0 text-xs text-gray-500">{{ row.value }}</span>
                  </div>

                  <template v-else>
                    <!-- Row header (tap to open on mobile) -->
                    <button
                      type="button"
                      class="flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition active:bg-gray-50 sm:pointer-events-none sm:cursor-default sm:pb-1"
                      :aria-expanded="openRow === row.key"
                      @click="toggleRow(row.key)"
                    >
                      <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#14316d]/10 text-[#14316d]">
                        <Icon :name="row.icon" class="h-4 w-4" />
                      </div>

                      <span class="min-w-0 flex-1 truncate text-sm font-medium tracking-[0.1px] text-gray-900">
                        {{ row.label }}
                      </span>

                      <span class="shrink-0 text-xs text-gray-400 sm:hidden">{{ row.value }}</span>

                      <Icon
                        name="lucide:chevron-right"
                        class="h-4 w-4 shrink-0 text-gray-400 transition-transform sm:hidden"
                        :class="{ 'rotate-90': openRow === row.key }"
                      />
                    </button>

                    <!-- Row panel (always visible on desktop) -->
                    <div class="px-3 pb-3 pt-1" :class="openRow === row.key ? 'block' : 'hidden sm:block'">
                      <!-- Language -->
                      <div v-if="row.key === 'language'" class="relative">
                        <select v-model="prefs.language" :class="inputClass + ' appearance-none pr-8'">
                          <option v-for="item in languages" :key="item.value" :value="item.value">
                            {{ item.label }}
                          </option>
                        </select>
                        <Icon
                          name="lucide:chevron-down"
                          class="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                        />
                      </div>

                      <!-- Currency -->
                      <div v-else-if="row.key === 'currency'" class="relative">
                        <select v-model="prefs.currency" :class="inputClass + ' appearance-none pr-8'">
                          <option v-for="item in currencies" :key="item.value" :value="item.value">
                            {{ item.label }}
                          </option>
                        </select>
                        <Icon
                          name="lucide:chevron-down"
                          class="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                        />
                      </div>

                      <!-- Appearance -->
                      <div v-else-if="row.key === 'appearance'" class="grid grid-cols-3 gap-1.5">
                        <button
                          v-for="mode in appearances"
                          :key="mode.value"
                          type="button"
                          class="flex h-9 items-center justify-center gap-1.5 rounded-full border text-sm font-medium transition"
                          :class="
                            prefs.appearance === mode.value
                              ? 'border-[#14316d] bg-[#14316d] text-white'
                              : 'border-gray-200 bg-gray-50 text-gray-600 active:bg-gray-100'
                          "
                          @click="prefs.appearance = mode.value"
                        >
                          <Icon :name="mode.icon" class="h-4 w-4" />
                          {{ mode.label }}
                        </button>
                      </div>

                      <!-- Application security -->
                      <div v-else-if="row.key === 'security'" class="flex items-center justify-between gap-3">
                        <div class="min-w-0">
                          <p class="text-sm text-gray-900">Lock the app when it opens</p>
                          <p class="text-xs text-gray-500">Ask for your device PIN or fingerprint.</p>
                        </div>

                        <button
                          type="button"
                          role="switch"
                          :aria-checked="prefs.appLock"
                          class="relative h-6 w-11 shrink-0 rounded-full transition-colors"
                          :class="prefs.appLock ? 'bg-[#14316d]' : 'bg-gray-300'"
                          @click="prefs.appLock = !prefs.appLock"
                        >
                          <span
                            class="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform"
                            :class="prefs.appLock ? 'translate-x-5' : 'translate-x-0'"
                          ></span>
                        </button>
                      </div>

                      <!-- Manage devices -->
                      <div v-else-if="row.key === 'devices'" class="flex items-center justify-between gap-3">
                        <p class="min-w-0 text-sm text-gray-600">See the devices that use your account.</p>
                        <button
                          type="button"
                          class="h-9 shrink-0 rounded-full border border-gray-200 bg-white px-4 text-sm font-medium text-gray-800 transition active:bg-gray-100"
                          @click="emit('manage-devices')"
                        >
                          Manage
                        </button>
                      </div>

                      <!-- Change password -->
                      <form v-else-if="row.key === 'password'" class="space-y-2" @submit.prevent="submitPassword">
                        <label class="block">
                          <span class="mb-1 block text-xs font-medium tracking-[0.4px] text-gray-500">Current password</span>
                          <input
                            v-model="pw.current"
                            :type="showPw ? 'text' : 'password'"
                            autocomplete="current-password"
                            :class="inputClass"
                          />
                        </label>

                        <label class="block">
                          <span class="mb-1 block text-xs font-medium tracking-[0.4px] text-gray-500">New password</span>
                          <input
                            v-model="pw.next"
                            :type="showPw ? 'text' : 'password'"
                            autocomplete="new-password"
                            placeholder="At least 8 characters"
                            :class="inputClass"
                          />
                        </label>

                        <label class="block">
                          <span class="mb-1 block text-xs font-medium tracking-[0.4px] text-gray-500">Confirm new password</span>
                          <input
                            v-model="pw.confirm"
                            :type="showPw ? 'text' : 'password'"
                            autocomplete="new-password"
                            :class="inputClass"
                          />
                        </label>

                        <label class="flex items-center gap-2 text-sm text-gray-600">
                          <input v-model="showPw" type="checkbox" class="h-4 w-4 accent-[#14316d]" />
                          Show passwords
                        </label>

                        <p
                          v-if="passwordNotice.text"
                          class="text-xs"
                          :class="passwordNotice.type === 'error' ? 'text-red-600' : 'text-emerald-600'"
                        >
                          {{ passwordNotice.text }}
                        </p>

                        <button
                          type="submit"
                          :disabled="changingPassword"
                          class="h-9 w-full rounded-full bg-[#14316d] text-sm font-medium text-white transition active:brightness-125 disabled:opacity-60"
                        >
                          {{ changingPassword ? "Updating..." : "Update Password" }}
                        </button>
                      </form>
                    </div>
                  </template>
                </div>
              </div>
            </section>

            <!-- Version footer -->
          <!-- Version footer -->
            <div class="pt-1 text-center">
              <p class="text-[11px] tracking-[0.4px] text-gray-400">
                ExamTips {{ versionLabel }}
              </p>
              <p class="mt-0.5 text-[11px] tracking-[0.4px] text-gray-400">
                Powered by
                <span class="font-medium text-[#14316d]">Abanise Education Institution</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, unref, watch } from "vue";
import { getVersion } from "@tauri-apps/api/app";

/*
|--------------------------------------------------------------------------
| Usage
|--------------------------------------------------------------------------
| <UserProfileSettings
|   :save-profile="async ({ lastName, phone }) => { ...call your API... }"
|   :change-password="async ({ currentPassword, newPassword }) => { ... }"
|   @gohome="goHome"
|   @manage-devices="navigateTo('/devices')"
| />
|
| First name and email are locked in the form. Also reject changes to them
| on your server, because locking inputs only hides them in the app.
*/

const props = defineProps({
  user: { type: Object, default: null },
  saveProfile: { type: Function, default: null },
  changePassword: { type: Function, default: null },
});

const emit = defineEmits([
  "gohome",
  "open-menu",
  "manage-devices",
  "update:preferences",
]);

const appState = useAppState();
const auth = useExamTipsAuth();
const router = useRouter();


const goHome = () => {
  emit("gohome")
}
const inputClass =
  "w-full rounded-xl border border-gray-200 bg-gray-50 px-2.5 py-2 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#14316d] focus:bg-white";

const lockedClass =
  "w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 px-2.5 py-2 text-sm text-gray-500 outline-none";

/* ---------- App version (Tauri desktop + mobile) ---------- */

const appVersion = ref("");

onMounted(async () => {
  try {
    // Reads the version from tauri.conf.json (or Cargo.toml).
    // Works on Windows, macOS, Linux, Android and iOS.
    appVersion.value = await getVersion();
  } catch {
    // Not running inside Tauri (e.g. plain browser during `nuxt dev`).
    appVersion.value = "";
  }
});

const versionLabel = computed(() =>
  appVersion.value ? `v${appVersion.value}` : "Web version"
);

/* ---------- Profile data (from the logged-in user) ---------- */

const profile = computed(() => {
  const raw =
    props.user ??
    unref(auth?.user) ??
    unref(auth?.currentUser) ??
    appState.value?.user ??
    {};
  const source = raw?.user ?? raw;

  const fullFromName = String(source.name ?? source.fullName ?? "").trim();
  const [nameFirst = "", ...nameRest] = fullFromName.split(/\s+/);

  const firstName = String(
    source.firstName ?? source.first_name ?? nameFirst
  ).trim();
  const lastName = String(
    source.lastName ?? source.last_name ?? nameRest.join(" ")
  ).trim();

  return {
    firstName,
    lastName,
    fullName: [firstName, lastName].filter(Boolean).join(" "),
    email: String(source.email ?? "").trim(),
    phone: String(source.phone ?? source.phoneNumber ?? "").trim(),
  };
});

const initials = computed(() => {
  const { firstName, lastName, email } = profile.value;
  const letters = (firstName[0] ?? "") + (lastName[0] ?? "");
  return (letters || email[0] || "?").toUpperCase();
});

/* ---------- Edit profile (last name + phone only) ---------- */

const editing = ref(false);
const saving = ref(false);
const draft = reactive({ lastName: "", phone: "" });
const profileNotice = reactive({ type: "", text: "" });

const startEdit = () => {
  draft.lastName = profile.value.lastName;
  draft.phone = profile.value.phone;
  profileNotice.type = "";
  profileNotice.text = "";
  editing.value = true;
};

const cancelEdit = () => {
  editing.value = false;
  profileNotice.type = "";
  profileNotice.text = "";
};

const saveEdit = async () => {
  const lastName = draft.lastName.trim();
  const phone = draft.phone.trim();

  profileNotice.type = "error";

  if (!lastName) {
    profileNotice.text = "Please enter your last name.";
    return;
  }

  if (!/^[+\d][\d\s()-]{6,}$/.test(phone)) {
    profileNotice.text = "Please enter a valid phone number.";
    return;
  }

  if (!props.saveProfile) {
    profileNotice.text = "Saving the profile is not connected yet.";
    return;
  }

  saving.value = true;

  try {
    await props.saveProfile({ lastName, phone });

    editing.value = false;
    profileNotice.type = "success";
    profileNotice.text = "Profile updated.";
  } catch (error) {
    profileNotice.type = "error";
    profileNotice.text = error?.message || "Could not save your profile.";
  } finally {
    saving.value = false;
  }
};

/* ---------- Preferences ---------- */

const languages = [
  { value: "en", label: "English" },
  { value: "yo", label: "Yoruba" },
  { value: "ha", label: "Hausa" },
  { value: "ig", label: "Igbo" },
];

const currencies = [
  { value: "NGN", label: "Nigerian Naira (₦)" },
  { value: "USD", label: "US Dollar ($)" },
  { value: "GBP", label: "British Pound (£)" },
  { value: "EUR", label: "Euro (€)" },
];

const appearances = [
  { value: "light", label: "Light", icon: "lucide:sun" },
  { value: "dark", label: "Dark", icon: "lucide:moon" },
  { value: "system", label: "Auto", icon: "lucide:smartphone" },
];

const saved = appState.value?.preferences ?? {};

const prefs = reactive({
  language: saved.language ?? "en",
  currency: saved.currency ?? "NGN",
  appearance: saved.appearance ?? "system",
  appLock: saved.appLock ?? false,
});

watch(
  prefs,
  (value) => {
    appState.value.preferences = { ...value };
    emit("update:preferences", { ...value });
  },
  { deep: true }
);

const labelOf = (list, value) =>
  list.find((item) => item.value === value)?.label ?? "";

/* ---------- Change password ---------- */

const pw = reactive({ current: "", next: "", confirm: "" });
const showPw = ref(false);
const changingPassword = ref(false);
const passwordNotice = reactive({ type: "", text: "" });

const submitPassword = async () => {
  passwordNotice.type = "error";

  if (!pw.current) {
    passwordNotice.text = "Enter your current password.";
    return;
  }

  if (pw.next.length < 8) {
    passwordNotice.text = "The new password must be at least 8 characters.";
    return;
  }

  if (pw.next === pw.current) {
    passwordNotice.text = "The new password must be different from the current one.";
    return;
  }

  if (pw.next !== pw.confirm) {
    passwordNotice.text = "The new passwords do not match.";
    return;
  }

  if (!props.changePassword) {
    passwordNotice.text = "Password change is not connected yet.";
    return;
  }

  changingPassword.value = true;

  try {
    await props.changePassword({
      currentPassword: pw.current,
      newPassword: pw.next,
    });

    pw.current = "";
    pw.next = "";
    pw.confirm = "";
    passwordNotice.type = "success";
    passwordNotice.text = "Password updated.";
  } catch (error) {
    passwordNotice.type = "error";
    passwordNotice.text = error?.message || "Could not update your password.";
  } finally {
    changingPassword.value = false;
  }
};

/* ---------- Settings list ---------- */

const openRow = ref("");

const toggleRow = (key) => {
  openRow.value = openRow.value === key ? "" : key;
};

const groups = computed(() => [
  {
    id: "preferences",
    title: "Preferences",
    rows: [
      { key: "language", label: "Language", icon: "lucide:languages", value: labelOf(languages, prefs.language) },
      { key: "currency", label: "Currency", icon: "lucide:coins", value: prefs.currency },
      { key: "appearance", label: "Appearance", icon: "lucide:palette", value: labelOf(appearances, prefs.appearance) },
    ],
  },
  {
    id: "security",
    title: "Security",
    rows: [
      { key: "security", label: "Application Security", icon: "lucide:shield-check", value: prefs.appLock ? "On" : "Off" },
      { key: "devices", label: "Manage Devices", icon: "lucide:smartphone", value: "" },
      { key: "password", label: "Change Password", icon: "lucide:key-round", value: "" },
    ],
  },
  {
    id: "about",
    title: "About",
    rows: [
      { key: "version", label: "App Version", icon: "lucide:info", value: versionLabel.value, static: true },
    ],
  },
]);
</script>