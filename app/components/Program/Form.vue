<script setup lang="ts">
import type { Program } from "~~/shared/types/entities";

const props = defineProps<{ initial?: Program }>();
const emit = defineEmits<{ submitted: []; cancel: [] }>();
const {
  form,
  schema,
  submitting,
  onSubmit,
  onPickPhoto,
  enterpriseOptions,
  loadingEnterprises,
  loadEnterprises,
  memberOptions,
  loadingMembers,
  loadMembers,
} = useProgramForm(props.initial, () => emit("submitted"));
</script>

<template>
  <UForm
    :schema="schema"
    :state="form"
    @submit="onSubmit"
    @error="console.log('Form errors', $event)"
  >
    <FormStatusSwitch v-model="form.status" :disabled="submitting" />

    <fieldset class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <UFormField label="Title" name="title" required>
        <UInput
          v-model="form.title"
          placeholder="Advanced Leadership Training"
        />
      </UFormField>

      <UFormField label="Enterprise" name="enterpriseId">
        <USelectMenu
          v-model="form.enterpriseId"
          class="w-full"
          :items="enterpriseOptions"
          value-key="value"
          option-attribute="label"
          :loading="loadingEnterprises"
          searchable
          placeholder="Select an enterprise"
          @search="loadEnterprises"
        />
      </UFormField>

      <UFormField label="Length (days)" name="length" required>
        <UInput v-model.number="form.length" type="number" min="1" />
      </UFormField>

      <FormImageField
        label="Photo"
        name="photo"
        class="md:col-span-2"
        @change="onPickPhoto"
      />
    </fieldset>

    <UFormField label="Description" name="description">
      <UTextarea
        v-model="form.description"
        :rows="5"
        placeholder="Program description and objectives..."
      />
    </UFormField>

    <UFormField label="Participants" name="participants">
      <USelectMenu
        v-model="form.participants"
        class="w-full"
        :items="memberOptions"
        value-key="value"
        option-attribute="label"
        multiple
        searchable
        :loading="loadingMembers"
        placeholder="Search active members"
        @search="loadMembers"
      />
    </UFormField>

    <FormSkillsFields
      :skills="form.skills"
      title="Skills Covered"
      label="Skill"
    />

    <FormActions
      :submitting="submitting"
      :submit-label="initial ? 'Update program' : 'Create program'"
      @cancel="emit('cancel')"
    />
  </UForm>
</template>
