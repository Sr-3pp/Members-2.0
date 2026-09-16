import type { H3Event } from "h3";
import type { SearchPage } from "~~/shared/types/search";
import { optionalQueryString, queryInteger } from "./request";

/** Filters as they arrive from a caller; the page window is optional here. */
export interface SearchFilters {
  query?: string;
  country?: string;
  category?: string;
  status?: string;
  skip?: number;
  limit?: number;
}

/** Filters after normalization: trimmed, and with a page window inside the server bounds. */
export type SearchQuery = SearchFilters & { skip: number; limit: number };

export const DEFAULT_PAGE_LIMIT = 20;
export const MAX_PAGE_LIMIT = 100;

export function normalizeSearchFilters(filters: SearchFilters): SearchQuery {
  return {
    query: filters.query?.trim() || undefined,
    country: filters.country?.trim().toUpperCase() || undefined,
    category: filters.category?.trim() || undefined,
    status: filters.status?.trim() || undefined,
    skip: Math.max(filters.skip ?? 0, 0),
    limit: Math.min(Math.max(filters.limit ?? DEFAULT_PAGE_LIMIT, 1), MAX_PAGE_LIMIT),
  };
}

/**
 * Runs a search as one page: the rows of the requested window alongside the
 * total match count, which is what a "load more" control needs to know when to
 * stop. Both queries run concurrently. `find` must apply a fixed sort, since
 * skip/limit windows only line up between requests over a stable order.
 */
export async function searchPage<T>(
  find: () => Promise<T[]>,
  count: () => Promise<number>,
  { skip, limit }: Pick<SearchQuery, "skip" | "limit">,
): Promise<SearchPage<T>> {
  const [items, total] = await Promise.all([find(), count()]);
  return { items, total, skip, limit };
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
    skip: queryInteger(query.skip, 0),
    limit: queryInteger(query.limit, DEFAULT_PAGE_LIMIT),
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
