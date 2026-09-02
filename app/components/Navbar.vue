<script setup lang="ts">
defineOptions({ name: "AppNavbar" });

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
  <header
    class="bg-[linear-gradient(to_bottom,var(--ui-bg),var(--ui-bg-accented))]"
  >
    <UContainer>
      <nav class="flex items-center justify-between text-highlighted">
        <NuxtLink to="/">
          <NuxtImg
            src="/img/logo.png"
            alt="Logo"
            class="h-16 w-auto"
          />
        </NuxtLink>
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
