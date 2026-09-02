<script setup lang="ts">
import categories from "~~/data/categories.json";
import type { Member } from "~~/shared/types/entities";

const wizard = ref<HTMLElement | null>(null);

const scrollToWizard = () => {
  wizard.value?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const searchMembers = ref<Member[]>([]);
const searchCategory = ref<string>();

const setMembers = (members: Member[], filters: { category?: string }) => {
  searchMembers.value = members;
  searchCategory.value = filters.category;
};
</script>

<template>
  <div>
    <Parallax image="/img/parallax-bg.png">
      <UContainer class="flex flex-col justify-center gap-10">
        <h1 class="font-bold text-xl text-center">Look for a member</h1>
        <NuxtImg
          class="w-full sm:w-2/3 mx-auto"
          src="/img/main-map.png"
          alt="main map"
        />

        <SearchForm @results="setMembers" />
      </UContainer>
    </Parallax>
    <section ref="wizard" class="bg-inverted">
      <SearchWizzard
        :categories="categories"
        :members="searchMembers"
        :member-category="searchCategory"
        @scroll-wizzard="scrollToWizard"
      />
    </section>
  </div>
</template>
