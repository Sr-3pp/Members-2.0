<script setup lang="ts">
import type { CSSProperties } from "vue";

defineOptions({ name: "AppParallax" });

const props = withDefaults(defineProps<{
  image: string;
  speed?: number;
  maxOffset?: number;
}>(), {
  speed: 0.12,
  maxOffset: 72,
});

const { y } = useWindowScroll();

const parallaxStyle = computed<CSSProperties>(() => ({
  backgroundImage: `url("${props.image}")`,
  "--parallax-offset": `${Math.min(y.value * props.speed, props.maxOffset)}px`,
}));
</script>

<template>
  <section class="parallax" :style="parallaxStyle">
    <slot />
  </section>
</template>

<style scoped>
.parallax {
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center calc(100% + var(--parallax-offset, 0px));
  will-change: background-position;
}

@media (prefers-reduced-motion: reduce) {
  .parallax {
    background-position: center bottom;
    will-change: auto;
  }
}
</style>
