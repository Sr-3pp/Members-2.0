<script setup lang="ts">
import { categoryDefinitions, type SearchCategory } from "~~/shared/utils/categories";
import type {
  Enterprise,
  Member,
  ProgramWithEnterprise,
} from "~~/shared/types/entities";

const { member, enterprise, program } = defineProps<{
  category: SearchCategory;
  member?: Member;
  enterprise?: Enterprise;
  program?: ProgramWithEnterprise | null;
}>();

const instance = computed<Member | Enterprise | ProgramWithEnterprise | null>(
  () => member ?? enterprise ?? (program as ProgramWithEnterprise | null) ?? null,
);
const isMember = computed(() => !!member);
const isProgram = computed(() => !!program);
const displayLastName = computed(() => (isMember.value ? member?.last_name ?? "" : ""));
const programEnterprise = computed<Enterprise | null>(() =>
  isProgram.value ? ((program as ProgramWithEnterprise | undefined)?.enterprise ?? null) : null,
);
const displayName = computed(() => {
  if (isProgram.value) return program?.title ?? "";
  const base = instance.value as Member | Enterprise | null;
  const last = isMember.value ? displayLastName.value : "";
  return `${base?.name ?? ""} ${last}`.trim();
});
const displayPicture = computed(() => {
  if (isProgram.value) return program?.photo ?? programEnterprise.value?.picture ?? "";
  const base = instance.value as Member | Enterprise | null;
  return (base?.picture as string) ?? "";
});
const displayCountry = computed(() => {
  if (isProgram.value) return programEnterprise.value?.country ?? null;
  const base = instance.value as Member | Enterprise | null;
  return base?.country ?? null;
});
type ContactSource =
  | (Member & { social?: Member["social"] })
  | (Enterprise & { social?: Enterprise["social"] })
  | (ProgramWithEnterprise & { social?: any; folio?: string; phone?: string; country?: any })
  | null;

const contactSource = computed<ContactSource>(() => {
  if (isProgram.value) {
    const programContact = (program as ProgramWithEnterprise | null) as ContactSource;
    const hasProgramContact = Boolean(
      (programContact as any)?.folio ||
        (programContact as any)?.phone ||
        (programContact as any)?.country ||
        (programContact as any)?.social,
    );
    return hasProgramContact ? programContact : programEnterprise.value;
  }
  return instance.value as ContactSource;
});
const detailPath = computed(() => {
  if (isProgram.value && program) {
    const baseTitle = (program.title ?? "").toLowerCase().replace(/ /g, "_");
    return `/program/${program._id}/${baseTitle}`;
  }
  if (!instance.value) return "#";
  const base = instance.value as Member | Enterprise;
  const baseName = (base.name ?? "").toLowerCase().replace(/ /g, "_");
  const lastSlug = displayLastName.value
    ? `_${displayLastName.value.toLowerCase().replace(/ /g, "_")}`
    : "";
  return `/${member ? "member/" : "enterprise/"}${base._id}/${baseName}${lastSlug}`;
});
</script>

<template>
  <UCard
    v-if="instance"
    :ui="{
      root: 'bg-white border-none px-0 ring-0 overflow-visible',
      header: 'border-none px-0 sm:px-0 pt-10 pb-0',
      body: 'border-1 border-light-gray'
    }"
  >
    <template #header>
      <div
        class="flex relative"
        :class="categoryDefinitions[category].background"
      >
        <figure
          class="flex justify-center items-center absolute bottom-full right-0 gap-2 h-10 px-6 py-4"
          :class="categoryDefinitions[category].background"
        >
          <figcaption class="capitalize">
            {{ categoryDefinitions[category].label }}
          </figcaption>
          <CategoryIcon class="size-8 !p-1" :category="category" />
        </figure>
        <figure class="relative flex flex-col items-center w-2/8 -mt-16 ml-6 mb-6">
          <NuxtImg
            class="p-2 bg-white rounded-full"
            :src="displayPicture"
            :alt="`picture of ${displayName}`"
          />
          <span
            class="p-1 border-1 border-black rounded-full flex-shring-0 -mt-6 overflow-hidden"
          >
            <CountryFlag
              class="size-8 object-cover rounded-full"
              :country="displayCountry"
            />
          </span>
        </figure>
  
        <div class="flex flex-col gap-2 ml-auto text-right justify-center px-6">
          <h3 class="font-bold text-lg">
            {{ displayName }}
          </h3>
          <ul class="flex justify-end gap-2">
            <template v-for="(social, key) in contactSource?.social">
              <li
                class=""
                :key="`instance.card-social-${social}`"
                v-if="key !== 'website'"
              >
                <NuxtImg class="size-8" :src="`/img/resources/${key}-logo.png`" />
              </li>
            </template>
          </ul>
        </div>
      </div>
    </template>

    <div class="px-4 pt-4 flex flex-col gap-3">
      <p class="text-inverted flex justify-between">
        <span class="font-bold"> Folio: </span>
        <span>
          {{ contactSource?.folio }}
        </span>
      </p>
      <hr />
      <template v-if="isMember">
        <p class="text-inverted flex justify-between">
          <span class="font-bold"> Tipo de Miembro: </span>
          <span>
            {{ (instance as Member)?.range }}
          </span>
        </p>
        <hr />
        <p class="text-inverted flex justify-between">
          <span class="font-bold"> Correo electrónico: </span>
          <a :href="`mailto:${(instance as Member)?.email}`">
            {{ (instance as Member)?.email }}
          </a>
        </p>
        <hr />
      </template>
      <p
        class="text-inverted flex justify-between"
        v-if="contactSource?.social?.website"
      >
        <span class="font-bold"> Sitio web: </span>
        <a :href="contactSource?.social?.website">
          {{ contactSource?.social?.website }}
        </a>
      </p>
      <hr />
      <UButton
        :to="detailPath"
        color="secondary"
        class="mx-auto"
      >
        Más información
      </UButton>
    </div>
  </UCard>
</template>
