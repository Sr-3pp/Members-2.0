<script setup lang="ts">
import { z } from "zod";
import languages from "~~/data/languages.json";
import countries from "~~/data/countries.json";
import categories from "~~/data/categories.json";
import ranges from "~~/data/ranges.json";
import { compressImageUnder1MB } from "~~/utils/image";
import type { Member } from "~~/server/models/Member";

const props = defineProps<{
  initial?: Member;
  onSubmitted: any;
}>();

const form = reactive({
  folio: props.initial?.folio ?? "",
  name: props.initial?.name ?? "",
  last_name: props.initial?.last_name ?? "",
  email: props.initial?.email ?? "",
  phone: props.initial?.phone ?? "",
  mobile: props.initial?.mobile ?? "",
  range: props.initial?.range ?? "afiliado",
  pictureFile: null as File | null,
  picture: props.initial?.picture ?? "",
  social: {
    website: props.initial?.social?.website ?? "",
    fb: props.initial?.social?.fb ?? "",
    tw: props.initial?.social?.tw ?? "",
    in: props.initial?.social?.in ?? "",
  },
  countryCode: props.initial?.country?.code ?? "",
  city: props.initial?.city ?? "",
  nationality: props.initial?.nationality ?? "",
  languages: (props.initial?.languages ?? []) as string[],
  education: props.initial?.education ?? "",
  resume: props.initial?.resume ?? "",
  categories: (props.initial?.categories ?? []) as string[],
  skills: (props.initial?.skills?.length ? props.initial.skills.map(s => ({ name: s.name ?? "", level: s.level ?? 0 })) : Array.from({ length: 5 }, () => ({ name: "", level: 0 }))) as {
    name: string;
    level: number;
  }[],
  status: (props.initial?.status ?? "active") as "active" | "inactive" | "pending" | "blocked",
});

// Nuxt UI uses Zod nicely
const schema = z.object({
  folio: z.string(),
  name: z.string(),
  last_name: z.string(),
  email: z.string().email("Invalid email"),
  phone: z.string(),
  mobile: z.string().optional(),
  range: z.string(),
  picture: z.string().optional().or(z.literal("")),
  social: z.object({
    website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    fb: z.string().optional(),
    tw: z.string().optional(),
    in: z.string().optional(),
  }),
  countryCode: z.string(),
  city: z.string().optional(),
  nationality: z.string().optional(),
  languages: z.array(z.string()).optional(),
  education: z.string(),
  resume: z.string(),
  categories: z.array(z.string()),
  skills: z
    .array(
      z.object({
        name: z.string().optional().default(""),
        level: z.number().optional().default(0),
      }),
    )
    .optional(),
  status: z.enum(["active", "inactive", "pending", "blocked"]),
});

const languageOptions = languages.map((l) => ({
  label: l.label,
  value: l.code,
}));

const countryOptions = countries.map((c) => ({
  label: c.label,
  value: c.code,
}));

const categoriesOptiens = categories.map((c) => ({
  label: c.name,
  value: c.slug,
  image: c.image,
}));

const rangeOptions = ranges.map((r) => ({
  label: r.name,
  value: r.slug,
}));

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Pending", value: "pending" },
  { label: "Blocked", value: "blocked" },
];

const submitting = ref(false);
const emit = defineEmits<{
  (e: "submitted"): void;
}>();

const buildPayload = async () => {
  const payload: any = {};

  for (const [key, value] of Object.entries(form)) {
    // skip UI-only fields
    if (key === "pictureFile") continue;

    if (key === "skills") {
      payload.skills = (value! as any[])
        .map((s: any) => ({
          name: s.name.trim(),
          level: s.level,
        }))
        .filter((s: any) => s.name && s.level > 0);
      continue;
    }

    if (key === "countryCode" || key === "country") {
      if (key === "country") continue;
      const country = await $fetch<{
        name: { common: string };
        flags: { svg: string };
        subregion: string;
      }>(
        `https://restcountries.com/v3.1/alpha/${(value as string).toLowerCase()}?fields=name,flags,subregion`,
      );

      payload.country = {
        code: (value as string).toLowerCase(),
        name: country.name.common || "",
        flag: country.flags.svg || "",
        zone: country.subregion || "",
      };
      continue;
    }

    payload[key] = typeof value === "string" ? value.trim() : value;
  }

  return payload;
};

const onPickPicture = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  // compress only if needed
  const compressed = await compressImageUnder1MB(file, {
    maxBytes: 1_000_000,
    maxWidth: 1600,
    maxHeight: 1600,
    mime: "image/webp", // or "image/webp"
  });

  form.pictureFile = compressed as any; // ✅ guaranteed <= 1MB (or throws)
};
const handelUpload = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await $fetch<string>("/api/uploads/picture", {
    method: "POST",
    body: formData,
  });

  return response; // Assuming the API returns the URL of the uploaded file
};

const handleUpdate = async () => {
  try {
    if (form.pictureFile) {
      form.picture = await handelUpload(form.pictureFile as File);
    }

    const payload = await buildPayload();

    await $fetch(`/api/members/${props.initial?._id}`, {
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
    if (form.pictureFile) {
      form.picture = await handelUpload(form.pictureFile as File);
    }

    const payload = await buildPayload();
    await $fetch("/api/members", {
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
          <h1 class="text-xl font-semibold">New Member</h1>
          <p class="text-sm text-gray-500">Create a new member record</p>
        </div>
      </div>
    </template>

    <UForm
      :schema="schema"
      :state="form"
      @submit="onSubmit"
      @error="console.log('Form errors', $event)"
    >
      <UFormField class="w-full" label="Folio" name="folio" required>
        <UInput v-model="form.folio" placeholder="FOLIO1234" />
      </UFormField>

      <fieldset class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UFormField label="Name" name="name" required>
          <UInput v-model="form.name" placeholder="John" />
        </UFormField>

        <UFormField label="Last name" name="last_name" required>
          <UInput v-model="form.last_name" placeholder="Doe" />
        </UFormField>

        <UFormField label="Email" name="email" required>
          <UInput
            v-model="form.email"
            type="email"
            placeholder="john@company.com"
          />
        </UFormField>

        <UFormField label="Membresia" name="range" required class="w-full">
          <USelect class="w-full" v-model="form.range" :items="rangeOptions" />
        </UFormField>

        <UFormField label="Phone" name="phone" required>
          <UInput v-model="form.phone" placeholder="55 1234 5678" />
        </UFormField>

        <UFormField label="Mobile" name="mobile">
          <UInput v-model="form.mobile" placeholder="55 9876 5432" />
        </UFormField>

        <UFormField label="Picture" name="picture" required>
          <UInput type="file" accept="image/*" @change="onPickPicture" />
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
      </fieldset>

      <fieldset class="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <UFormField label="Languages" name="languages">
          <USelectMenu
            class="w-full"
            placeholder="Select a language"
            :items="languageOptions"
            multiple
            value-key="value"
            label-key="label"
            v-model="form.languages"
          />
        </UFormField>
      </fieldset>

      <fieldset class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UFormField label="Education" name="education" required>
          <UTextarea
            v-model="form.education"
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
      <fieldset class="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      <fieldset class="flex gap-4 flex-wrap">
        <label
          v-for="category in categoriesOptiens"
          :key="`category-${category.value}`"
          class="basis-1/2 md:basis-1/3"
        >
          <NuxtImg :src="category.image" />
          <p>{{ category.label }}</p>
          <input
            type="checkbox"
            name="categories"
            v-model="form.categories"
            :value="category.value"
          />
        </label>
      </fieldset>

      <fieldset
        v-if="form.skills.length"
        class="grid grid-cols-1 md:grid-cols-2 gap-4"
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
  </UCard>
</template>
