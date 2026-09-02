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
    mongodbUri: process.env.MONGODB_URI || "",
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
    "@vueuse/nuxt",
  ],

  css: ["@/assets/css/main.css"],
});