<script setup lang="ts">
import type { Enterprise, Member, Program } from "~~/shared/types/entities";

const bgByCategory: {
  consultor: string;
  coach: string;
  capacitador: string;
  "certificaciones-especiales": string;
  program: string;
  enterprise: string;
} = {
  consultor: "bg-consultor",
  coach: "bg-coach",
  capacitador: "bg-capacitador",
  "certificaciones-especiales": "bg-certificaciones-especiales",
  program: "bg-program",
  enterprise: "bg-enterprise",
};

const { member, enterprise, program } = defineProps<{
  category: keyof typeof bgByCategory;
  member?: Member;
  enterprise?: Enterprise;
  program?: (Program & { enterprise?: Enterprise | null }) | null;
}>();

type ProgramWithEnterprise = Program & { enterprise?: Enterprise | null };
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
const displayFlag = computed(() => {
  if (isProgram.value) return programEnterprise.value?.country?.flag ?? "";
  const base = instance.value as Member | Enterprise | null;
  return base?.country?.flag ?? "";
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
  <article v-if="instance" class="mt-8 bg-white">
    <div
      class="flex relative p-6"
      :class="bgByCategory[category as keyof typeof bgByCategory]"
    >
      <figure
        class="flex justify-center items-center absolute bottom-full right-0 gap-2 h-10 px-6 py-4"
        :class="`bg-${category}`"
      >
        <figcaption class="capitalize">
          {{ category!.replace(/-/g, " ") }}
        </figcaption>
        <NuxtImg
          class="size-8"
          :src="`/img/categories/${category}.png`"
          :alt="`category ${category} image`"
        />
      </figure>
      <figure class="relative flex flex-col items-center w-2/8 -mt-16">
        <NuxtImg
          class="p-2 bg-white rounded-full"
          :src="displayPicture"
          :alt="`picture of ${displayName}`"
        />
        <span
          class="p-1 border-1 border-black rounded-full flex-shring-0 -mt-6 overflow-hidden"
        >
          <NuxtImg
            class="size-8 object-cover rounded-full"
            :src="displayFlag || ''"
          />
        </span>
      </figure>

      <div class="flex flex-col gap-2 ml-auto text-right">
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

    <div class="px-6 pb-6 pt-4 flex flex-col gap-3">
      <p class="text-black flex justify-between">
        <span> Folio: </span>
        <span>
          {{ contactSource?.folio }}
        </span>
      </p>
      <hr />
      <template v-if="isMember">
        <p class="text-black flex justify-between">
          <span> instance.Type: </span>
          <span>
            {{ (instance as Member)?.range }}
          </span>
        </p>
        <hr />
        <p class="text-black flex justify-between">
          <span> E-mail: </span>
          <span>
            {{ (instance as Member)?.email }}
          </span>
        </p>
        <hr />
      </template>
      <p
        class="text-black flex justify-between"
        v-if="contactSource?.social?.website"
      >
        <span> Website: </span>
        <span>
          {{ contactSource?.social?.website }}
        </span>
      </p>
      <hr />
      <UButton
        :to="detailPath"
        color="primary"
        class="mx-auto"
      >
        More Info
      </UButton>
    </div>
  </article>
</template>
