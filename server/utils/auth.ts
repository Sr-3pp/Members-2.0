import { createError, getHeader, getRequestURL, toWebRequest, type H3Event } from "h3";
import { getAuth } from "./betterAuth";
import { isAdminRole } from "../../shared/utils/auth";

export async function getAuthUser(event: H3Event) {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: toWebRequest(event).headers });
  return session?.user ?? null;
}

export async function requireAdmin(event: H3Event) {
  const user = await getAuthUser(event);
  if (!user) throw createError({ statusCode: 401, statusMessage: "Sign in required" });
  if (!isAdminRole(user.role)) throw createError({ statusCode: 403, statusMessage: "Admin access required" });
  return user;
}

// Better Auth handles CSRF for its own routes; this guards the directory write APIs.
export function requireSameOrigin(event: H3Event) {
  const origin = getHeader(event, "origin");
  if ((origin && origin !== getRequestURL(event).origin) || getHeader(event, "sec-fetch-site") === "cross-site") {
    throw createError({ statusCode: 403, statusMessage: "Cross-site request rejected" });
  }
}
