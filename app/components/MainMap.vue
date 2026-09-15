<script lang="ts" setup>
import { searchCategoryOptions, type SearchCategory } from "~~/shared/utils/categories";

const mapElement = ref<HTMLElement | null>(null);
const markerSize = 420;
// Mirrors --map-tilt in Map.vue: how far the surface rotates away from the viewer.
const mapTilt = 55;
const continents = ["NorthAmerica", "SouthAmerica", "Europe", "Africa", "Asia", "Australia"];
const { width: mapWidth } = useElementSize(mapElement);

// Once counter-rotated, a marker spans +/- (height / 2 * sin(tilt)) along the surface
// normal. Lifting it by that much rests its bottom edge on the map instead of letting
// its lower half sink behind the plane.
const markerLift = computed(
  () => (mapWidth.value * markerSize) / 7084 / 2 * Math.sin((mapTilt * Math.PI) / 180),
);

const markers = ref<Array<{
  category: SearchCategory;
  x: number;
  y: number;
  delay: number;
  floatDuration: number;
}>>([]);

onMounted(() => {
  // Sample the map's land dots in SVG coordinates so markers follow its tilt and size.
  const availableCategories = searchCategoryOptions.map(({ value }) => value);
  for (const [index, continent] of continents.entries()) {
    const dots = Array.from(mapElement.value?.querySelectorAll<SVGPathElement>(
      `#continents #${continent} path`,
    ) ?? []);
    if (!dots.length) continue;

    const positions = dots.map((dot) => {
      const bounds = dot.getBBox();
      return { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
    }).filter(({ x, y }) =>
      x > markerSize / 2 && x < 7084 - markerSize / 2 &&
      y > markerSize / 2 && y < 3838 - markerSize / 2 &&
      markers.value.every((marker) => Math.hypot(marker.x - x, marker.y - y) > markerSize),
    );
    const position = positions[Math.floor(Math.random() * positions.length)];
    if (!position) continue;

    const [category] = availableCategories.splice(Math.floor(Math.random() * availableCategories.length), 1);
    if (!category) continue;
    markers.value.push({
      category,
      ...position,
      delay: 1400 + index * 160,
      floatDuration: 2800 + Math.random() * 1200,
    });
  }
});
</script>

<template>
  <div ref="mapElement" class="w-full sm:w-2/3 mx-auto">
    <Map :with-pins="false" continent="">
      <template #markers>
        <div
          v-for="marker in markers"
          :key="marker.category"
          class="map-marker"
          aria-hidden="true"
          :style="{
            left: `${marker.x / 7084 * 100}%`,
            top: `${marker.y / 3838 * 100}%`,
            width: `${markerSize / 7084 * 100}%`,
            '--marker-lift': `${markerLift}px`,
            '--marker-delay': `${marker.delay}ms`,
            '--float-duration': `${marker.floatDuration}ms`,
          }"
        >
          <div class="marker-enter">
            <div class="marker-float">
              <CategoryIcon class="size-full !p-[8%]" :category="marker.category" />
            </div>
          </div>
        </div>
      </template>
    </Map>
  </div>
</template>

<style scoped>
.map-marker {
  position: absolute;
  z-index: 1;
  aspect-ratio: 1;
  /* Raise clear of the tilted surface, then counter the tilt so the icon faces the
     viewer. The lift must come first so it follows the map's normal, not the marker's
     own rotated axis; without it the marker sits inside the plane and its lower half
     renders behind the map's dots. */
  transform: translate(-50%, -50%) translateZ(var(--marker-lift, 0px))
    rotateX(calc(-1 * var(--map-tilt, 0deg)));
  transition: var(--map-transition);
  pointer-events: none;
}

.marker-enter,
.marker-float {
  width: 100%;
  height: 100%;
}

.marker-enter {
  animation: marker-enter 700ms cubic-bezier(0.22, 1, 0.36, 1) var(--marker-delay) both;
}

.marker-float {
  animation: marker-float var(--float-duration) ease-in-out calc(var(--marker-delay) + 700ms) infinite;
}

@keyframes marker-enter {
  0% { opacity: 0; transform: translateY(14px) scale(0.3); }
  65% { opacity: 1; transform: translateY(-2px) scale(1.12); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes marker-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

@media (prefers-reduced-motion: reduce) {
  .marker-enter,
  .marker-float {
    animation: none;
  }
}
</style>
