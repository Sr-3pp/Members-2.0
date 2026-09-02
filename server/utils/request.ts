import type { H3Event } from "h3";

export function requireRouterParam(
  event: H3Event,
  name: string,
  label = name,
) {
  const value = getRouterParam(event, name)?.trim();

  if (!value) {
    throw createError({
      statusCode: 400,
      statusMessage: `${label} is required`,
    });
  }

  return value;
}

export function optionalQueryString(value: unknown) {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized || undefined;
}

export function queryLimit(value: unknown, fallback = 20) {
  const parsed = typeof value === "string" ? Number(value) : fallback;
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(Math.trunc(parsed), 1), 100);
}
