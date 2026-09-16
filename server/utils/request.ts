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

/** A whole number read off the query string; anything unusable falls back. */
export function queryInteger(value: unknown, fallback: number) {
  const parsed = typeof value === "string" ? Number(value) : fallback;
  return Number.isFinite(parsed) ? Math.trunc(parsed) : fallback;
}
