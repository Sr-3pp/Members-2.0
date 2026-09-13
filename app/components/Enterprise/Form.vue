<script setup lang="ts">
import type { Enterprise } from "~~/shared/types/entities";

const props = defineProps<{ initial?: Enterprise }>();
const emit = defineEmits<{ submitted: [] }>();
const {
  form,
  schema,
  submitting,
  onSubmit,
  onPickPicture,
  countryOptions,
} = useEnterpriseForm(props.initial, () => emit("submitted"));
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
      <UFormField class="my-auto" name="status">
        <USwitch
          :model-value="form.status === 'active'"
          :label="form.status.charAt(0).toUpperCase() + form.status.slice(1)"
          :disabled="submitting"
          aria-label="Active status"
          @update:model-value="form.status = $event ? 'active' : 'inactive'"
        />
      </UFormField>
    </fieldset>

    <fieldset class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <UFormField label="Name" name="name" required>
        <UInput v-model="form.name" placeholder="John" />
      </UFormField>

      <UFormField label="Phone" name="phone" required>
        <UInput v-model="form.phone" placeholder="55 1234 5678" />
      </UFormField>

      <UFormField label="Picture" name="picture" required>
        <UInput type="file" accept="image/*" @change="onPickPicture" />
      </UFormField>
    </fieldset>

    <fieldset class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <UFormField label="Country" name="country-code" required>
        <USelectMenu
          class="w-full"
          v-model="form.countryCode"
          :items="countryOptions"
          value-key="value"
          option-attribute="label"
          placeholder="MX or 52 or Mexico"
        />
      </UFormField>

      <UFormField label="City" name="city">
        <UInput v-model="form.city" placeholder="CDMX" />
      </UFormField>

      <UFormField label="Nationality" name="nationality">
        <UInput v-model="form.nationality" placeholder="Mexican" />
      </UFormField>
    </fieldset>

    <fieldset class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <UFormField label="Description" name="descripiton" required>
        <UTextarea
          v-model="form.description"
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

    <!-- Tags-style arrays -->
    <h2 class="text-base font-semibold mb-3">Social</h2>
    <fieldset class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <UFormField label="Website" name="social.website">
        <UInput v-model="form.social!.website" placeholder="https://..." />
      </UFormField>

      <UFormField label="Facebook" name="social.fb">
        <UInput v-model="form.social!.fb" placeholder="facebook.com/..." />
      </UFormField>

      <UFormField label="Twitter/X" name="social.tw">
        <UInput v-model="form.social!.tw" placeholder="x.com/..." />
      </UFormField>

      <UFormField label="LinkedIn" name="social.in">
        <UInput v-model="form.social!.in" placeholder="linkedin.com/in/..." />
      </UFormField>
    </fieldset>

    <fieldset
      v-if="form.skills.length"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <UFormField
        v-for="skill in form.skills.length"
        :key="`member-skill-${skill}`"
        label="Area"
      >
        <UInput
          placeholder="skill name"
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
      <UButton variant="ghost" to="/members">Cancel</UButton>
      <UButton type="submit" :loading="submitting" icon="i-heroicons-check">
        Create member
      </UButton>
    </div>
  </UForm>
</template>
