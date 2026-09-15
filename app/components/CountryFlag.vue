<script setup lang="ts">
import type { Country } from "~~/shared/types/entities";
import { flagUrl } from "~~/shared/utils/countries";

/**
 * Flags are served by the `/api/flags` route, which Nuxt Image cannot process
 * (IPX only reads static files), so they always render through a plain <img>.
 * The URL is derived from the country code so even records that still store a
 * provider URL go through the local cache.
 */
const props = defineProps<{ country?: Country | null }>();

const src = computed(() => {
  const code = props.country?.code;
  return code ? flagUrl(code) : props.country?.flag || "";
});
const alt = computed(() =>
  props.country?.name ? `Flag of ${props.country.name}` : "",
);
</script>

<template>
  <img v-if="src" :src="src" :alt="alt" loading="lazy" />
</template>
