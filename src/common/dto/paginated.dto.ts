/**
 * Generic wrapper for a paginated list response.
 * Carries the current page of items plus the metadata a client needs to
 * navigate the rest of the data (e.g. render "Page 1 of 5" or load more).
 */
export class PaginatedDTO<T> {
  /** The items for the current page. */
  data: T[];

  /** 1-based page number that was returned. */
  page: number;

  /** Maximum number of items per page. */
  limit: number;

  /** Total number of items across all pages. */
  total: number;

  /** Total number of pages available for the current limit. */
  totalPages: number;
}
