<script setup lang="ts">
import type { FormSkill } from "~~/utils/forms";

const MAX_LEVEL = 10;

withDefaults(
  defineProps<{
    // Rows are edited in place; the parent form owns the array.
    skills: FormSkill[];
    title?: string;
    label?: string;
    placeholder?: string;
  }>(),
  { title: undefined, label: "Area", placeholder: "Skill name" },
);

// Stars render from highest to lowest so the CSS sibling selector can light up
// every star to the right of the hovered one.
const levels = Array.from({ length: MAX_LEVEL }, (_, index) => MAX_LEVEL - index);
</script>

<template>
  <h2 v-if="title" class="text-base font-semibold mb-3">{{ title }}</h2>
  <fieldset
    v-if="skills.length"
    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
  >
    <UFormField
      v-for="(skill, index) in skills"
      :key="`skill-${index}`"
      :label="label"
    >
      <UInput v-model="skill.name" :placeholder="placeholder" class="mb-4" />
      <ul class="flex flex-row-reverse justify-end gap-1">
        <li
          v-for="level in levels"
          :key="`skill-${index}-level-${level}`"
          class="cursor-pointer select-none"
          :aria-label="`Level ${level}`"
          @click="skill.level = level"
        >
          <UIcon
            name="mingcute-star-fill"
            class="transition-colors"
            :class="[
              skill.level >= level ? 'text-yellow-400' : 'text-gray-300',
              '[&:hover~li]:text-yellow-400 hover:text-yellow-400',
            ]"
          />
        </li>
      </ul>
    </UFormField>
  </fieldset>
</template>
