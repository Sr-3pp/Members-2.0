<script setup lang="ts">
defineProps<{ submitting: boolean; submitLabel: string }>();
const emit = defineEmits<{ cancel: [] }>();
</script>

<template>
  <div class="flex justify-end gap-2 mt-6">
    <UButton variant="ghost" type="button" @click="emit('cancel')">
      Cancel
    </UButton>
    <UButton type="submit" :loading="submitting" icon="i-heroicons-check">
      {{ submitLabel }}
    </UButton>
  </div>
</template>
