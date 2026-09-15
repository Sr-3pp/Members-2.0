<script lang="ts" setup>
import type { FormSubmitEvent } from "@nuxt/ui/runtime/types/form.js";
import * as v from "valibot";
import { memberCategoryOptions, memberCategorySlugs } from "~~/shared/utils/categories";
import type { Member } from "~~/shared/types/entities";

const { searchMember } = useMembers();
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

export type SearchFormData = v.InferOutput<typeof schema>;

const state = reactive<v.InferInput<typeof schema>>({
  name: "",
  country: undefined,
  category: undefined,
});

const emit = defineEmits<{
  results: [members: Member[], filters: SearchFormData];
}>();

const searching = ref(false);

const handleSubmit = async (event: FormSubmitEvent<SearchFormData>) => {
  searching.value = true;
  try {
    const results = await searchMember(event.data);
    emit("results", results, event.data);
  } finally {
    searching.value = false;
  }
};
</script>

<template>
  <UForm
    class="flex-row gap-4 items-center"
    :schema="schema"
    :state="state"
    @submit="handleSubmit"
  >
    <UFormField label="Name / Last Name / Folio" name="name" class="sm:basis-1/3">
      <UInput
        v-model="state.name"
        class="w-full"
        color="secondary"
        aria-label="Name, last name, or folio"
      />
    </UFormField>
    <UFormField label="Select Country" name="country" class="sm:basis-1/3">
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
    <UFormField label="Select Category" name="category" class="sm:basis-1/3">
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
      :loading="searching"
    >
      Buscar
    </UButton>
  </UForm>
</template>
