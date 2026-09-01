<script setup lang="ts">
import categories from "~~/data/categories.json";

const wizzard = ref<HTMLElement | null>(null);

const scrollToWizard = () => {
  wizzard.value?.scrollIntoView({ behavior: "smooth", block: "start" });
};
</script>

<template>
  <section>
    <UContainer class="flex flex-col justify-center gap-10 py-6">
      <h1 class="font-bold text-xl text-center">Look for a member</h1>
      <NuxtImg
        class="w-full sm:w-2/3 mx-auto"
        src="/img/main-map.png"
        alt="main map"
      />

      <SearchForm ref="wizzard" />
    </UContainer>
  </section>
  <section class="dark:bg-gray-600 bg-gray-100">
    <SearchWizzard @scroll-wizzard="scrollToWizard" :categories="categories" />
  </section>
</template>
