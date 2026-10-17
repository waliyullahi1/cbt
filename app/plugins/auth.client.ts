export default defineNuxtPlugin(() => {
  const auth = useExamTipsAuth()
  const router = useRouter()

  const publicPages = [
    "/login",
    "/register",
    "/verify-email",
    "/forgot-password",
    "/reset-password",
    "/activate",
  ]

  console.log("🔐 Auth plugin starting...")

  void auth.initialize().then(async () => {
    console.log("✅ Auth initialized:", {
      isLoggedIn: auth.isLoggedIn.value,
      isActivated: auth.isActivated.value,
    })

    const currentPath = router.currentRoute.value.path

    if (publicPages.includes(currentPath)) {
      console.log("🌐 Public page:", currentPath)
      return
    }
    if (!auth.isLoggedIn.value) {
      await navigateTo("/activate", {
        replace: true,
      })
      console.log("❌ Authentication required")
      return
    }

    await navigateTo("/", {
      replace: true,
    })
    console.log("✅ Authentication access granted")
  }).catch((error) => {
    console.error("❌ Auth plugin failed:", error)
  })
})