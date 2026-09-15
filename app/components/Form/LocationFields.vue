<script setup lang="ts">
const { options: countryOptions, loading: loadingCountries } = useCountries();

const countryCode = defineModel<string>("countryCode", { required: true });
const city = defineModel<string>("city", { required: true });
const nationality = defineModel<string>("nationality", { required: true });
</script>

<template>
  <fieldset class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <UFormField label="Country" name="countryCode" required>
      <USelectMenu
        v-model="countryCode"
        class="w-full"
        :items="countryOptions"
        :loading="loadingCountries"
        value-key="value"
        placeholder="Select a country"
      />
    </UFormField>

    <UFormField label="City" name="city">
      <UInput v-model="city" placeholder="CDMX" />
    </UFormField>

    <UFormField label="Nationality" name="nationality">
      <UInput v-model="nationality" placeholder="Mexican" />
    </UFormField>

    <!-- Extra location-related fields, such as languages. -->
    <slot />
  </fieldset>
</template>
