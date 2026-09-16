import type { SearchPage } from "~~/shared/types/search";
import type { MemberCategory } from "~~/shared/utils/categories";

/** Filters accepted by every entity search endpoint. */
export interface EntitySearchFilters {
  name?: string;
  country?: string;
  category?: string;
  status?: string;
  /** Rows to skip before the page starts. */
  skip?: number;
  /** Rows per page; the server falls back to its own default when omitted. */
  limit?: number;
}

/** A member search as submitted from the landing form; no category means every member category. */
export interface EntitySearchRequest {
  name?: string;
  country?: string;
  category?: MemberCategory;
}

/** Results the search wizard reveals per request. */
export const SEARCH_PAGE_SIZE = 4;

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
  $fetch<SearchPage<T>>(endpoint, {
    query: {
      name: filters.name || undefined,
      country: filters.country || undefined,
      category: filters.category || undefined,
      status: filters.status || undefined,
      skip: filters.skip || undefined,
      limit: filters.limit || undefined,
    },
  });
