import { isTauri } from "@tauri-apps/api/core"

const WEB_KEY = "app-state"

let store = null

// Tauri app only: the plugin is loaded on demand, so it never runs in a browser
async function getStore() {
  if (!store) {
    const { Store } = await import("@tauri-apps/plugin-store")
    store = await Store.load("app-state.json")
  }

  return store
}

export async function loadSettings() {
  if (isTauri()) {
    const tauriStore = await getStore()
    return await tauriStore.get("state")
  }

  // Browser
  try {
    const raw = localStorage.getItem(WEB_KEY)
    return raw === null ? undefined : JSON.parse(raw)
  } catch {
    return undefined
  }
}

export async function saveSettings(data) {
  if (isTauri()) {
    const tauriStore = await getStore()
    await tauriStore.set("state", data)
    await tauriStore.save()
    return
  }

  // Browser
  try {
    localStorage.setItem(WEB_KEY, JSON.stringify(data))
  } catch (error) {
    // storage full or blocked (for example private mode)
    console.warn("Could not save settings in the browser:", error)
  }
}