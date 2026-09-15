<script setup lang="ts">
import type { SocialLinks } from "~~/shared/types/entities";

// The form state owns this object; fields are edited in place.
const social = defineModel<Required<SocialLinks>>({ required: true });
</script>

<template>
  <h2 class="text-base font-semibold mb-3">Social</h2>
  <fieldset class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <UFormField label="Website" name="social.website">
      <UInput v-model="social.website" placeholder="https://..." />
    </UFormField>

    <UFormField label="Facebook" name="social.fb">
      <UInput v-model="social.fb" placeholder="facebook.com/..." />
    </UFormField>

    <UFormField label="Twitter/X" name="social.tw">
      <UInput v-model="social.tw" placeholder="x.com/..." />
    </UFormField>

    <UFormField label="LinkedIn" name="social.in">
      <UInput v-model="social.in" placeholder="linkedin.com/in/..." />
    </UFormField>
  </fieldset>
</template>
