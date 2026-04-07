const MAX_QUERY_LENGTH = 100

/**
 * Remove characters that have meaning in PostgREST filter syntax.
 * Must be applied to ANY user input interpolated into .or() strings.
 */
export function sanitizeSearchQuery(q: string): string {
  return q
    .replace(/[(),%\\"'.*+?^${}|[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_QUERY_LENGTH)
}
