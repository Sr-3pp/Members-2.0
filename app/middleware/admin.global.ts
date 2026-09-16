import { isPanelPath } from "~~/shared/utils/auth";

export default defineNuxtRouteMiddleware(async (to) => {
  if (!isPanelPath(to.path)) return;
  const { refresh, user, isAdmin, error } = useAuth();
  await refresh();
  if (error.value) throw error.value;
  if (!user.value) return navigateTo({ path: "/login", query: { redirect: to.fullPath } });
  if (!isAdmin.value) throw createError({ statusCode: 403, statusMessage: "Admin access required" });
});
