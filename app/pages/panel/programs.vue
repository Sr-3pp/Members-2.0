<script setup lang="ts">
import type { Program } from "~~/shared/types/entities";

const { getPrograms, deleteProgram } = useProgram();
const toast = useToast();

const { data: programs, refresh } = await getPrograms();
const modalSw = ref(false);
const currentProgram = ref<Program | null>(null);

const handleSubmit = () => {
  refresh();
  modalSw.value = false;
  currentProgram.value = null;
};

const handleDelete = async (id: string) => {
  await deleteProgram(id);
  refresh();

  toast.add({
    title: "Program Deleted",
    description: "The program has been successfully deleted.",
    color: "success",
  });
};

const handleEdit = (program: Program) => {
  currentProgram.value = program;
  modalSw.value = true;
};

watch(modalSw, (isOpen) => {
  if (!isOpen) {
    currentProgram.value = null;
  }
});
</script>

<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Program Panel</h1>
    <UButton @click="modalSw = true" class="mb-4" color="primary">
      Add Program
    </UButton>

    <ul>
      <li v-for="program in programs" :key="program._id">
        <NuxtLink
          :to="`/program/${program._id}/${program.title.trim().replace(/ /g, '_')}`"
        >
          {{ program.title }}
        </NuxtLink>
        <UButton color="primary" @click="handleEdit(program)">
          Edit Program
        </UButton>
        <UButton color="error" @click="handleDelete(program._id)">
          Delete
        </UButton>
      </li>
    </ul>

    <UModal v-model:open="modalSw" title="Add Program">
      <template #body>
        <ProgramForm
          @submitted="handleSubmit"
          :initial="(currentProgram as Program | undefined) ?? undefined"
        />
      </template>
    </UModal>
  </div>
</template>
