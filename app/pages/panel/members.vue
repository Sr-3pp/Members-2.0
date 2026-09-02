<script setup lang="ts">
import type { Member } from "~~/shared/types/entities";

const { getMembers, deleteMember } = useMembers();
const toast = useToast();

const { data: members, refresh } = await getMembers();
const modalSw = ref(false);
const currentMember = ref<Member | null>(null);

const handleSubmit = () => {
  refresh();
  modalSw.value = false;
  currentMember.value = null;
};

const handleDelete = async (id: string) => {
  await deleteMember(id);
  refresh();

  toast.add({
    title: "Member Deleted",
    description: "The member has been successfully deleted.",
    color: "success",
  });
};

const handleEdit = (member: Member) => {
  currentMember.value = member;
  modalSw.value = true;
};

watch(modalSw, (isOpen) => {
  if (!isOpen) {
    currentMember.value = null;
  }
});
</script>

<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Members Panel</h1>
    <UButton @click="modalSw = true" class="mb-4" color="primary">
      Add Member
    </UButton>

    <ul>
      <li v-for="member in members" :key="member._id">
        <NuxtLink
          :to="`/member/${member._id}/${member.name.trim().replace(/ /g, '_')}_${member.last_name.trim().replace(/ /g, '_')}`"
        >
          {{ member.name }} - {{ member.email }}
        </NuxtLink>
        <UButton color="primary" @click="handleEdit(member)">
          Edit Member
        </UButton>
        <UButton color="error" @click="handleDelete(member._id)">
          Delete
        </UButton>
      </li>
    </ul>

    <UModal v-model:open="modalSw" title="Add Member">
      <template #body>
        <MemberForm @submitted="handleSubmit" :initial="(currentMember as Member | undefined) ?? undefined" />
      </template>
    </UModal>
  </div>
</template>
