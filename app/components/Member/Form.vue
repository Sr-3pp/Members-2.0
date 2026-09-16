<script setup lang="ts">
import type { Member } from "~~/shared/types/entities";

const props = defineProps<{ initial?: Member }>();
const emit = defineEmits<{ submitted: []; cancel: [] }>();
const {
  form,
  schema,
  submitting,
  onSubmit,
  onPickPicture,
  languageOptions,
  categoryOptions,
  rangeOptions,
} = useMemberForm(props.initial, () => emit("submitted"));
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
        <UInput v-model="form.name" placeholder="John" />
      </UFormField>

      <UFormField label="Last name" name="last_name" required>
        <UInput v-model="form.last_name" placeholder="Doe" />
      </UFormField>

      <UFormField label="Email" name="email" required>
        <UInput
          v-model="form.email"
          type="email"
          placeholder="john@company.com"
        />
      </UFormField>

      <UFormField label="Membresia" name="range" required class="w-full">
        <USelect v-model="form.range" class="w-full" :items="rangeOptions" />
      </UFormField>

      <UFormField label="Phone" name="phone" required>
        <UInput v-model="form.phone" placeholder="55 1234 5678" />
      </UFormField>

      <UFormField label="Mobile" name="mobile">
        <UInput v-model="form.mobile" placeholder="55 9876 5432" />
      </UFormField>

      <FormImageField required @change="onPickPicture" />
    </fieldset>

    <FormLocationFields
      v-model:country-code="form.countryCode"
      v-model:city="form.city"
      v-model:nationality="form.nationality"
    >
      <UFormField label="Languages" name="languages">
        <USelectMenu
          v-model="form.languages"
          class="w-full"
          placeholder="Select a language"
          :items="languageOptions"
          multiple
          value-key="value"
          label-key="label"
        />
      </UFormField>
    </FormLocationFields>

    <fieldset class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UFormField label="Education" name="education" required>
        <UTextarea
          v-model="form.education"
          :rows="5"
          placeholder="Enter education"
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

    <UFormField 
      label="Categories"
      name="categories"
      :ui="{
        wrapper: 'w-full mb-4 static',
        label: 'w-full',
      }"
    >
      <UCheckboxGroup
        v-model="form.categories"
        :items="categoryOptions"
        value-key="value"
        variant="card"
        indicator="hidden"
        :ui="{
          fieldset: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4',
        }"
      >
        <template #label="{ item }">
          <span class="flex flex-col items-center gap-2 text-center">
            <CategoryIcon :category="item.value" class="mx-auto" />
            <span>{{ item.label }}</span>
          </span>
        </template>
      </UCheckboxGroup>
    </UFormField>

    <FormSkillsFields :skills="form.skills" />

    <FormActions
      :submitting="submitting"
      :submit-label="initial ? 'Update member' : 'Create member'"
      @cancel="emit('cancel')"
    />
  </UForm>
</template>
