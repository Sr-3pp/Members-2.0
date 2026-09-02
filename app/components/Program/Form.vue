<script setup lang="ts">
import { z } from "zod";
import { compressImageUnder1MB } from "~~/utils/image";
import type { Enterprise, Program } from "~~/shared/types/entities";

const props = defineProps<{
  initial?: Program;
  onSubmitted: any;
}>();

const enterpriseOptions = ref<{ label: string; value: string }[]>([]);
const loadingEnterprises = ref(false);

const loadEnterprises = async (term = "") => {
  loadingEnterprises.value = true;
  try {
    const results = await $fetch<Enterprise[]>("/api/enterprises/search", {
      params: { q: term, status: "active", limit: 20 },
    });
    enterpriseOptions.value = results.map((e) => ({
      label: e.name || "Unnamed Enterprise",
      value: e._id,
    }));
  } finally {
    loadingEnterprises.value = false;
  }
};

const memberOptions = ref<{ label: string; value: string }[]>([]);
const loadingMembers = ref(false);

const loadMembers = async (term = "") => {
  loadingMembers.value = true;
  try {
    const results = await $fetch<any[]>("/api/members/search", {
      params: { q: term, status: "active", limit: 20 },
    });
    memberOptions.value = results.map((m) => ({
      label: `${m.name ?? ""} ${m.last_name ?? ""}`.trim() || m.email,
      value: m._id,
    }));
  } finally {
    loadingMembers.value = false;
  }
};

onMounted(() => {
  loadMembers();
  loadEnterprises();
});

const form = reactive({
  title: props.initial?.title ?? "",
  length: props.initial?.length ?? 1,
  enterpriseId:
    (props.initial as any)?.enterprise?._id ??
    (props.initial as any)?.enterprise ??
    "",
  participants: ((props.initial as any)?.participants ?? [])
    .map((p: any) => (typeof p === "string" ? p : p?._id))
    .filter(Boolean),
  photoFile: null as File | null,
  photo: props.initial?.photo ?? "",
  description: props.initial?.description ?? "",
  skills: (props.initial?.skills?.length
    ? props.initial.skills.map((s) => ({
        name: s.name ?? "",
        level: s.level ?? 0,
      }))
    : Array.from({ length: 5 }, () => ({ name: "", level: 0 }))) as {
    name: string;
    level: number;
  }[],
  status: (props.initial?.status ?? "active") as
    | "active"
    | "inactive"
    | "archived",
});

// Nuxt UI uses Zod nicely
const schema = z.object({
  title: z.string().min(1, "Title is required"),
  length: z.number().min(1, "Length must be at least 1 day"),
  enterpriseId: z.string().optional(),
  participants: z.array(z.string()).optional(),
  photo: z.string().optional().or(z.literal("")),
  description: z.string().optional(),
  skills: z
    .array(
      z.object({
        name: z.string().optional().default(""),
        level: z.number().optional().default(0),
      }),
    )
    .optional(),
  status: z.enum(["active", "inactive", "archived"]),
});

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Archived", value: "archived" },
];

const submitting = ref(false);
const emit = defineEmits<{
  (e: "submitted"): void;
}>();

const buildPayload = async () => {
  const payload: any = {};

  for (const [key, value] of Object.entries(form)) {
    // skip UI-only fields
    if (key === "photoFile") continue;

    if (key === "enterpriseId") {
      if (value) {
        payload.enterprise = value;
      }
      continue;
    }

    if (key === "skills") {
      payload.skills = (value! as any[])
        .map((s: any) => ({
          name: s.name.trim(),
          level: s.level,
        }))
        .filter((s: any) => s.name && s.level > 0);
      continue;
    }

    if (key === "participants") {
      payload.participants = value;
      continue;
    }

    payload[key] = typeof value === "string" ? value.trim() : value;
  }

  return payload;
};

const onPickPhoto = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  // compress only if needed
  const compressed = await compressImageUnder1MB(file, {
    maxBytes: 1_000_000,
    maxWidth: 1600,
    maxHeight: 1600,
    mime: "image/webp",
  });

  form.photoFile = compressed as any;
};

const handelUpload = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await $fetch<string>("/api/uploads/picture", {
    method: "POST",
    body: formData,
  });

  return response;
};

const handleUpdate = async () => {
  try {
    if (form.photoFile) {
      form.photo = await handelUpload(form.photoFile as File);
    }

    const payload = await buildPayload();

    await $fetch(`/api/programs/${props.initial?._id}`, {
      method: "PATCH",
      body: payload,
    });
  } finally {
    submitting.value = false;
    emit("submitted");
  }
};

async function onSubmit() {
  submitting.value = true;

  if (props.initial) return handleUpdate();

  try {
    if (form.photoFile) {
      form.photo = await handelUpload(form.photoFile as File);
    }

    const payload = await buildPayload();
    await $fetch("/api/programs", {
      method: "POST",
      body: payload,
    });
  } finally {
    submitting.value = false;
    emit("submitted");
  }
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-semibold">
            {{ initial ? "Edit Program" : "New Program" }}
          </h1>
          <p class="text-sm text-gray-500">
            {{
              initial
                ? "Update program information"
                : "Create a new program record"
            }}
          </p>
        </div>
      </div>
    </template>

    <UForm
      :schema="schema"
      :state="form"
      @submit="onSubmit"
      @error="console.log('Form errors', $event)"
    >
      <fieldset class="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <UFormField label="Status" name="status">
          <USelectMenu
            class="w-full"
            v-model="form.status"
            :items="statusOptions"
            value-key="value"
            option-attribute="label"
          />
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
        class="grid grid-cols-1 md:grid-cols-2 gap-4"
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
  </UCard>
</template>
