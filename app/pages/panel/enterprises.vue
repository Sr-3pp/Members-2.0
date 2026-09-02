<script setup lang="ts">
import type { Enterprise } from "~~/shared/types/entities";

const { getEnterprises, deleteEnterprise } = useEnterprise();
const toast = useToast();

const { data: enterprises, refresh } = await getEnterprises();
const modalSw = ref(false);
const currentEnterprise = ref<Enterprise | null>(null);

const handleSubmit = () => {
  refresh();
  modalSw.value = false;
  currentEnterprise.value = null;
};

const handleDelete = async (id: string) => {
  await deleteEnterprise(id);
  refresh();

  toast.add({
    title: "Enterprise Deleted",
    description: "The enterprise has been successfully deleted.",
    color: "success",
  });
};

const handleEdit = (enterprise: Enterprise) => {
  currentEnterprise.value = enterprise;
  modalSw.value = true;
};

watch(modalSw, (isOpen) => {
  if (!isOpen) {
    currentEnterprise.value = null;
  }
});
</script>

<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Enterprise Panel</h1>
    <UButton @click="modalSw = true" class="mb-4" color="primary">
      Add Enterprise
    </UButton>

    <ul>
      <li v-for="enterprise in enterprises" :key="enterprise._id">
        <NuxtLink
          :to="`/enterprise/${enterprise._id}/${enterprise.name.trim().replace(/ /g, '_')}`"
        >
          {{ enterprise.name }}
        </NuxtLink>
        <UButton color="primary" @click="handleEdit(enterprise)">
          Edit Enterprise
        </UButton>
        <UButton color="error" @click="handleDelete(enterprise._id)">
          Delete
        </UButton>
      </li>
    </ul>

    <UModal v-model:open="modalSw" title="Add Enterprise">
      <template #body>
        <EnterpriseForm
          @submitted="handleSubmit"
          :initial="(currentEnterprise as Enterprise | undefined) ?? undefined"
        />
      </template>
    </UModal>
  </div>
</template>
