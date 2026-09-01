<script setup lang="ts">
import type { Enterprise } from "~~/server/models/Enterprise";
import type { Member } from "~~/server/models/Member";
import type { Program } from "~~/server/models/Program";

const { searchByCategory } = useMembers();
const { getEnterprises } = useEnterprise();
const { getPrograms } = useProgram();

const { categories } = defineProps<{
  categories: Array<{ slug: string; name: string; image?: string }>;
}>();

const serachItems = [
  ...categories,
  {
    slug: "enterprise",
    name: "Enterprises",
    image: "/img/categories/empresa.png",
  },
  { slug: "programs", name: "Programs", image: "/img/categories/programa.png" },
].map((item) => ({
  value: item.slug,
  label: item.name,
  img: item.image,
}));

const searching = ref(false);
type ProgramWithEnterprise = Program & { enterprise?: Enterprise | null };

const searchResults = ref<(Member | Enterprise | ProgramWithEnterprise)[]>([]);
const currentCategory = ref<
  | "enterprise"
  | "consultor"
  | "coach"
  | "capacitador"
  | "certificaciones-especiales"
  | "program"
  | null
>(null);

const searchFor = async (value: string) => {
  searching.value = true;
  if (value === "enterprise") {
    currentCategory.value = "enterprise";
    const { data } = await getEnterprises();
    searchResults.value = data.value as Enterprise[];
    return;
  }

  if (value === "programs") {
    currentCategory.value = "program";
    const { data } = await getPrograms();
    searchResults.value = data.value as ProgramWithEnterprise[];
    return;
  }
  currentCategory.value = value as
    | "consultor"
    | "coach"
    | "capacitador"
    | "certificaciones-especiales";
  searchResults.value = await searchByCategory(value);
};
</script>

<template>
  <UContainer class="py-6">
    <Transition name="fade-height" @after-enter="$emit('scroll-wizzard')">
      <div class="h-[60dvh] flex flex-col gap-6" v-if="searching">
        <UButton
          @click="searching = false"
          color="neutral"
          variant="outline"
          class="ml-auto"
        >
          Regresar
        </UButton>
        <ul
          v-if="searchResults.length"
          class="grid grid-cols-1 sm:grid-cols-2 gap-6"
        >
          <li v-for="instance in searchResults" :key="`search-result-${instance._id}`">
            <SearchCard
              :category="currentCategory || 'enterprise'"
              :member="
                currentCategory !== 'enterprise' && currentCategory !== 'program'
                  ? (instance as Member)
                  : undefined
              "
              :enterprise="
                currentCategory === 'enterprise'
                  ? (instance as Enterprise)
                  : undefined
              "
              :program="
                currentCategory === 'program'
                  ? (instance as ProgramWithEnterprise)
                  : undefined
              "
            />
          </li>
        </ul>
        <div class="flex flex-col items-center justify-center h-full" v-else>
          <UIcon name="tabler-error-404-off" class="size-40" />
          <p class="text-4xl font-bold">No Members found</p>
        </div>
      </div>
    </Transition>
    <ul class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
      <li v-for="item in serachItems" :key="`search-item-${item.value}`">
        <button
          class="flex flex-col gap-4 items-center"
          @click="searchFor(item.value)"
        >
          <NuxtImg
            class="transition-width duration-300"
            :class="searching ? 'w-1/2 m-auto' : 'w-full'"
            :src="item.img"
            alt=""
            aria-hidden="true"
          />
          <span>{{ item.label }}</span>
        </button>
      </li>
    </ul>
  </UContainer>
</template>

<style scoped>
.fade-height-enter-active,
.fade-height-leave-active {
  transition:
    max-height 250ms ease,
    opacity 200ms ease;
  overflow: hidden;
}

.fade-height-enter-from,
.fade-height-leave-to {
  max-height: 0;
  opacity: 0;
}

.fade-height-enter-to,
.fade-height-leave-from {
  max-height: calc(100vh - 10rem); /* pick a safe max */
  opacity: 1;
}
</style>
