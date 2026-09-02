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
