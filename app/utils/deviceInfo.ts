import { isTauri } from "@tauri-apps/api/core"

export type AppPlatform = "windows" | "macos" | "linux" | "android" | "ios" | "web"

export async function getPlatform(): Promise<AppPlatform> {
  if (!import.meta.client || !isTauri()) return "web"

  const { platform } = await import("@tauri-apps/plugin-os")
  const os = platform() // "windows" | "macos" | "linux" | "android" | "ios" | ...

  if (os === "windows" || os === "macos" || os === "linux" || os === "android" || os === "ios") {
    return os
  }
  return "linux" // other Unix systems, treated as Linux
}

export async function getAppVersion(): Promise<string> {
  if (!import.meta.client || !isTauri()) return "1.0.0"

  const { getVersion } = await import("@tauri-apps/api/app")
  return await getVersion() // reads the version from tauri.conf.json
}