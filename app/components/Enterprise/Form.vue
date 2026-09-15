<script setup lang="ts">
import type { Enterprise } from "~~/shared/types/entities";

const props = defineProps<{ initial?: Enterprise }>();
const emit = defineEmits<{ submitted: []; cancel: [] }>();
const { form, schema, submitting, onSubmit, onPickPicture } =
  useEnterpriseForm(props.initial, () => emit("submitted"));
</script>

<template>
  <UForm
    :schema="schema"
    :state="form"
    @submit="onSubmit"
    @error="console.log('Form errors', $event)"
  >
    <fieldset class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <UFormField class="w-full" label="Folio" name="folio" required>
        <UInput v-model="form.folio" placeholder="FOLIO1234" />
      </UFormField>
      <FormStatusSwitch v-model="form.status" :disabled="submitting" />
    </fieldset>

    <fieldset class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <UFormField label="Name" name="name" required>
        <UInput v-model="form.name" placeholder="Enterprise name" />
      </UFormField>

      <UFormField label="Phone" name="phone" required>
        <UInput v-model="form.phone" placeholder="55 1234 5678" />
      </UFormField>

      <FormImageField required @change="onPickPicture" />
    </fieldset>

    <FormLocationFields
      v-model:country-code="form.countryCode"
      v-model:city="form.city"
      v-model:nationality="form.nationality"
    />

    <fieldset class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UFormField label="Description" name="description" required>
        <UTextarea
          v-model="form.description"
          :rows="5"
          placeholder="What the enterprise does"
        />
      </UFormField>
      <UFormField label="Resume" name="resume" required>
        <UTextarea
          v-model="form.resume"
          :rows="5"
          placeholder="Short bio / summary..."
        />
      </UFormField>
    </fieldset>

    <FormSocialFields v-model="form.social" />

    <FormSkillsFields :skills="form.skills" />

    <FormActions
      :submitting="submitting"
      :submit-label="initial ? 'Update enterprise' : 'Create enterprise'"
      @cancel="emit('cancel')"
    />
  </UForm>
</template>
