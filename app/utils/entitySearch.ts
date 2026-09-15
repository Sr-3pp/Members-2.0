/** Filters accepted by every entity search endpoint. */
export interface EntitySearchFilters {
  name?: string;
  country?: string;
  category?: string;
}

export type EntitySearchEndpoint =
  | "/api/members/search"
  | "/api/enterprises/search"
  | "/api/programs/search";

/**
 * Single place where search filters become a request, so the three entity
 * searches stay in step. Blank values are dropped rather than sent as empty
 * strings, which the endpoints would otherwise treat as a filter.
 */
export const fetchEntitySearch = <T>(
  endpoint: EntitySearchEndpoint,
  filters: EntitySearchFilters,
) =>
  $fetch<T[]>(endpoint, {
    query: {
      name: filters.name || undefined,
      country: filters.country || undefined,
      category: filters.category || undefined,
    },
  });
