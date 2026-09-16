<script setup lang="ts">
import { searchCategoryOptions, type SearchCategory } from "~~/shared/utils/categories";
import type { Enterprise, Member, ProgramWithEnterprise } from "~~/shared/types/entities";

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

const emit = defineEmits<{
  "scroll-wizzard": [];
}>();

const searching = ref(false);
const categoriesCompact = ref(false);

const onResultsEntered = () => {
  categoriesCompact.value = true;
  emit("scroll-wizzard");
};

// The server pages the results: the list holds every page fetched so far and
// `total` says how many rows match in all, which is what "Ver más" keys off.
const searchResults = ref<EntitySearchResult[]>([]);
const totalResults = ref(0);
const hasMoreResults = computed(
  () => searchResults.value.length < totalResults.value,
);

// The landing form can search members of every category at once; those show
// under the first member category while the request carries no category filter.
const searchTarget = ref<EntitySearchTarget | null>(null);
const currentCategory = computed<SearchCategory | null>(() =>
  searchTarget.value === "members" ? "consultor" : searchTarget.value,
);
const filters = reactive({ name: "", country: ALL_COUNTRIES });

// What was last sent to the server. A category click or a landing-form search
// resets the filters and runs its own request, so the debounced filter watcher
// only fires for edits the user typed in.
let lastSearched = "";
const searchSignature = () =>
  JSON.stringify([searchTarget.value, filters.name, filters.country]);

const runSearch = async ({ append = false } = {}) => {
  const target = searchTarget.value;
  if (!target) return;
  lastSearched = searchSignature();

  const page = await run(() =>
    searchByCategory(target, {
      name: filters.name,
      country: filters.country === ALL_COUNTRIES ? "" : filters.country,
      skip: append ? searchResults.value.length : 0,
      limit: SEARCH_PAGE_SIZE,
    }),
  );
  if (!page) return;

  if (!append) {
    searchResults.value = page.items;
    totalResults.value = page.total;
    return;
  }
  // A row added or removed between two requests shifts the offset, so drop
  // anything already on screen, and stop offering more once a page comes back empty.
  const shown = new Set(searchResults.value.map((item) => item._id));
  searchResults.value.push(...page.items.filter((item) => !shown.has(item._id)));
  totalResults.value = page.items.length ? page.total : searchResults.value.length;
};

const showMore = () => runSearch({ append: true });

/** Starts a fresh search against `target` with the given filters and shows the results. */
const startSearch = async (
  target: EntitySearchTarget,
  { name = "", country = "" }: Pick<EntitySearchRequest, "name" | "country"> = {},
) => {
  searching.value = true;
  searchTarget.value = target;
  filters.name = name;
  filters.country = country || ALL_COUNTRIES;
  await runSearch();
};

const searchFor = (value: SearchCategory) => startSearch(value);

// Lets the page hand over a landing-form submission as a plain method call.
defineExpose({
  search: ({ category, ...rest }: EntitySearchRequest) => startSearch(category ?? "members", rest),
});

watchDebounced(
  [() => filters.name, () => filters.country],
  () => {
    if (searchSignature() !== lastSearched) runSearch();
  },
  { debounce: 300 },
);

const stopSearching = (): void => {
  searching.value = false;
};
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
                @submit.prevent="runSearch()"
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
              data-testid="search-results"
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
            <div v-if="hasMoreResults" class="flex justify-center">
              <UButton
                color="secondary"
                variant="outline"
                icon="lucide-chevron-down"
                :loading="loading"
                @click="showMore"
              >
                Ver más
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </Transition>
    <ul class="grid grid-cols-3 md:grid-cols-6 gap-6">
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
