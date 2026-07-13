/**
 * Allowed member genders. Business rule: a member's gender is male or female only.
 * Single source of truth reused by validation DTOs and query filters.
 */
export const GENDERS = ['male', 'female'] as const;

export type Gender = (typeof GENDERS)[number];
