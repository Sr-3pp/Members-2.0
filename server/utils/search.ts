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

/** Case-insensitive "contains" conditions across several fields, for a `$or` clause. */
export function textSearchConditions(query: string, fields: string[]) {
  const escaped = escapeRegex(query);
  return fields.map((field) => ({ [field]: { $regex: escaped, $options: "i" } }));
}
