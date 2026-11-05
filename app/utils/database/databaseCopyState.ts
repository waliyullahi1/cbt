const copyFinishedKey = "cbt:database-copy-finished"

export let isCopyFinished = false

export function getIsCopyFinished(): boolean {
  if (isCopyFinished) {
    return true
  }

  try {
    isCopyFinished =
      typeof localStorage !== "undefined" &&
      localStorage.getItem(copyFinishedKey) === "1"
  } catch (error) {
    console.warn("[database bootstrap] could not read copy state", error)
  }

  return isCopyFinished
}

export function setCopyFinished(): void {
  isCopyFinished = true

  try {
    localStorage.setItem(copyFinishedKey, "1")
  } catch (error) {
    console.warn("[database bootstrap] could not persist copy state", error)
  }
}
