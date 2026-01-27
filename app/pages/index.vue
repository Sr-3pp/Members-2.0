<script setup lang="ts">
import countries from "~~/data/countries.json";
import categories from "~~/data/categories.json";

const wizzard = ref<HTMLElement | null>(null);

const countryItems = countries.map((country) => ({
  value: country.code,
  label: country.label,
}));

const categoryItems = categories.map((category) => ({
  value: category.slug,
  label: category.name,
}));

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

      <div
        ref="wizzard"
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full"
      >
        <UFormField>
          <UInput class="w-full" placeholder="Name / Last Name / Folio" />
        </UFormField>
        <UFormField>
          <USelectMenu
            class="w-full"
            placeholder="Search country"
            :items="countryItems"
          />
        </UFormField>
        <UFormField>
          <USelect
            class="w-full"
            placeholder="Select Category"
            :items="categoryItems"
            aria-label="Select Category"
          />
        </UFormField>
        <div class="flex justify-center items-end">
          <UButton color="primary"> Search </UButton>
        </div>
      </div>
    </UContainer>
  </section>
  <section class="dark:bg-gray-600 bg-gray-100">
    <SearchWizzard @scroll-wizzard="scrollToWizard" :categories="categories" />
  </section>
</template>
