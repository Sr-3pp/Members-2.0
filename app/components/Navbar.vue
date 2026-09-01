<script setup lang="ts">
const navigation = [
  { title: "Home", path: "/" },
  { title: "Members", path: "/members" },
  { title: "Add Member", path: "/members/add", isAuth: true },
  { title: "Login", path: "/login" },
  { title: "Register", path: "/register" },
];

const { isLoggedIn } = useAuth();
</script>

<template>
  <header class="bg-blue-600">
    <UContainer>
      <nav class="flex items-center justify-between p-4 text-white">
        <NuxtLink to="/">My Nuxt App</NuxtLink>
        <ul class="flex items-center gap-4">
          <template v-for="item in navigation">
            <li
              v-if="item.isAuth ? (!isLoggedIn ? false : true) : true"
              :key="`navbar-item-${item.title}`"
            >
              <NuxtLink :to="item.path">{{ item.title }}</NuxtLink>
            </li>
          </template>
        </ul>
      </nav>
    </UContainer>
  </header>
</template>
