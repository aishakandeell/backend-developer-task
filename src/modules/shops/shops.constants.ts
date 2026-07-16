/**
 * Allowed shop availability values. Business rule: a shop's availability is one
 * of busy, open, or closed. Single source of truth reused by validation DTOs,
 * query filters, and the model.
 */
export const AVAILABILITY = ['busy', 'open', 'closed'] as const;

export type Availability = (typeof AVAILABILITY)[number];
