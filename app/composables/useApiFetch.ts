// ~/composables/useApiFetch.ts
import { createFetch } from "ofetch"
import { isTauri } from "@tauri-apps/api/core"

type FetchOptions<T> = Parameters<typeof $fetch<T>>[1]

// Created once and reused. Loaded lazily so SSR and the plain browser never touch the plugin.
let tauriClient: typeof $fetch | null = null

async function getClient(): Promise<typeof $fetch> {
  if (import.meta.client && isTauri()) {
    if (!tauriClient) {
      const { fetch: tauriFetch } = await import("@tauri-apps/plugin-http")
      tauriClient = createFetch({ fetch: tauriFetch as unknown as typeof fetch }) as unknown as typeof $fetch
    }
    return tauriClient
  }
  return $fetch
}

export async function useApiFetch<T = any>(
  url: string,
  options: FetchOptions<T> = {}
) {
  const config = useRuntimeConfig()
  const inTauri = import.meta.client && isTauri()

  // Only needed on the server, to forward the user's cookie during SSR
  const serverHeaders = import.meta.server ? useRequestHeaders(["cookie"]) : {}

  try {
    const client = await getClient()

    const data = await client<T>(url, {
      baseURL: config.public.apiUrl,
      timeout: 30000,
      retry: 0,

      // Tauri's HTTP plugin runs in Rust and has no browser cookie jar,
      // so "include" only matters in the browser
      ...(inTauri ? {} : { credentials: "include" as const }),

      // options first, so the merged headers below are not overwritten by options.headers
      ...options,

      headers: {
        ...serverHeaders,
        ...((options.headers as Record<string, string>) || {}),
      },
    } as any)

    return {
      success: true,
      data: data as T,
      message: null,
      status: 200,
      error: null,
    }
  } catch (error: any) {
    console.error("API ERROR:", url, error)

    return {
      success: false,
      data: null,
      status: error?.status || error?.statusCode || 500,
      message:
        error?.data?.message ||
        error?.statusMessage ||
        error?.message ||
        "Request failed",
      error,
    }
  }
}