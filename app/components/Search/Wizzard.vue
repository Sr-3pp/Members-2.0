<script setup lang="ts">
import { searchCategoryOptions, type MemberCategory, type SearchCategory } from "~~/shared/utils/categories";
import type { Member, ProgramWithEnterprise } from "~~/shared/types/entities";

const { searchByCategory } = useEntitySearch();
const { loading, run } = useLatestRequest();

// USelectMenu reserves the empty string for "no selection" and throws on an item
// that uses it, so the catch-all entry needs a real value of its own.
const ALL_COUNTRIES = "all";
const { options: countryOptions } = useCountries();
const countryItems = computed(() => [
  { label: "Todos los países", value: ALL_COUNTRIES },
  ...countryOptions.value,
]);

const props = withDefaults(defineProps<{
  members?: Member[];
  memberCategory?: MemberCategory;
}>(), {
  members: () => [],
  memberCategory: undefined,
});

const emit = defineEmits<{
  "scroll-wizzard": [];
}>();

const searching = ref(false);
const categoriesCompact = ref(false);

const onResultsEntered = () => {
  categoriesCompact.value = true;
  emit("scroll-wizzard");
};
const searchResults = ref<EntitySearchResult[]>([]);
const currentCategory = ref<SearchCategory | null>(null);
const filters = reactive({ name: "", country: ALL_COUNTRIES });

const runSearch = async () => {
  const category = currentCategory.value;
  if (!category) return;

  const results = await run(() =>
    searchByCategory(category, {
      name: filters.name,
      country: filters.country === ALL_COUNTRIES ? "" : filters.country,
    }),
  );
  if (results) searchResults.value = results;
};

const searchFor = async (value: SearchCategory) => {
  searching.value = true;
  currentCategory.value = value;
  filters.name = "";
  filters.country = ALL_COUNTRIES;
  await runSearch();
};

watchDebounced(
  [() => filters.name, () => filters.country],
  runSearch,
  { debounce: 300 },
);

const stopSearching = (): void => {
  searching.value = false;
};

watch(
  () => [props.members, props.memberCategory] as const,
  ([newMembers, memberCategory]) => {
    searchResults.value = newMembers;
    currentCategory.value = memberCategory ?? "consultor";
    searching.value = true;
  },
);
</script>

<template>
  <UContainer class="search-wizzard">
    <Transition
      name="fade-height"
      @after-enter="onResultsEntered"
      @after-leave="categoriesCompact = false"
    >
      <div v-if="searching" class="results-collapse py-4 sm:py-6">
        <div class="min-h-0 overflow-hidden">
          <div class="min-h-[60dvh] flex flex-col gap-6">
            <div class="relative">
              <h3 class="text-center text-2xl text-inverted">
                Conoce a nuestros miembros ICCN
              </h3>
              <form
                class="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6"
                @submit.prevent="runSearch"
              >
                <p class="text-inverted my-auto">
                  Busca un miembro ICCN:
                </p>
                <UFormField label="Nombre" :ui="invertedFormField">
                  <UInput
                    v-model="filters.name"
                    variant="inverted"
                    color="secondary"
                    :loading="loading"
                    placeholder="Nombre, apellido o folio"
                    aria-label="Buscar por nombre"
                  />
                </UFormField>
                <UFormField label="País" :ui="invertedFormField">
                  <USelectMenu
                    v-model="filters.country"
                    variant="inverted"
                    color="secondary"
                    :items="countryItems"
                    value-key="value"
                    aria-label="Filtrar por país"
                  />
                </UFormField>
              </form>
              <UButton
                color="secondary"
                variant="ghost"
                icon="lucide-chevron-left"
                class="sm:absolute top-0 right-0"
                @click="stopSearching"
              >
                Regresar
              </UButton>
            </div>

            <USeparator class="my-4 sm:my-8" />

            <ul
              v-if="searchResults.length"
              class="grid grid-cols-1 sm:grid-cols-2 gap-6"
            >
              <li
                v-for="instance in searchResults"
                :key="`search-result-${instance._id}`"
              >
                <SearchCard
                  :category="currentCategory || 'enterprise'"
                  :member="
                    currentCategory !== 'enterprise' && currentCategory !== 'programs'
                      ? (instance as Member)
                      : undefined
                  "
                  :enterprise="
                    currentCategory === 'enterprise'
                      ? (instance as Enterprise)
                      : undefined
                  "
                  :program="
                    currentCategory === 'programs'
                      ? (instance as ProgramWithEnterprise)
                      : undefined
                  "
                />
              </li>
            </ul>
            <div v-else class="flex flex-col items-center justify-center h-full">
              <UIcon name="tabler-error-404-off" class="size-40" />
              <p class="text-4xl font-bold">No Members found</p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
    <ul class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
      <li v-for="item in searchCategoryOptions" :key="`search-item-${item.value}`">
        <button
          class="flex w-full flex-col gap-4 items-center cursor-pointer transition-all duration-300 hover:transformY-1 hover:scale-105"
          @click="searchFor(item.value)"
        >
          <CategoryIcon
            class="category-button-icon mx-auto transition-all duration-300"
            :class="{'w-1/2': categoriesCompact, 'w-full': !categoriesCompact, 'ring-2 ring-secondary scale-105': currentCategory === item.value}"
            :category="item.value"
          />
          <span class="text-inverted">{{ item.label }}</span>
        </button>
      </li>
    </ul>
  </UContainer>
</template>

<style scoped>
.search-wizzard {
  --wizard-transition-duration: 300ms;
}

.results-collapse {
  display: grid;
  grid-template-rows: 1fr;
}

.category-button-icon {
  transition: width var(--wizard-transition-duration) ease;
}

.fade-height-enter-active,
.fade-height-leave-active {
  transition:
    grid-template-rows var(--wizard-transition-duration) ease,
    opacity var(--wizard-transition-duration) ease;
  overflow: hidden;
}

.fade-height-enter-from,
.fade-height-leave-to {
  grid-template-rows: 0fr;
  opacity: 0;
}

.fade-height-enter-to,
.fade-height-leave-from {
  grid-template-rows: 1fr;
  opacity: 1;
}
</style>
