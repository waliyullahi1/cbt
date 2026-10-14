import {
  startContentDownload,
  fetchSubjects,
  fetchTopics,
  fetchQuestions,
  fetchLearning,
} from "~/utils/contentDownloader"

import {
  saveQuestions,
  replaceLessonsWithLatestData,
} from "~/utils/contentSync"

import {
  getQuestionsDB,
  getLessonsDB,
} from "~/utils/databases"


export function useContentSync() {

  const downloading =
    ref(false)

  const completed =
    ref(false)

  const error =
    ref("")

  const phase =
    ref("")

  const manifest =
    ref<any>(null)


  const subjectsDownloaded =
    ref(0)

  const topicsDownloaded =
    ref(0)

  const questionsDownloaded =
    ref(0)

  const learningDownloaded =
    ref(0)


  // ==========================================================
  // TOTAL DOWNLOADED
  // ==========================================================

  const downloadedTotal =
    computed(() => {

      return (
        subjectsDownloaded.value +
        topicsDownloaded.value +
        questionsDownloaded.value +
        learningDownloaded.value
      )

    })


  // ==========================================================
  // TOTAL
  // ==========================================================

  const total =
    computed(() => {

      if (!manifest.value) {
        return 0
      }

      return Number(
        manifest.value.total || 0
      )
    })


  // ==========================================================
  // PERCENTAGE
  // ==========================================================

  const percentage =
    computed(() => {

      if (!total.value) {
        return 0
      }

      return Math.min(
        100,
        Math.round(
          (
            downloadedTotal.value /
            total.value
          ) * 100
        )
      )
    })


  // ==========================================================
  // GET ARRAY FROM RESPONSE
  // ==========================================================

  function getItems(
    response: any,
    names: string[]
  ) {

    if (Array.isArray(response)) {
      return response
    }


    for (const name of names) {

      if (
        Array.isArray(
          response?.data?.[name]
        )
      ) {
        return response.data[name]
      }


      if (
        Array.isArray(
          response?.[name]
        )
      ) {
        return response[name]
      }
    }


    return []
  }


  // ==========================================================
  // GET NEXT CURSOR
  // ==========================================================

  function getNextCursor(
    response: any
  ) {

    return (
      response?.data?.nextCursor ??
      response?.data?.next_cursor ??
      response?.nextCursor ??
      response?.next_cursor ??
      null
    )
  }


  // ==========================================================
  // DOWNLOAD SUBJECTS
  // ==========================================================

  async function downloadSubjects(
    token: string
  ) {

    phase.value =
      "Downloading subjects..."


    const response =
      await fetchSubjects(token)

    const subjects =
      getItems(
        response,
        [
          "subjects",
          "items",
        ]
      )

    subjectsDownloaded.value =
      subjects.length

    return subjects
  }


  // ==========================================================
  // DOWNLOAD TOPICS
  // ==========================================================

  async function downloadTopics(
    token: string
  ) {

    phase.value =
      "Downloading topics..."


    const response =
      await fetchTopics(token)


    const topics =
      getItems(
        response,
        [
          "topics",
          "items",
        ]
      )


    topicsDownloaded.value =
      topics.length

    return topics
  }


  // ==========================================================
  // DOWNLOAD QUESTIONS
  // ==========================================================

  async function downloadQuestions(
    token: string
  ) {

    phase.value =
      "Downloading past questions..."


    let cursor = ""

    let totalSaved = 0


    while (true) {

      const response =
        await fetchQuestions(
          token,
          manifest.value?.batchSize || 500,
          cursor
        )


      const questions =
        getItems(
          response,
          [
            "questions",
            "items",
          ]
        )


      if (!questions.length) {
        break
      }


      await saveQuestions(
        questions
      )


      totalSaved +=
        questions.length


      questionsDownloaded.value =
        totalSaved


      const nextCursor =
        getNextCursor(
          response
        )


      if (!nextCursor) {
        break
      }


      cursor =
        String(nextCursor)


      // Safety protection
      if (cursor === "") {
        break
      }
    }
  }


  // ==========================================================
  // DOWNLOAD LEARNING
  // ==========================================================

  async function downloadLearning(
    token: string
  ) {

    phase.value =
      "Downloading lessons..."


    let cursor = ""
    const allLessons: any[] = []

    while (true) {

      const response =
        await fetchLearning(
          token,
          manifest.value?.batchSize || 500,
          cursor
        )


      const lessons =
        getItems(
          response,
          [
            "learning",
            "lessons",
            "items",
          ]
        )


      if (!lessons.length) {
        break
      }

      allLessons.push(...lessons)

      learningDownloaded.value =
        allLessons.length


      const nextCursor =
        getNextCursor(
          response
        )


      if (!nextCursor) {
        break
      }


      cursor =
        String(nextCursor)


      if (cursor === "") {
        break
      }
    }

    return allLessons
  }


  // ==========================================================
  // START COMPLETE DOWNLOAD
  // ==========================================================

  async function startDownload(
    token: string
  ) {

    if (downloading.value) {
      return
    }


    downloading.value =
      true

    completed.value =
      false

    error.value =
      ""

    manifest.value =
      null


    subjectsDownloaded.value =
      0

    topicsDownloaded.value =
      0

    questionsDownloaded.value =
      0

    learningDownloaded.value =
      0


    try {

      // ======================================================
      // STEP 1
      // VERIFY TOKEN
      // ======================================================

      phase.value =
        "Verifying activation token..."


      const startResponse =
        await startContentDownload(
          token
        )


      const responseData: any =
        startResponse.data

      manifest.value =
        responseData?.content
          ? {
              ...responseData.content,
              batchSize:
                responseData.content.batchSize ||
                responseData.batchSize,
            }
          : responseData || null

      if (!manifest.value) {
        throw new Error(
          "The server did not return a content manifest",
        )
      }


      console.log(
        "📦 Download manifest:",
        manifest.value
      )


      // ======================================================
      // STEP 2
      // SUBJECTS
      // ======================================================

      const subjects = await downloadSubjects(token)


      // ======================================================
      // STEP 3
      // TOPICS
      // ======================================================

      const topics = await downloadTopics(token)


      // ======================================================
      // STEP 4
      // QUESTIONS
      // ======================================================

      await downloadQuestions(
        token
      )


      // ======================================================
      // STEP 5
      // LESSONS
      // ======================================================

      const lessons = await downloadLearning(token)

      await replaceLessonsWithLatestData({
        subjects,
        topics,
        lessons,
      })


      // ======================================================
      // DONE
      // ======================================================

      phase.value =
        "Download complete"

      completed.value =
        true


      console.log(
        "🎉 Content download completed"
      )


    } catch (err: any) {

      console.error(
        "❌ Content download failed:",
        err
      )


      error.value =
        err?.message ||
        "Content download failed"


      phase.value =
        "Download failed"


    } finally {

      downloading.value =
        false
    }
  }


  // ==========================================================
  // RETURN
  // ==========================================================

  return {

    downloading,

    completed,

    error,

    phase,

    manifest,

    subjectsDownloaded,

    topicsDownloaded,

    questionsDownloaded,

    learningDownloaded,

    downloadedTotal,

    total,

    percentage,

    startDownload,

  }
}