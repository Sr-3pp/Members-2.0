<script setup lang="ts">
import type { AuthFormField, FormSubmitEvent } from "@nuxt/ui";
import { isPanelPath, loginSchema, type LoginInput } from "~~/shared/utils/auth";

useHead({ title: "Admin login · Members Directory" });
const route = useRoute();
const { login, ready, error: sessionError, isAdmin } = useAuth();
const loading = ref(false);
const error = ref("");
const fields: AuthFormField[] = [
  { name: "email", type: "email", label: "Email", placeholder: "you@example.com", autocomplete: "username", required: true },
  { name: "password", type: "password", label: "Password", placeholder: "Enter your password", autocomplete: "current-password", required: true },
];
const destination = computed(() => {
  const redirect = route.query.redirect;
  return typeof redirect === "string" && !redirect.includes("\\") && isPanelPath(redirect.split(/[?#]/)[0]!) ? redirect : "/panel";
});
await ready;
if (sessionError.value) error.value = "Unable to load your session. Please try signing in.";
if (isAdmin.value) await navigateTo(destination.value, { replace: true });

async function onSubmit(event: FormSubmitEvent<LoginInput>) {
  if (loading.value) return;
  loading.value = true;
  error.value = "";
  try {
    await login(event.data);
    await navigateTo(destination.value, { replace: true });
  } catch (cause) {
    const status = (cause as { statusCode?: number }).statusCode;
    error.value = status === 401 ? "Invalid email or password."
      : status === 403 ? "Only administrators can access the panel."
      : status === 429 ? "Too many attempts. Please try again later."
      : "Unable to sign in. Please try again.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <UContainer class="flex min-h-[70vh] items-center justify-center py-12">
    <UCard class="w-full max-w-md">
      <UAuthForm
        :schema="loginSchema"
        :fields="fields"
        :loading="loading"
        :disabled="loading"
        title="Admin login"
        description="Sign in to manage the members directory."
        icon="i-lucide-lock-keyhole"
        :submit="{ label: 'Sign in' }"
        @submit="onSubmit"
      >
        <template #validation>
          <UAlert v-if="error" color="error" variant="subtle" :title="error" role="alert" />
        </template>
        <template #footer>
          <p class="text-center text-sm text-muted">Access is restricted to administrators.</p>
        </template>
      </UAuthForm>
    </UCard>
  </UContainer>
</template>
