/**
 * One page of a search: the rows inside the requested window plus the size of
 * the whole match, so a client can tell whether more pages remain.
 */
export interface SearchPage<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}
