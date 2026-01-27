<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Member } from "~~/server/models/Member";
import type { Enterprise } from "~~/server/models/Enterprise";
import type { Program } from "~~/server/models/Program";

const { id: entity_params, entity: entity_param } = useRoute().params;
const [id] = entity_params as string[];

const entity = ref<Member | Enterprise | Program | null>(null);
const entityType = computed(() => entity_param as string);
const isMember = computed(() => entityType.value === "member");
const isEnterprise = computed(() => entityType.value === "enterprise");
const isProgram = computed(() => entityType.value === "program");

const programEnterprise = computed<Enterprise | null>(() => {
  if (!isProgram.value || !entity.value) return null;
  const ent = (entity.value as any).enterprise;
  return ent || null;
});

const contactSource = computed(() => {
  if (isProgram.value && programEnterprise.value) return programEnterprise.value as any;
  return entity.value as any;
});

type ProgramParticipant = Pick<Member, "_id" | "name" | "last_name" | "email" | "range">;

const programColumns: TableColumn<ProgramParticipant>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "range", header: "Range" },
];

const participantRows = computed<ProgramParticipant[]>(() =>
  isProgram.value
    ? (((entity.value as Program)?.participants as unknown as ProgramParticipant[]) ?? [])
    : [],
);

const skills = computed(() => {
  if (!entity.value) return [];
  if (isProgram.value) return (entity.value as Program).skills ?? [];
  if (isMember.value) return (entity.value as Member).skills ?? [];
  if (isEnterprise.value) return (entity.value as Enterprise).skills ?? [];
  return [];
});

if (entityType.value === "member") {
  const { getMember } = useMembers();
  const { data } = await getMember(id as string);
  entity.value = data.value;
} else if (entityType.value === "enterprise") {
  const { getEnterprise } = useEnterprise();
  const { data } = await getEnterprise(id as string);
  entity.value = data.value;
} else if (entityType.value === "program") {
  const { getProgram } = useProgram();
  const { data } = await getProgram(id as string);
  entity.value = data.value;
}

const displayImage = computed(() => {
  if (!entity.value) return "";
  if (isProgram.value) return (entity.value as Program).photo || "";
  return (entity.value as Member | Enterprise).picture as string;
});

const displayName = computed(() => {
  if (!entity.value) return "";
  if (isProgram.value) return (entity.value as Program).title;
  const m = entity.value as Member | Enterprise;
  const last = (m as Member).last_name ?? "";
  return `${m.name} ${isMember.value ? last : ""}`.trim();
});
</script>

<template>
  <UContainer v-if="entity" class="flex flex-col gap-6 py-6">
    <div class="grid grid-cols-1 sm:grid-cols-12 gap-4">
      <div
        class="col-span-1 sm:col-span-6 md:col-span-3 flex flex-col items-center gap-6"
      >
        <NuxtImg
          :src="displayImage"
          :alt="displayName"
        />
        <div v-if="isMember || isEnterprise" class="flex items-center gap-3">
          <img
            class="size-10 rounded-full border border-red-300 object-cover p-1"
            :src="(entity as any).country?.flag as string"
            :alt="`flag from ${(entity as any).country?.name}`"
          />
          <div class="flex flex-col gap-4">
            <h3 class="flex flex-col gap-2 text-center">
              <span>
                {{ (entity as any).country?.name }} <br />
                <small>{{ (entity as any).city }}</small>
              </span>
              <small>({{ (entity as any).country?.zone }})</small>
            </h3>
          </div>
        </div>
        <div v-else-if="isProgram && programEnterprise" class="flex items-center gap-3">
          <img
            class="size-10 rounded-full border border-red-300 object-cover p-1"
            :src="programEnterprise.country?.flag as string"
            :alt="`flag from ${programEnterprise.country?.name}`"
          />
          <div class="flex flex-col gap-4">
            <h3 class="flex flex-col gap-2 text-center">
              <span>
                {{ programEnterprise.country?.name }} <br />
                <small>{{ programEnterprise.city }}</small>
              </span>
              <small>({{ programEnterprise.country?.zone }})</small>
            </h3>
          </div>
        </div>
        <div v-if="isMember" class="flex items-center gap-4">
          <NuxtImg
            class="size-10"
            :src="`/img/medals/${(entity as Member).range}.png`"
            :alt="`${(entity as Member).range} medal`"
          />
          <h4 class="capitalize">
            {{ (entity as Member).range }}
          </h4>
        </div>
      </div>
      <div class="col-span-1 sm:col-span-6 md:col-span-9 flex flex-col gap-6">
        <h1 class="text-4xl font-bold">
          {{ displayName }}
        </h1>
        <ul class="flex gap-6" v-if="isMember">
          <li
            class="flex items-center gap-2"
            v-for="category in (entity as Member).categories"
            :key="`member_cat-${category}`"
          >
            <NuxtImg
              class="size-10"
              :src="`/img/categories/${category}.png`"
              :alt="`${category} image`"
            />
            <span class="capitalize">{{ category.replace(/-/g, " ") }}</span>
          </li>
        </ul>
        <p v-else-if="isEnterprise" class="flex items-center gap-2">
          <NuxtImg
            class="size-10"
            src="/img/categories/empresa.png"
            alt="empresa image"
          />
          <span class="capitalize">empresa</span>
        </p>
        <p v-else-if="isProgram" class="flex items-center gap-2 text-lg">
          <UIcon name="i-heroicons-academic-cap" />
          <span class="capitalize">programa</span>
          <span class="text-sm text-gray-500">{{ (entity as Program).length }} días</span>
        </p>
        <hr />
        <NuxtImg
          v-if="isMember || isEnterprise"
          :src="`/img/zones/${((entity as any).country!.zone as string).toLowerCase().replace(/ /g, '_')}.png`"
          :alt="`${(entity as any).country!.zone} zone`"
        />
        <NuxtImg
          v-else-if="isProgram && programEnterprise?.country?.zone"
          :src="`/img/zones/${programEnterprise.country.zone.toLowerCase().replace(/ /g, '_')}.png`"
          :alt="`${programEnterprise.country.zone} zone`"
        />
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-6 md:grid-cols-12">
      <div class="col-span-1 sm:col-span-6 md:col-span-8 flex flex-col gap-8">
        <article class="flex flex-col gap-4">
          <h3 class="text-xl font-bold">
            {{ isProgram ? "Description" : "Education" }}
          </h3>
          <p>
            {{
              isMember
                ? (entity as Member).education
                : isEnterprise
                ? (entity as Enterprise).description
                : (entity as Program).description
            }}
          </p>
        </article>
        <article class="flex flex-col gap-4">
          <h3 class="text-xl font-bold">Resume</h3>
          <p>
            {{ isProgram ? (entity as Program).description : (entity as any).resume }}
          </p>
        </article>
      </div>
      <div class="col-span-1 sm:col-span-6 md:col-span-4 flex flex-col gap-8">
        <article class="flex flex-col gap-2">
          <p class="text-xl font-bold">Contact</p>
          <ul class="flex flex-col gap-2">
            <li v-if="contactSource?.folio" class="flex items-center gap-2">
              <NuxtImg
                class="size-10"
                src="/img/resources/folio-icon.png"
                alt="icono folio"
              />
              <p>
                {{ contactSource?.folio }}
              </p>
            </li>
            <li v-if="contactSource?.phone" class="flex items-center gap-2">
              <NuxtLink
                :to="`tel:${contactSource?.phone}`"
                class="flex items-center gap-2"
              >
                <NuxtImg
                  class="size-10"
                  src="/img/resources/phone-icon.png"
                  alt="icono phone"
                />
                <p>
                  {{ contactSource?.phone }}
                </p>
              </NuxtLink>
            </li>
            <li
              v-if="isMember && (entity as Member).mobile"
              class="flex items-center gap-2"
            >
              <NuxtLink
                class="flex items-center gap-2"
                :to="`tel:${(entity as Member).mobile}`"
              >
                <NuxtImg
                  class="size-10"
                  src="/img/resources/mobile-icon.png"
                  alt="icono mobile"
                />
                <p>
                  {{ (entity as Member).mobile }}
                </p>
              </NuxtLink>
            </li>
            <li v-if="contactSource?.country" class="flex items-center gap-2">
              <NuxtImg
                class="size-10"
                src="/img/resources/country-icon.png"
                alt="icon country"
              />
              <p>
                {{ contactSource?.country.name }}
              </p>
            </li>
            <li
              v-if="isMember && (entity as Member).email"
              class="flex items-center gap-2"
            >
              <NuxtLink
                :to="`mailto:${(entity as Member).email}`"
                class="flex items-center gap-2"
              >
                <NuxtImg
                  class="size-10"
                  src="/img/resources/email-icon.png"
                  alt="icono email"
                />
                <p>
                  {{ (entity as Member).email }}
                </p>
              </NuxtLink>
            </li>
            <li v-if="contactSource?.social?.website" class="flex items-center gap-2">
              <NuxtLink
                class="flex items-center gap-2"
                :to="contactSource?.social.website"
                target="_blank"
                rel="noopener noreferrer"
              >
                <NuxtImg
                  class="size-10"
                  src="/img/resources/website-icon.png"
                  alt="icono web"
                />
                <p>
                  {{ contactSource?.social.website }}
                </p>
              </NuxtLink>
            </li>
          </ul>
        </article>
        <article class="flex flex-col gap-2">
          <p class="text-xl font-bold">Social</p>
          <ul class="flex gap-4">
            <li v-if="contactSource?.social?.fb" class="flex items-center gap-2">
              <NuxtImg
                class="size-10"
                src="/img/resources/fb-logo.png"
                alt="icono facebook"
              />
            </li>
            <li v-if="contactSource?.social?.tw" class="flex items-center gap-2">
              <NuxtImg
                class="size-10"
                src="/img/resources/tw-logo.png"
                alt="icono twitter"
              />
            </li>
            <li v-if="contactSource?.social?.in" class="flex items-center gap-2">
              <NuxtImg
                class="size-10"
                src="/img/resources/in-logo.png"
                alt="icono linkedin"
              />
            </li>
          </ul>
        </article>
      </div>
    </div>
  </UContainer>

  <section v-if="entity && isProgram" class="dark:bg-gray-700 py-6">
    <UContainer>
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-bold">Participants</h3>
        <span class="text-sm text-gray-300">
          {{ (entity as Program).participants?.length || 0 }} total
        </span>
      </div>
      <UTable
        :data="participantRows"
        :columns="programColumns"
        empty="No participants"
      >
        <template #name-cell="{ row }">
          {{
            `${row.original.name ?? ""} ${row.original.last_name ?? ""}`.trim() || "N/A"
          }}
        </template>
      </UTable>
    </UContainer>
  </section>

  <section v-if="entity && (isMember || isProgram || isEnterprise)" class="dark:bg-gray-600">
    <UContainer
      class="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-6 gap-4 py-6"
    >
      <div class="col-span-1 sm:col-span-6 md:col-span-2 flex items-center">
        <h5 class="text-xl font-bold">Skills</h5>
      </div>
      <div class="col-span-1 sm:col-span-6 md:col-span-4">
        <ul class="flex flex-col gap-4">
          <li
            v-for="skill in skills"
            :key="`member_skill-${skill.name}-${skill.level}`"
            class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-8 gap-4"
          >
            <span class="col-span-1 md:col-span-3">{{ skill.name }}</span>
            <span class="col-span-1 md:col-span-5 flex gap-2">
              <UIcon
                v-for="_ in skill.level"
                name="mingcute-star-fill"
                class="size-4"
              />
            </span>
          </li>
        </ul>
      </div>
    </UContainer>
  </section>
</template>
