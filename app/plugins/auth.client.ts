export default defineNuxtPlugin(async () => {
  const auth = useExamTipsAuth()
  await auth.initialize()
})