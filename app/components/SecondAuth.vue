<script setup lang="ts">
const {
  otpverify,
  resetpassword,
  isregisterpage,
  goToLogin,
  goToRegister,
  showforgetPage,
  handleforgetPage,
} = useAuthView()

const {
  registerData,
  loginData,
  registerloading,
  loginloading,
  loginWithGoogle,
  handleregister,
  handlelogin,
  handleloginwithGoogle,
  openExternalLink,
} = useAuthActions(otpverify)
</script>

<template>
  <main class="auth-page h-lvh bg-[#f3f4f6]">
    <div
      class="auth-shell flex min-h-screen w-full overflow-hidden bg-white shadow-sm sm:min-h-[calc(100vh-24px)] lg:min-h-[calc(100vh-40px)]"
    >
      <!-- ==========================================
           LEFT IMAGE SECTION
      =========================================== -->

      <section
        class="auth-image relative hidden overflow-hidden lg:flex lg:w-[43%] xl:w-[40%]"
      >
        <img
          src="/images/01-min copy.webp"
          alt="ExamTips learning"
          class="absolute inset-0 h-full w-full object-cover"
        />

        <!-- Image overlay -->
        <div
          class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/10"
        ></div>

        <!-- Left content -->
        <div class="relative z-10 flex min-h-full w-full flex-col p-7 xl:p-9">
          <!-- Logo -->
          <div class="flex items-center">
            <NavigationLogo />
          </div>

          <!-- Testimonial -->
          <div class="mt-auto max-w-[330px] text-white">
            <blockquote
              class="text-xl font-semibold leading-snug tracking-tight xl:text-2xl"
            >
              “Prepare smarter today and walk into your examination with
              confidence.”
            </blockquote>

            <div class="mt-5">
              <p class="text-xs font-semibold">ExamTips Learning Platform</p>

              <p class="mt-1 text-[11px] leading-5 text-white/75">
                Your trusted companion for JAMB, WAEC and NECO preparation.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- ==========================================
           RIGHT AUTHENTICATION SECTION
      =========================================== -->

      <section
        class="auth-form flex min-h-screen w-full flex-col justify-center bg-white px-5 py-8 sm:px-10 lg:min-h-0 lg:w-[57%] lg:px-12 xl:w-[60%] xl:px-20"
      >
       
        <div class="auth-content mx-auto w-full max-w-[400px]">
          <!-- Mobile logo -->
          <div class="auth-mobile-logo mb-8 flex justify-center lg:hidden">
            <NavigationLogo />
          </div>

          <!-- ======================================
               AUTH CONTENT TRANSITION
          ======================================= -->

          <Transition name="auth-switch" mode="out-in">
            <!-- FORGOT PASSWORD -->
            <div v-if="resetpassword" key="forgot-password">
              <Forgetpage @close="handleforgetPage" />
            </div>

            <!-- OTP VERIFICATION -->

            <div
              v-else-if="otpverify"
              key="otp-verification"
              class="flex min-h-[400px] items-center justify-center"
            >
            

              <AuthEmailVerifcation @close="otpverify = false"
                :email="isregisterpage ? registerData.email : loginData.email"
              />
            </div>

            <!-- LOGIN -->
            <div v-else-if="!isregisterpage" key="login">
              <!-- Heading -->
              <div class="mb-7 text-center">
                <h1
                  class="text-2xl font-bold tracking-tight text-slate-950 sm:text-[26px]"
                >
                  Welcome back to ExamTips
                </h1>

                <p class="mt-2 text-xs leading-5 text-slate-500">
                  Sign in to continue your learning journey.
                </p>
              </div>

              <!-- Login form -->
              <form @submit.prevent="handlelogin" class="space-y-4">
                <!-- Email -->
                <FormInput
                  type="email"
                  v-model:inputValue="loginData.email"
                  :required="true"
                  :usePlaceholder="true"
                  label="Email"
                  placeholder="Enter your email"
                >
                  <template #prefix>
                    <Icon
                      name="heroicons:envelope"
                      class="h-4 w-4 text-slate-400"
                    />
                  </template>
                </FormInput>

                <!-- Password -->
                <FormInput
                  type="password"
                  v-model:inputValue="loginData.password"
                  :required="true"
                  :usePlaceholder="true"
                  label="Password"
                  placeholder="Enter your password"
                >
                  <template #prefix>
                    <Icon
                      name="heroicons:lock-closed"
                      class="h-4 w-4 text-slate-400"
                    />
                  </template>
                </FormInput>

                <!-- Forgot password -->
                <div class="flex justify-end">
                  <button
                    type="button"
                  
                    class="text-xs font-semibold text-blue-600 transition hover:text-blue-700"
                  >
                    Forgot password?
                  </button>
                </div>

                <!-- Login button -->
                <button
                  type="submit"
                  :disabled="loginloading"
                  class="flex h-11 w-full items-center justify-center rounded-lg bg-[#2563eb] px-5 text-xs font-semibold text-white transition duration-200 hover:bg-[#1d4ed8] hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  <span
                    v-if="loginloading"
                    class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                  ></span>

                  {{ loginloading ? "Signing in..." : "Log in" }}
                </button>

                <!-- Divider -->
                <div class="relative py-2">
                  <div class="absolute inset-0 flex items-center">
                    <div class="w-full border-t border-slate-200"></div>
                  </div>

                  <div class="relative flex justify-center">
                    <span class="bg-white px-3 text-[10px] text-slate-400">
                      OR
                    </span>
                  </div>
                </div>

                <!-- Google login -->
                <button
                  type="button"
                  @click="handleloginwithGoogle"
                  :disabled="loginWithGoogle"
                  class="flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white px-5 text-xs font-semibold text-slate-700 transition duration-200 hover:-translate-y-0.5 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  <Icon name="logos:google-icon" class="h-4 w-4" />

                  {{
                    loginWithGoogle ? "Connecting..." : "Continue with Google"
                  }}
                </button>
              </form>

              <!-- Register link -->
              <p class="mt-7 text-center text-xs text-slate-500">
                Don't have an account?

                <button
                  type="button"
                  @click="goToRegister"
                  class="ml-1 font-semibold text-blue-600 transition hover:text-blue-700"
                >
                  Sign up
                </button>
              </p>
            </div>

            <!-- REGISTER -->
            <div v-else key="register">
              <!-- Heading -->
              <div class="mb-7 text-center">
                <h1
                  class="text-2xl font-bold tracking-tight text-slate-950 sm:text-[26px]"
                >
                  Create your account
                </h1>

                <p class="mt-2 text-xs leading-5 text-slate-500">
                  Join ExamTips and start preparing smarter.
                </p>
              </div>

              <!-- Register form -->
              <form @submit.prevent="handleregister" class="space-y-4">
                <!-- Names -->
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormInput
                    type="text"
                    v-model:inputValue="registerData.first_name"
                    :required="true"
                    :usePlaceholder="true"
                    label="First name"
                    placeholder="First name"
                  >
                    <template #prefix>
                      <Icon
                        name="heroicons:user"
                        class="h-4 w-4 text-slate-400"
                      />
                    </template>
                  </FormInput>

                  <FormInput
                    type="text"
                    v-model:inputValue="registerData.last_name"
                    :required="true"
                    :usePlaceholder="true"
                    label="Last name"
                    placeholder="Last name"
                  >
                    <template #prefix>
                      <Icon
                        name="heroicons:user"
                        class="h-4 w-4 text-slate-400"
                      />
                    </template>
                  </FormInput>
                </div>

                <!-- Email -->
                <FormInput
                  type="email"
                  v-model:inputValue="registerData.email"
                  :required="true"
                  :usePlaceholder="true"
                  label="Email"
                  placeholder="Enter your email"
                >
                  <template #prefix>
                    <Icon
                      name="heroicons:envelope"
                      class="h-4 w-4 text-slate-400"
                    />
                  </template>
                </FormInput>

                <!-- Phone -->
                <FormInput
                  type="tel"
                  v-model:inputValue="registerData.phone"
                  :required="true"
                  :usePlaceholder="true"
                  label="Phone number"
                  placeholder="Phone number"
                >
                  <template #prefix>
                    <Icon
                      name="heroicons:device-phone-mobile"
                      class="h-4 w-4 text-slate-400"
                    />
                  </template>
                </FormInput>

                <!-- Password -->
                <FormInput
                  type="password"
                  v-model:inputValue="registerData.password"
                  :required="true"
                  :usePlaceholder="true"
                  label="Password"
                  placeholder="Create a password"
                >
                  <template #prefix>
                    <Icon
                      name="heroicons:lock-closed"
                      class="h-4 w-4 text-slate-400"
                    />
                  </template>
                </FormInput>

                <!-- Terms -->
                <div class="flex items-start gap-2">
                  <input
                    id="terms"
                    type="checkbox"
                    required
                    class="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />

                  <label
                    for="terms"
                    class="text-[11px] leading-4 text-slate-500"
                  >
                    I agree to the

                    <button
                      type="button"
                      class="font-semibold text-blue-600 transition hover:text-blue-700"
                    >
                      Terms
                    </button>

                    and

                    <button
                      type="button"
                      @click="openExternalLink('https://www.abanise.com/')"
                      class="font-semibold text-blue-600 transition hover:text-blue-700"
                    >
                      Privacy Policy
                    </button>
                  </label>
                </div>

                <!-- Register button -->
                <button
                  type="submit"
                  :disabled="registerloading"
                  class="flex h-11 w-full items-center justify-center rounded-lg bg-[#2563eb] px-5 text-xs font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#1d4ed8] focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  <span
                    v-if="registerloading"
                    class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                  ></span>

                  {{
                    registerloading ? "Creating account..." : "Create account"
                  }}
                </button>

                <!-- Divider -->
                <div class="relative py-2">
                  <div class="absolute inset-0 flex items-center">
                    <div class="w-full border-t border-slate-200"></div>
                  </div>

                  <div class="relative flex justify-center">
                    <span class="bg-white px-3 text-[10px] text-slate-400">
                      OR
                    </span>
                  </div>
                </div>

                <!-- Google -->
                <button
                  type="button"
                  @click="handleloginwithGoogle"
                  :disabled="loginWithGoogle"
                  class="flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white px-5 text-xs font-semibold text-slate-700 transition duration-200 hover:-translate-y-0.5 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  <Icon name="logos:google-icon" class="h-4 w-4" />

                  {{
                    loginWithGoogle ? "Connecting..." : "Continue with Google"
                  }}
                </button>
              </form>

              <!-- Login link -->
              <p class="mt-7 text-center text-xs text-slate-500">
                Already have an account?

                <button
                  type="button"
                  @click="goToLogin"
                  class="ml-1 font-semibold text-blue-600 transition hover:text-blue-700"
                >
                  Log in
                </button>
              </p>
            </div>
          </Transition>
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped>
/* ==========================================
   PAGE ENTRANCE ANIMATION
========================================== */

.auth-page {
  animation: pageFadeIn 0.45s ease-out both;
}

.auth-shell {
  animation: shellReveal 0.55s ease-out both;
}

.auth-image {
  animation: imageReveal 0.75s ease-out both;
}

.auth-form {
  animation: formReveal 0.6s ease-out both;
}

.auth-content {
  animation: contentReveal 0.7s ease-out 0.12s both;
}

.auth-mobile-logo {
  animation: contentReveal 0.5s ease-out both;
}

/* ==========================================
   LOGIN / REGISTER SWITCH ANIMATION
========================================== */

.auth-switch-enter-active,
.auth-switch-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.auth-switch-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.auth-switch-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ==========================================
   KEYFRAMES
========================================== */

@keyframes pageFadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes shellReveal {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes imageReveal {
  from {
    opacity: 0;
    transform: scale(1.03);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes formReveal {
  from {
    opacity: 0;
    transform: translateX(12px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes contentReveal {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ==========================================
   REDUCED MOTION ACCESSIBILITY
========================================== */

@media (prefers-reduced-motion: reduce) {
  .auth-page,
  .auth-shell,
  .auth-image,
  .auth-form,
  .auth-content,
  .auth-mobile-logo {
    animation: none;
  }

  .auth-switch-enter-active,
  .auth-switch-leave-active {
    transition: none;
  }
}
</style>