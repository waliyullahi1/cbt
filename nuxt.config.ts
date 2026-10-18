// import tailwindcss from "@tailwindcss/vite"




// export default defineNuxtConfig({
//   // ...everything else unchanged
//  compatibilityDate: "2025-07-15",

//   devtools: {
//     enabled: false,
//   },

//   modules: [
//     "@nuxt/icon",
//     "@nuxt/fonts",
//     "@nuxt/ui",
//   ],

//   ssr: false,

//   nitro: {
//     preset: "static",
//   },

//   css: [
//     "~/assets/css/main.css",
//   ],
//   devServer: {
//     host: "0.0.0.0",
//     port: 3000,
//   },

//   vite: {
//     plugins: [tailwindcss()],
//     clearScreen: false,
//     envPrefix: ["VITE_", "TAURI_"],
//     server: {
//       strictPort: true,
//       watch: { usePolling: true, interval: 500 },
//     },
//   },

//   app: {
//     baseURL: process.env.NODE_ENV === "production" ? "./" : "/",
//     pageTransition: { name: "page-sheet", mode: "out-in" },
//   },



//    icon: {
//     provider: "none",

//     clientBundle: {
//       scan: true,
//       includeCustomCollections: true,
//     },
//   },

//   app: {
//     baseURL: "./",

//     pageTransition: {
//       name: "page-sheet",
//       mode: "out-in",
//     },
//   },

//   runtimeConfig: {
//     mapboxSecret: process.env.MAPBOX_SECRET || "",
//     geminiApiKey: process.env.GEMINI_API_KEY || "",

//     public: {
//       projectName: "cbt lesson",

//       apiUrl:
//         process.env.NUXT_PUBLIC_API_URL ||
//         "https://www.api.examtips.abanise.com",
//     },
//   },

//   ignore: ["**/src-tauri/**"],
// })


import tailwindcss from "@tailwindcss/vite"

const host = process.env.TAURI_DEV_HOST

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",

  devtools: { enabled: false },

  modules: ["@nuxt/icon", "@nuxt/fonts", "@nuxt/ui"],

  ssr: false,

  nitro: { preset: "static" },

  css: ["~/assets/css/main.css"],
  app: {
    head: {
      meta: [
        {
          name: "viewport",
          // viewport-fit=cover is required for env(safe-area-inset-*) to work
          content: "width=device-width, initial-scale=1, viewport-fit=cover",
        },
      ],
    },
  },

 devServer: {
    host: "0.0.0.0",
    port: 3000,
  },

  vite: {
    plugins: [tailwindcss()],
    clearScreen: false,
    envPrefix: ["VITE_", "TAURI_"],
    server: {
      strictPort: true,
      ws: {
        protocol: "ws",
          host: "0.0.0.0",
        clientPort: 3000,   // go through the dev server itself, no extra port
      },
    },
    optimizeDeps: {
      // Scan all your .vue files at startup so every dependency is found
      // up front (remove this line if startup gets slower or errors)
      entries: ["**/*.vue"],
      include: [
        "dompurify",
        "@meforma/vue-toaster",
        "@tauri-apps/api/core",
        "@tauri-apps/api/window",
        "@tauri-apps/api/app",
        "@tauri-apps/api/path",
        "@tauri-apps/plugin-store",
        "@tauri-apps/plugin-fs",
        "@tauri-apps/plugin-sql",
        "tauri-plugin-keyring-store-api",
      ],
    },
  },

  // One app block only. "./" is needed for the built app, but "/" is
  // safer while developing so hot reload can find its files.
  app: {
    baseURL: process.env.NODE_ENV === "production" ? "./" : "/",
    pageTransition: { name: "page-sheet", mode: "out-in" },
  },

  icon: {
    provider: "none",
    clientBundle: {
      scan: true,
      includeCustomCollections: true,
    },
  },

  runtimeConfig: {
    mapboxSecret: process.env.MAPBOX_SECRET || "",
    geminiApiKey: process.env.GEMINI_API_KEY || "",

    public: {
      projectName: " C lesson",
      apiUrl: 'http://localhost:5000'
        // "https://www.api.examtips.abanise.com",
    },
  },

  ignore: ["**/src-tauri/**"],
})
