const formatter = new Intl.DateTimeFormat('es-MX', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

/**
 * Formats a date as "21 ene 2026" using Mexican Spanish locale.
 */
export function formatDate(date: string | Date): string {
  return formatter.format(new Date(date))
}

/**
 * Formats a date as "21 ene" (without year) for compact contexts like message timestamps.
 */
export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(date))
}
