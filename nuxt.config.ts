
import tailwindcss from "@tailwindcss/vite";

const host = process.env.TAURI_DEV_HOST;
const isTauriBuild = Boolean(process.env.TAURI_ENV_PLATFORM);

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",

  devtools: {
    enabled: false,
  },

  modules: [
    "@nuxt/icon",
    "@vite-pwa/nuxt",
    "@nuxt/fonts",
    "@nuxt/ui",
  ],

  ssr: false,

  nitro: {
    preset: "static",
  },

  css: [
    "~/assets/css/main.css",
    "katex/dist/katex.min.css",
  ],

  // --------------------------------------------------
  // PWA CONFIGURATION
  // --------------------------------------------------

  pwa: {
    registerType: "autoUpdate",

    manifest: {
      id: "/",
      name: "ExamTips",
      short_name: "ExamTips",
      description:
        "Prepare for JAMB, WAEC and NECO examinations.",

      start_url: "/",
      scope: "/",
      display: "standalone",
      orientation: "portrait",

      background_color: "#ffffff",
      theme_color: "#1F319D",

      icons: [
        {
          src: "/pwa-192x192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "/pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "/pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
    },

    workbox: {
      globPatterns: [
        "**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,avif,woff,woff2,ttf,webmanifest,db}",
      ],

      maximumFileSizeToCacheInBytes:
        50 * 1024 * 1024,

      cleanupOutdatedCaches: true,

      skipWaiting: true,

      clientsClaim: true,

      navigateFallback: "/",

      navigateFallbackDenylist: [
        /^\/api\//,
      ],

      runtimeCaching: [
        // Local and remote images.
        {
          urlPattern: ({ request }) =>
            request.destination === "image",

          handler: "CacheFirst",

          options: {
            cacheName: "examtips-images",

            expiration: {
              maxEntries: 300,
              maxAgeSeconds: 60 * 60 * 24 * 365,
            },

            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },

        // Fonts.
        {
          urlPattern: ({ request }) =>
            request.destination === "font",

          handler: "CacheFirst",

          options: {
            cacheName: "examtips-fonts",

            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24 * 365,
            },

            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },

        // Bundled SQLite databases.
        {
          urlPattern: ({ url }) =>
            url.origin === self.location.origin &&
            url.pathname.startsWith("/db/") &&
            url.pathname.endsWith(".db"),

          handler: "CacheFirst",

          options: {
            cacheName: "examtips-databases",

            cacheableResponse: {
              statuses: [200],
            },
          },
        },
      ],
    },
  },

  // --------------------------------------------------
  // APP CONFIGURATION
  // --------------------------------------------------

  app: {
    // Tauri uses relative paths.
    // Hosted website uses root paths.
    baseURL: isTauriBuild ? "./" : "/",

    pageTransition: {
      name: "page-sheet",
      mode: "out-in",
    },

    head: {
      title: "ExamTips",
      titleTemplate: "%s | ExamTips",

      htmlAttrs: {
        lang: "en",
      },

      meta: [
        {
          charset: "utf-8",
        },
        {
          name: "viewport",
          content:
            "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover",
        },
        {
          name: "theme-color",
          content: "#1F319D",
        },
        {
          name: "description",
          content:
            "Prepare for JAMB and WAEC with ExamTips. Practise past questions, take CBT mock exams, and study exam-focused lessons.",
        },
      ],

      link: [
        {
          rel: "icon",
          type: "image/png",
          href: "/image/pwa-192x192.png",
        },
        {
          rel: "apple-touch-icon",
          href: "/image/pwa-512x512.png",
        },
        {
          rel: "manifest",
          href: "/manifest.webmanifest",
        },
      ],
    },
  },

  // --------------------------------------------------
  // DEVELOPMENT SERVER
  // --------------------------------------------------

  devServer: {
    host: "0.0.0.0",
    port: 3000,
  },

  // --------------------------------------------------
  // VITE CONFIGURATION
  // --------------------------------------------------

  vite: {
    plugins: [
      tailwindcss(),
    ],

    clearScreen: false,

    envPrefix: [
      "VITE_",
      "TAURI_",
    ],

    server: {
      host: "0.0.0.0",
      strictPort: true,

      watch: {
        usePolling: true,
        interval: 500,
      },

      hmr: host
        ? {
            protocol: "ws",
            host,
            clientPort: 3000,
          }
        : undefined,
    },

    optimizeDeps: {
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

  // --------------------------------------------------
  // ICON CONFIGURATION
  // --------------------------------------------------

  icon: {
    provider: "none",

    clientBundle: {
      scan: true,
      includeCustomCollections: true,
    },
  },

  // --------------------------------------------------
  // SEO CONFIGURATION
  // --------------------------------------------------

  site: {
    url: "https://www.examtips.abanise.com",
    name: "ExamTips",
  },

  // --------------------------------------------------
  // ENVIRONMENT VARIABLES
  // --------------------------------------------------

  runtimeConfig: {
    mapboxSecret: process.env.MAPBOX_SECRET || "",
    geminiApiKey: process.env.GEMINI_API_KEY || "",

    public: {
      projectName: "ExamTips",

      apiUrl:
        process.env.NUXT_PUBLIC_API_URL ||
        "https://www.api.examtips.abanise.com",
    },
  },

  ignore: [
    "**/src-tauri/**",
  ],
});
