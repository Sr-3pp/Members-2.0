// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  app: {
    head: {
      title: "Members Directory",
      htmlAttrs: {
        lang: "en",
      },
    },
  },

  runtimeConfig: {
    betterAuthSecret: "",
    betterAuthUrl: "",
    mongodbUri: process.env.MONGODB_URI || "",
    public: {
      // Base URL of the main ICCN site the navbar marketing links point to.
      // Override with NUXT_PUBLIC_MAIN_SITE_URL.
      mainSiteUrl: "https://www.internationalccn.org",
    },
  },

  colorMode: {
    preference: "dark",
    fallback: "dark",
    storageKey: "app-color-mode",
  },

  modules: [
    "@nuxt/a11y",
    "@nuxt/eslint",
    "@nuxt/hints",
    "@nuxt/image",
    "@nuxt/scripts",
    "@nuxt/test-utils",
    "@nuxt/ui",
    "@nuxtjs/google-fonts",
    "@vueuse/nuxt",
  ],

  googleFonts: {
    families: {
      Raleway: [300, 400, 500, 600, 700],
    },
    display: "swap",
    preload: true,
    download: true,
  },

  css: ["@/assets/css/main.css"],

  // Country flags are downloaded once and kept on disk (see server/api/flags).
  nitro: {
    storage: { flags: { driver: "fs", base: "./.data/flags" } },
    devStorage: { flags: { driver: "fs", base: "./.data/flags" } },
  },
});