// composables/useOpenExternal.ts
//
// Opens a web page in the user's default browser.
//  - inside the Tauri app (desktop + mobile) it uses the opener plugin
//  - in a normal browser (npm run dev) it falls back to window.open
//
// Usage in any component (Nuxt auto-imports it):
//   const { openExternal } = useOpenExternal()
//   <button @click="openExternal('https://your-website.com/pay')">Pay ₦4,000.00</button>

export const useOpenExternal = () => {
  const openExternal = async (url: string) => {
    if (!url) return

    try {
      if (import.meta.client && (window as any).__TAURI_INTERNALS__) {
        const { openUrl } = await import("@tauri-apps/plugin-opener")
        await openUrl(url)
        return
      }
    } catch (error) {
      console.error("Tauri could not open the link, using the browser instead:", error)
    }

    if (import.meta.client) {
      window.open(url, "_blank", "noopener,noreferrer")
    }
  }

  return { openExternal }
}