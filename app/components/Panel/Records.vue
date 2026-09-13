<script setup lang="ts">
import type { Enterprise, Member, Program } from "~~/shared/types/entities";
import type { PanelRecordKind } from "~/composables/PanelRecords";

const props = defineProps<{ kind: PanelRecordKind }>();
const {
  config,
  records,
  columns,
  status,
  error,
  refresh,
  displayName,
  profilePath,
  modalOpen,
  currentRecord,
  saving,
  deleting,
  openForm,
  handleSubmit,
  handleStatusChange,
  handleDelete,
} = usePanelRecords(props.kind);

const modalTitles: Record<'new' | 'edit', Record<'member' | 'enterprise' | 'program', { title: string; description: string }>> = {
  new: {
    member: {
      title: "New Member",
      description: "Create New Member"
    },
    enterprise: {
      title: "New Enterprise",
      description: "Create New Enterprise"
    },
    program: {
      title: "New Program",
      description: "Create New Program"
    }
  },
  edit: {
    member: {
      title: "Edit Member",
      description: "Edit Member Details"
    },
    enterprise: {
      title: "Edit Enterprise",
      description: "Edit Enterprise Details"
    },
    program: {
      title: "Edit Program",
      description: "Edit Program Details"
    }
  }
};

const modalTitle = computed(() => {
  const action = currentRecord.value ? 'edit' : 'new';
  return modalTitles[action][config.label.toLowerCase() as 'member' | 'enterprise' | 'program'].title;
});
const modalDescription = computed(() => {
  const action = currentRecord.value ? 'edit' : 'new';
  return modalTitles[action][config.label.toLowerCase() as 'member' | 'enterprise' | 'program'].description;
});
</script>

<template>
  <div class="space-y-4 pt-4">
    <div class="flex justify-between items-center gap-4">
      <h2 class="text-xl font-semibold capitalize">{{ kind }}</h2>
      <UButton color="primary" @click="openForm()">Add {{ config.label }}</UButton>
    </div>
    <UAlert v-if="error" color="error" :title="`Could not load ${kind}`" description="Please try again."
      :actions="[{ label: 'Retry', onClick: () => refresh() }]" />
    <UTable :data="records" :columns="columns" :get-row-id="(record) => record._id" :loading="status === 'pending'"
      :empty="`No ${kind} found.`">
      <template #status-cell="{ row }">
        <USwitch :model-value="row.original.status === 'active'" :loading="saving.has(row.original._id)"
          :disabled="saving.has(row.original._id) || deleting.has(row.original._id)"
          :aria-label="`Active status for ${displayName(row.original)}`"
          @update:model-value="handleStatusChange(row.original, $event)" />
      </template>
      <template #name-cell="{ row }">
        <NuxtLink :to="profilePath(row.original)">{{ displayName(row.original) }}</NuxtLink>
      </template>
      <template #actions-cell="{ row }">
        <div class="flex items-center gap-2">
          <UButton icon="lucide-edit" color="primary" :aria-label="`Edit ${config.label.toLowerCase()}`"
            :disabled="saving.has(row.original._id) || deleting.has(row.original._id)"
            @click="openForm(row.original)" />
          <UButton icon="lucide-trash" color="error" :aria-label="`Delete ${config.label.toLowerCase()}`"
            :loading="deleting.has(row.original._id)"
            :disabled="saving.has(row.original._id) || deleting.has(row.original._id)"
            @click="handleDelete(row.original)" />
        </div>
      </template>
    </UTable>
    <UModal v-model:open="modalOpen" :title="modalTitle" :description="modalDescription">
      <template #body>
        <MemberForm v-if="kind === 'members'" :initial="(currentRecord as Member | undefined)"
          @submitted="handleSubmit" />
        <EnterpriseForm v-else-if="kind === 'enterprises'" :initial="(currentRecord as Enterprise | undefined)"
          @submitted="handleSubmit" />
        <ProgramForm v-else :initial="(currentRecord as Program | undefined)" @submitted="handleSubmit" />
      </template>
    </UModal>
  </div>
</template>
