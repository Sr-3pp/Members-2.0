<script lang="ts" setup>
import type { FormSubmitEvent } from "@nuxt/ui";
import * as v from "valibot";
import countries from "~~/data/countries.json";
import categories from "~~/data/categories.json";
import type { Member } from "~~/shared/types/entities";

const { searchMember } = useMembers();

const countryItems = countries.map((country) => ({
  value: country.code,
  label: country.label,
}));

const categoryItems = categories.map((category) => ({
  value: category.slug,
  label: category.name,
}));

const countryCodes = countries.map((country) => country.code);
const categorySlugs = categories.map((category) => category.slug);

const schema = v.object({
  name: v.pipe(
    v.string(),
    v.trim(),
    v.maxLength(100, "Search text must be 100 characters or fewer"),
  ),
  country: v.optional(v.picklist(countryCodes, "Select a valid country")),
  category: v.optional(v.picklist(categorySlugs, "Select a valid category")),
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
    class="grid grid-cols-1 gap-4 w-full sm:grid-cols-2 md:grid-cols-4"
    :schema="schema"
    :state="state"
    @submit="handleSubmit"
  >
    <UFormField name="name">
      <UInput
        v-model="state.name"
        class="w-full"
        placeholder="Name / Last Name / Folio"
        aria-label="Name, last name, or folio"
      />
    </UFormField>
    <UFormField name="country">
      <USelectMenu
        v-model="state.country"
        name=""
        class="w-full"
        placeholder="Search country"
        aria-label="Country"
        :items="countryItems"
        value-key="value"
        :ui="{ placeholder: 'text-gray-200' }"
      />
    </UFormField>
    <UFormField name="category">
      <USelect
        v-model="state.category"
        class="w-full"
        placeholder="Select Category"
        :items="categoryItems"
        aria-label="Select Category"
        :ui="{ placeholder: 'text-gray-200' }"
      />
    </UFormField>
    <div class="flex justify-center items-end">
      <UButton
        color="neutral"
        type="submit"
        :loading="searching"
        class="bg-gray-100 text-gray-950 hover:bg-white"
      >
        Search
      </UButton>
    </div>
  </UForm>
</template>
