<script setup lang="ts">
import type { Member } from "~~/server/models/Member";
import type { Enterprise } from "~~/server/models/Enterprise";

const bgByCategory: {
  consultor: string;
  coach: string;
  capacitador: string;
  "certificaciones-especiales": string;
  enterprise: string;
} = {
  consultor: "bg-consultor",
  coach: "bg-coach",
  capacitador: "bg-capacitador",
  "certificaciones-especiales": "bg-certificaciones-especiales",
  enterprise: "bg-enterprise",
};

const {member, enterprise} = defineProps<{
  category: keyof typeof bgByCategory;
  member?: Member;
  enterprise?: Enterprise;
}>();

const instance = computed<Member | Enterprise | null>(() => member ?? enterprise ?? null);
const isMember = computed(() => !!member);
const displayLastName = computed(() =>
  isMember.value ? member?.last_name ?? "" : "",
);
const detailPath = computed(() => {
  if (!instance.value) return "#";
  const baseName = (instance.value.name ?? "").toLowerCase().replace(/ /g, "_");
  const lastSlug = displayLastName.value
    ? `_${displayLastName.value.toLowerCase().replace(/ /g, "_")}`
    : "";
  return `/${member ? 'member/' : 'enterprise/'}${instance.value._id}/${baseName}${lastSlug}`;
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
          :src="instance?.picture as string"
          :alt="`picture of ${instance?.name || ''} ${displayLastName}`"
        />
        <span
          class="p-1 border-1 border-black rounded-full flex-shring-0 -mt-6 overflow-hidden"
        >
          <NuxtImg
            class="size-8 object-cover rounded-full"
            :src="instance?.country?.flag || ''"
          />
        </span>
      </figure>

      <div class="flex flex-col gap-2 ml-auto text-right">
        <h3 class="font-bold text-lg">
          {{ instance?.name }} {{ displayLastName }}
        </h3>
        <ul class="flex justify-end gap-2">
          <template v-for="(social, key) in instance?.social">
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
          {{ instance?.folio }}
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
        v-if="instance?.social?.website"
      >
        <span> Website: </span>
        <span>
          {{ instance?.social?.website }}
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
