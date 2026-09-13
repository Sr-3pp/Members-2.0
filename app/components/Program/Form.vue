<script setup lang="ts">
import type { Program } from "~~/shared/types/entities";

const props = defineProps<{ initial?: Program }>();
const emit = defineEmits<{ submitted: [] }>();
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
    <UFormField class="my-auto" name="status">
      <USwitch
        :model-value="form.status === 'active'"
        :label="form.status.charAt(0).toUpperCase() + form.status.slice(1)"
        :disabled="submitting"
        aria-label="Active status"
        @update:model-value="form.status = $event ? 'active' : 'inactive'"
      />
    </UFormField>

    <fieldset class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <UFormField label="Title" name="title" required>
        <UInput
          v-model="form.title"
          placeholder="Advanced Leadership Training"
        />
      </UFormField>

      <UFormField label="Enterprise" name="enterpriseId">
        <USelectMenu
          class="w-full"
          v-model="form.enterpriseId"
          :items="enterpriseOptions"
          value-key="value"
          option-attribute="label"
          :loading="loadingEnterprises"
          searchable
          @search="loadEnterprises"
          placeholder="Select an enterprise"
        />
      </UFormField>

      <UFormField label="Length (days)" name="length" required>
        <UInput v-model.number="form.length" type="number" min="1" />
      </UFormField>

      <UFormField label="Photo" name="photo" class="md:col-span-2">
        <UInput type="file" accept="image/*" @change="onPickPhoto" />
      </UFormField>
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
        class="w-full"
        v-model="form.participants"
        :items="memberOptions"
        value-key="value"
        option-attribute="label"
        multiple
        searchable
        :loading="loadingMembers"
        @search="loadMembers"
        placeholder="Search active members"
      />
    </UFormField>

    <h2 class="text-base font-semibold mb-3">Skills Covered</h2>
    <fieldset
      v-if="form.skills.length"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <UFormField
        v-for="skill in form.skills.length"
        :key="`program-skill-${skill}`"
        label="Skill"
      >
        <UInput
          placeholder="Skill name"
          v-model="form.skills[skill - 1]!.name"
          class="mb-4"
        />
        <ul class="flex flex-row-reverse justify-end gap-1">
          <li
            v-for="level in 10"
            :key="`skill-${skill}-level-${level}`"
            class="cursor-pointer select-none"
            @click="form.skills[skill - 1]!.level = 10 - level + 1"
          >
            <UIcon
              name="mingcute-star-fill"
              class="transition-colors"
              :class="[
                (form.skills[skill - 1]?.level ?? 0) >= 10 - level + 1
                  ? 'text-yellow-400'
                  : 'text-gray-300',
                '[&:hover~li]:text-yellow-400 hover:text-yellow-400',
              ]"
            />
          </li>
        </ul>
      </UFormField>
    </fieldset>

    <div class="flex justify-end gap-2 mt-6">
      <UButton variant="ghost" to="/panel/programs">Cancel</UButton>
      <UButton type="submit" :loading="submitting" icon="i-heroicons-check">
        {{ initial ? "Update Program" : "Create Program" }}
      </UButton>
    </div>
  </UForm>
</template>
