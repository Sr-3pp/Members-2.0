<script setup lang="ts">
import type { TabsItem } from "@nuxt/ui/runtime/types/index.js";

const tabs = [
  { label: "Members", value: "members", slot: "members" },
  { label: "Enterprises", value: "enterprises", slot: "enterprises" },
  { label: "Programs", value: "programs", slot: "programs" },
] satisfies TabsItem[];
</script>

<template>
  <UContainer class="py-6">
    <h1 class="text-2xl font-bold mb-4">Panel</h1>
    <UTabs :items="tabs" default-value="members" class="w-full">
      <template #members><PanelRecords kind="members" /></template>
      <template #enterprises><PanelRecords kind="enterprises" /></template>
      <template #programs><PanelRecords kind="programs" /></template>
    </UTabs>
  </UContainer>
</template>
