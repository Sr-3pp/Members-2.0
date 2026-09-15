<script setup lang="ts">
import type { Enterprise, Member, Program } from "~~/shared/types/entities";
import type { PanelRecordKind } from "~/composables/PanelRecords";

const props = defineProps<{ kind: PanelRecordKind }>();
const {
  config,
  records,
  page,
  pageSize,
  pagedRecords,
  pageRange,
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
  deleteCandidate,
  deletingCandidate,
  requestDelete,
  cancelDelete,
  confirmDelete,
} = usePanelRecords(props.kind);

const modalTitle = computed(() =>
  `${currentRecord.value ? "Edit" : "New"} ${config.label}`,
);
const modalDescription = computed(() =>
  currentRecord.value ? `Edit ${config.label} Details` : `Create New ${config.label}`,
);
</script>

<template>
  <div class="space-y-4 pt-4">
    <div class="flex justify-between items-center gap-4">
      <h2 class="text-xl font-semibold capitalize">{{ kind }}</h2>
      <UButton color="primary" @click="openForm()">Add {{ config.label }}</UButton>
    </div>
    <UAlert v-if="error" color="error" :title="`Could not load ${kind}`" description="Please try again."
      :actions="[{ label: 'Retry', onClick: () => refresh() }]" />
    <UTable :data="pagedRecords" :columns="columns" :get-row-id="(record) => record._id" :loading="status === 'pending'"
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
            @click="requestDelete(row.original)" />
        </div>
      </template>
    </UTable>
    <div
      v-if="records.length > pageSize"
      class="flex flex-wrap items-center justify-between gap-4"
    >
      <p class="text-sm text-muted">
        Showing {{ pageRange.start }}-{{ pageRange.end }} of {{ pageRange.total }} {{ kind }}
      </p>
      <UPagination
        v-model:page="page"
        :items-per-page="pageSize"
        :total="records.length"
        :sibling-count="1"
        show-edges
      />
    </div>
    <UModal
      :open="!!deleteCandidate"
      :title="`Delete ${config.label.toLowerCase()}`"
      :description="`This will permanently remove ${deleteCandidate ? displayName(deleteCandidate) : ''}.`"
      :dismissible="!deletingCandidate"
      @update:open="(open) => !open && cancelDelete()"
    >
      <template #body>
        <p>
          You are about to delete
          <strong>{{ deleteCandidate ? displayName(deleteCandidate) : "" }}</strong>.
          This action cannot be undone.
        </p>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton variant="ghost" :disabled="deletingCandidate" @click="cancelDelete">
            Cancel
          </UButton>
          <UButton
            color="error"
            icon="lucide-trash"
            :loading="deletingCandidate"
            @click="confirmDelete"
          >
            Delete {{ config.label.toLowerCase() }}
          </UButton>
        </div>
      </template>
    </UModal>
    <UModal v-model:open="modalOpen" :title="modalTitle" :description="modalDescription">
      <template #body>
        <MemberForm v-if="kind === 'members'" :initial="(currentRecord as Member | undefined)"
          @submitted="handleSubmit" @cancel="modalOpen = false" />
        <EnterpriseForm v-else-if="kind === 'enterprises'" :initial="(currentRecord as Enterprise | undefined)"
          @submitted="handleSubmit" @cancel="modalOpen = false" />
        <ProgramForm v-else :initial="(currentRecord as Program | undefined)" @submitted="handleSubmit"
          @cancel="modalOpen = false" />
      </template>
    </UModal>
  </div>
</template>
