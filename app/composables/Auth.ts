import { authClient } from "~/lib/auth-client";
import { isAdminRole, type LoginInput } from "~~/shared/utils/auth";

type Session = typeof authClient.$Infer.Session;

export const useAuth = () => {
  // Nuxt shares this request state and hydrates it from the SSR payload.
  // useFetch also forwards the incoming cookies for this relative server URL.
  const session = useFetch<Session | null>("/api/auth/get-session", {
    key: "auth-session",
  });
  const user = computed(() => session.data.value?.user ?? null);
  const login = async (credentials: LoginInput) => {
    const { error } = await authClient.signIn.email(credentials);
    if (error) throw createError({ statusCode: error.status, message: error.message });
    await session.refresh();
    if (session.error.value) throw session.error.value;
  };
  const logout = async () => {
    const { error } = await authClient.signOut();
    if (error) throw createError({ statusCode: error.status, message: error.message });
    session.clear();
    await navigateTo("/login");
  };
  return {
    user,
    isLoggedIn: computed(() => !!user.value),
    isAdmin: computed(() => isAdminRole(user.value?.role)),
    ready: session,
    error: session.error,
    refresh: session.refresh,
    login,
    logout,
  };
};
