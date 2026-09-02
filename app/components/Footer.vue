<script setup lang="ts">
defineOptions({ name: "AppFooter" });

const social = [
  {
    name: "Facebook",
    url: "https://www.facebook.com/International-Coaching-Consulting-Network-ICCN-100882187155091",
    icon: "tabler-brand-facebook",
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/iccn_network/",
    icon: "tabler-brand-instagram",
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/company/iccn-network/",
    icon: "tabler-brand-linkedin",
  },
];
</script>

<template>
  <footer
    class="h-[400px] flex bg-[radial-gradient(circle_at_center,var(--ui-bg-accented)_0%,var(--ui-bg)_100%)]"
  >
    <UContainer class="py-6 text-center my-auto">
      <p class="text-xl text-gray-300">
        International Coaching & Consulting Network
      </p>
      <USeparator class="my-6 max-w-xl mx-auto" :ui="{border: 'border-white'}"  />
      <ul class="flex justify-center gap-6">
        <li v-for="item in social" :key="`footer-social-list-${item.name}`">
          <a :href="item.url" target="_blank" rel="noopener noreferrer" class="text-gray-300">
            <UIcon :name="item.icon" class="size-6" />
            <span class="sr-only">{{ item.name }}</span>
          </a>
        </li>
      </ul>
    </UContainer>
  </footer>
</template>
