<script lang="ts" setup>
import type { FormSubmitEvent } from "@nuxt/ui/runtime/types/form.js";
import * as v from "valibot";
import { memberCategoryOptions, memberCategorySlugs } from "~~/shared/utils/categories";

const { options: countryItems, loading: loadingCountries, find: findCountry } = useCountries();

const schema = v.object({
  name: v.pipe(
    v.string(),
    v.trim(),
    v.maxLength(100, "Search text must be 100 characters or fewer"),
  ),
  country: v.optional(v.pipe(v.string(), v.check((code) => !!findCountry(code), "Select a valid country"))),
  category: v.optional(v.picklist(memberCategorySlugs, "Select a valid category")),
});

type SearchFormData = v.InferOutput<typeof schema>;

const state = reactive<v.InferInput<typeof schema>>({
  name: "",
  country: undefined,
  category: undefined,
});

// Searching happens in the wizard below, which pages the results; the form only
// reports what to search for.
const emit = defineEmits<{
  search: [filters: EntitySearchRequest];
}>();

const handleSubmit = (event: FormSubmitEvent<SearchFormData>) => {
  emit("search", event.data);
};
</script>

<template>
  <UForm
    class="flex-row flex-wrap sm:flex-nowrap gap-4 items-center"
    :schema="schema"
    :state="state"
    @submit="handleSubmit"
  >
    <UFormField label="Name / Last Name / Folio" name="name" class="basis-full sm:basis-1/3">
      <UInput
        v-model="state.name"
        class="w-full"
        color="secondary"
        aria-label="Name, last name, or folio"
      />
    </UFormField>
    <UFormField label="Select Country" name="country" class="basis-full sm:basis-1/3">
      <USelectMenu
        v-model="state.country"
        name="country"
        color="secondary"
        class="w-full"
        :items="countryItems"
        :loading="loadingCountries"
        value-key="value"
        :ui="{ placeholder: 'text-gray-200' }"
      />
    </UFormField>
    <UFormField label="Select Category" name="category" class="basis-full sm:basis-1/3">
      <USelect
        v-model="state.category"
        class="w-full"
        color="secondary"
        :items="memberCategoryOptions"
        :ui="{ placeholder: 'text-gray-200' }"
      />
    </UFormField>
    <UButton
      color="secondary"
      type="submit"
    >
      Buscar
    </UButton>
  </UForm>
</template>
