// Controls which screen is visible (login / register / forgot password / OTP).
// The URL query is the single source of truth, so no manual syncing or watcher is needed.
export function useAuthView() {
  const route = useRoute()
  const router = useRouter()

  const otpverify = ref(false)

  const resetpassword = computed(() => route.query.forgetpage === "true")
  const isregisterpage = computed(() => route.query.type === "register-page")

  const goToLogin = () => {
    otpverify.value = false
    router.replace({ query: { ...route.query, type: "login-page" } })
  }

  const goToRegister = () => {
    otpverify.value = false
    router.replace({ query: { ...route.query, type: "register-page" } })
  }

  const showforgetPage = () => {
    router.replace({ query: { ...route.query, forgetpage: "true" } })
  }

  const handleforgetPage = () => {
    const query = { ...route.query }
    delete query.forgetpage
    router.replace({ query })
  }

  return {
    otpverify,
    resetpassword,
    isregisterpage,
    goToLogin,
    goToRegister,
    showforgetPage,
    handleforgetPage,
  }
}