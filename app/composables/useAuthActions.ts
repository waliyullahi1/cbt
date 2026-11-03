import type { Ref } from "vue"
import { isTauri } from "@tauri-apps/api/core"

export function useAuthActions(otpverify: Ref<boolean>) {
  const { $toast } = useNuxtApp()
  const auth = useExamTipsAuth()
  const router = useRouter()

  const registerloading = ref(false)
  const loginloading = ref(false)
  const loginWithGoogle = ref(false)

  const registerData = reactive({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_pwd: "",
    phone: "",
  })

  const loginData = reactive({
    email: "",
    password: "",
  })

  // ---------- REGISTER ----------
  const handleregister = async () => {
    if (registerloading.value) return

    const { first_name, last_name, email, phone, password } = registerData

    if (!first_name.trim()) return $toast.error("Please enter your first name.")
    if (!last_name.trim()) return $toast.error("Please enter your last name.")
    if (!email.trim()) return $toast.error("Please enter your email address.")
    if (!phone.trim()) return $toast.error("Please enter your phone number.")
    if (password.length < 6) return $toast.error("Password must be at least 6 characters.")

    registerloading.value = true

    try {
      const res = await useApiFetch<any>("/auth/register", {
        method: "POST",
        body: {
          firstName: first_name.trim(),
          lastName: last_name.trim(),
          email: email.trim(),
          password,
          phone: phone.trim(),
        },
      })

      if (!res.success) {
        $toast.error(res.message || "Registration failed.")
        return
      }

      $toast.success(res.data?.message || "Registration successful.")
      setTimeout(() => (otpverify.value = true), 500)
    } finally {
      registerloading.value = false
    }
  }

  // ---------- LOGIN ----------
  const handlelogin = async () => {
    if (loginloading.value) return

    loginloading.value = true

    try {
      const res = await useApiFetch<any>("/auth/login/local", {
        method: "POST",
        body: {
          emaillOrPhone: loginData.email.trim(),
          pwd: loginData.password,
        },
      })

      if (!res.success) {
        $toast.error(res.message || "Login failed.")

        // 403 means the account still needs email verification
        if (res.status === 403) otpverify.value = true
        return
      }

     const loggedInUser = res.data?.data

if (!loggedInUser) {
  throw new Error("Login successful, but user information is missing.")
}

await auth.saveUser(loggedInUser)

await auth.initialize()

$toast.success("Login successful")

await navigateTo("/", {
  replace: true,
})

      $toast.success(res.data?.message || "Login successful.")
      setTimeout(() => router.push("/"), 500)
    } finally {
      loginloading.value = false
    }
  }

  // ---------- EXTERNAL LINKS ----------
  const openExternalLink = async (url: string) => {
    try {
      if (import.meta.client && isTauri()) {
        const { openUrl } = await import("@tauri-apps/plugin-opener")
        await openUrl(url)
      } else {
        window.open(url, "_blank", "noopener")
      }
    } catch (error) {
      console.error("Unable to open external link:", error)
    }
  }

  // ---------- GOOGLE LOGIN ----------
  const handleloginwithGoogle = async () => {
    if (loginWithGoogle.value) return

    loginWithGoogle.value = true

    try {
      const res = await useApiFetch<any>("/auth/login/google", { method: "POST" })

      if (!res.success) {
        $toast.error(res.message || "Google login failed.")
        return
      }

      if (res.data?.url) {
        await openExternalLink(res.data.url)
      } else {
        $toast.error("Google authentication URL was not returned.")
      }
    } finally {
      loginWithGoogle.value = false
    }
  }

  return {
    registerData,
    loginData,
    registerloading,
    loginloading,
    loginWithGoogle,
    handleregister,
    handlelogin,
    handleloginwithGoogle,
    openExternalLink,
  }
}