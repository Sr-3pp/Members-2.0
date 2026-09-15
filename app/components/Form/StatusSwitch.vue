<script setup lang="ts" generic="T extends string">
// Toggles an entity between "active" and "inactive" while showing the current
// status, which may also be a value the switch cannot set (pending, blocked...).
const model = defineModel<T>({ required: true });
defineProps<{ disabled?: boolean }>();

const label = computed(
  () => model.value.charAt(0).toUpperCase() + model.value.slice(1),
);
const setActive = (active: boolean) => {
  model.value = (active ? "active" : "inactive") as T;
};
</script>

<template>
  <UFormField class="my-auto" name="status">
    <USwitch
      :model-value="model === 'active'"
      :label="label"
      :disabled="disabled"
      aria-label="Active status"
      @update:model-value="setActive"
    />
  </UFormField>
</template>
