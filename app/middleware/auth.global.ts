export default defineNuxtRouteMiddleware((to) => {
  const auth = useExamTipsAuth()

  // Not logged in: allow only /activate
  if (!auth.isLoggedIn.value) {
    if (to.path === "/activate") return

    return navigateTo("/activate", { replace: true })
  }

  // Logged-in users can access all pages,
  // whether activated or not.
  return
})