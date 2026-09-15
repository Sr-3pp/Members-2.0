<script setup lang="ts">
import type { MemberCategory } from "~~/shared/utils/categories";
import type { Member } from "~~/shared/types/entities";

const wizard = ref<HTMLElement | null>(null);

const scrollToWizard = () => {
  wizard.value?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const searchMembers = ref<Member[]>([]);
const searchCategory = ref<MemberCategory>();

const setMembers = (members: Member[], filters: { category?: MemberCategory }) => {
  searchMembers.value = members;
  searchCategory.value = filters.category;
};
</script>

<template>
  <div>
    <Parallax image="/img/parallax-bg.png">
      <UContainer class="flex flex-col justify-center gap-10">
        <h1 class="font-bold text-2xl md:text-3xl text-center">
          Ingresa los datos del miembro ICCN para iniciar la búsqueda
        </h1>
        <MainMap />

        <SearchForm @results="setMembers" />
      </UContainer>
    </Parallax>
    <section ref="wizard" class="bg-inverted">
      <SearchWizzard
        :members="searchMembers"
        :member-category="searchCategory"
        @scroll-wizzard="scrollToWizard"
      />
    </section>
  </div>
</template>
