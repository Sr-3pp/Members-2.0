<script setup lang="ts">
withDefaults(
  defineProps<{ label?: string; name?: string; required?: boolean }>(),
  { label: "Picture", name: "picture", required: false },
);
const emit = defineEmits<{ change: [event: Event] }>();
</script>

<template>
  <UFormField :label="label" :name="name" :required="required">
    <UInput type="file" accept="image/*" @change="emit('change', $event)" />
  </UFormField>
</template>
