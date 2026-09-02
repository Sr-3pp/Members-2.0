export function requireEntity<T>(value: T | null | undefined, label: string): T {
  if (!value) {
    throw createError({
      statusCode: 404,
      statusMessage: `${label} not found`,
    });
  }

  return value;
}
