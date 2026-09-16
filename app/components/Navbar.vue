<script setup lang="ts">
defineOptions({ name: "AppNavbar" });

const { isAdmin, logout, ready } = useAuth();
await ready;

// Marketing pages live on the main ICCN site and open in a new tab;
// "Miembros" is this app.
type NavLink = { label: string; to: string; target?: "_blank" };
const { mainSiteUrl } = useRuntimeConfig().public;
const mainSite = (label: string, path: string): NavLink => ({ label, to: `${mainSiteUrl}${path}`, target: "_blank" });
const links = computed<NavLink[]>(() => [
  mainSite("¿Qué es la ICCN?", "/blank-ekhzj"),
  mainSite("Membresías", "/blank-luchn"),
  mainSite("Programas", "/b"),
  { label: "Miembros", to: "/" },
  mainSite("Blog", "/blank-1"),
  mainSite("Contacto", "/formulario"),
  ...(isAdmin.value ? [{ label: "Panel", to: "/panel" }] : []),
]);

const menuOpen = ref(false);
const route = useRoute();
watch(() => route.fullPath, () => {
  menuOpen.value = false;
});

const signingOut = ref(false);
const toast = useToast();
async function signOut() {
  signingOut.value = true;
  try {
    await logout();
  } catch {
    toast.add({ title: "Could not sign out. Please try again.", color: "error" });
  } finally {
    signingOut.value = false;
  }
}
</script>

<template>
  <header
    class="text-white bg-[linear-gradient(to_bottom,var(--ui-bg),var(--ui-bg-accented))]"
  >
    <UContainer class="py-0 sm:py-0 lg:py-0">
      <nav
        class="flex items-center justify-between gap-6 py-6 lg:py-10"
        aria-label="Principal"
      >
        <NuxtLink to="/" class="shrink-0">
          <NuxtImg
            src="/img/logo.png"
            alt="ICCN - International Coaching & Consulting Network"
            class="h-14 w-auto lg:h-20"
          />
        </NuxtLink>

        <ul class="hidden items-stretch lg:flex">
          <li
            v-for="item in links"
            :key="`navbar-item-${item.label}`"
            class="flex border-l border-white/20 first:border-l-0"
          >
            <NuxtLink
              :to="item.to"
              :target="item.target"
              class="flex items-center px-5 py-6 text-lg text-white transition-colors hover:text-white/70 focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white"
            >
              {{ item.label }}
            </NuxtLink>
          </li>
          <li v-if="isAdmin" class="flex border-l border-white/20">
            <UButton
              icon="tabler-logout"
              variant="ghost"
              color="neutral"
              class="my-auto ml-5 text-white hover:bg-white/10"
              aria-label="Cerrar sesión"
              :loading="signingOut"
              @click="signOut"
            />
          </li>
        </ul>

        <USlideover v-model:open="menuOpen" title="Menú">
          <UButton
            icon="tabler-menu-2"
            variant="ghost"
            color="neutral"
            size="xl"
            class="text-white hover:bg-white/10 lg:hidden"
            aria-label="Abrir menú"
          />

          <template #body>
            <ul class="flex flex-col divide-y divide-default">
              <li v-for="item in links" :key="`navbar-mobile-item-${item.label}`">
                <NuxtLink :to="item.to" :target="item.target" class="block py-4 text-lg">
                  {{ item.label }}
                </NuxtLink>
              </li>
              <li v-if="isAdmin" class="pt-4">
                <UButton
                  icon="tabler-logout"
                  variant="ghost"
                  color="neutral"
                  :loading="signingOut"
                  @click="signOut"
                >
                  Cerrar sesión
                </UButton>
              </li>
              <li v-else>
                <NuxtLink to="/login" class="block py-4 text-lg">Iniciar sesión</NuxtLink>
              </li>
            </ul>
          </template>
        </USlideover>
      </nav>
    </UContainer>
  </header>
</template>
