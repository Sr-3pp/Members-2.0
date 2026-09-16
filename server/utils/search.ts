import type { H3Event } from "h3";
import { optionalQueryString, queryLimit } from "./request";

export interface SearchFilters {
  query?: string;
  country?: string;
  category?: string;
  status?: string;
  limit?: number;
}

export function normalizeSearchFilters(filters: SearchFilters): SearchFilters {
  return {
    query: filters.query?.trim() || undefined,
    country: filters.country?.trim().toUpperCase() || undefined,
    category: filters.category?.trim() || undefined,
    status: filters.status?.trim() || undefined,
    limit: Math.min(Math.max(Math.trunc(filters.limit ?? 20), 1), 100),
  };
}

export function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Country codes are not stored with a consistent case (existing records hold both
 * "mx" and "MX"), so compare them case-insensitively rather than by exact match.
 */
export function countryCodeFilter(code: string) {
  return { $regex: `^${escapeRegex(code)}$`, $options: "i" };
}

/** The filter set every entity search endpoint accepts, read off the query string. */
export function searchFiltersFromQuery(event: H3Event): SearchFilters {
  const query = getQuery(event);

  return {
    query: optionalQueryString(query.name) ?? optionalQueryString(query.q),
    country: optionalQueryString(query.country),
    category: optionalQueryString(query.category),
    status: optionalQueryString(query.status),
    limit: queryLimit(query.limit),
  };
}

// Letters that users type with or without accents. Each letter in a group is
// matched by a character class covering the whole group, in both cases, so the
// query and the stored value can differ in accents and still match.
const ACCENT_GROUPS = ["aáàäâã", "eéèëê", "iíìïî", "oóòöôõ", "uúùüû", "nñ", "cç"];
const ACCENT_CLASS = new Map<string, string>();
for (const group of ACCENT_GROUPS) {
  const characterClass = `[${group}${group.toUpperCase()}]`;
  for (const letter of group) ACCENT_CLASS.set(letter, characterClass);
}

/** Regex source that matches `value` as a substring regardless of accents on either side. */
export function accentInsensitivePattern(value: string) {
  return Array.from(escapeRegex(value))
    .map((char) => ACCENT_CLASS.get(char.toLowerCase()) ?? char)
    .join("");
}

/** Case- and accent-insensitive "contains" conditions across several fields, for a `$or` clause. */
export function textSearchConditions(query: string, fields: string[]) {
  const pattern = accentInsensitivePattern(query);
  return fields.map((field) => ({ [field]: { $regex: pattern, $options: "i" } }));
}
