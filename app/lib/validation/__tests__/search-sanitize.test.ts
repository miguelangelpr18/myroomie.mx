import { describe, it, expect } from 'vitest'

// Extract the sanitizer logic to test it directly
const MAX_QUERY_LENGTH = 100

function sanitizeSearchQuery(q: string): string {
  return q
    .replace(/[(),%\\"'.*+?^${}|[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_QUERY_LENGTH)
}

describe('sanitizeSearchQuery', () => {
  it('passes through normal text', () => {
    expect(sanitizeSearchQuery('Monterrey centro')).toBe('Monterrey centro')
  })

  it('removes parentheses', () => {
    expect(sanitizeSearchQuery('cuarto(select)')).toBe('cuarto select')
  })

  it('removes percent signs', () => {
    expect(sanitizeSearchQuery('100%')).toBe('100')
  })

  it('removes quotes', () => {
    expect(sanitizeSearchQuery("cuarto 'amueblado\"")).toBe('cuarto amueblado')
  })

  it('removes backslashes', () => {
    expect(sanitizeSearchQuery('cuarto\\n')).toBe('cuarto n')
  })

  it('removes regex special chars', () => {
    expect(sanitizeSearchQuery('cuarto.*+?^${}|[]')).toBe('cuarto')
  })

  it('collapses whitespace', () => {
    expect(sanitizeSearchQuery('cuarto   en   monterrey')).toBe('cuarto en monterrey')
  })

  it('trims leading/trailing whitespace', () => {
    expect(sanitizeSearchQuery('  monterrey  ')).toBe('monterrey')
  })

  it('truncates to 100 chars', () => {
    const long = 'A'.repeat(150)
    expect(sanitizeSearchQuery(long).length).toBe(100)
  })

  it('handles PostgREST injection attempt', () => {
    const injection = 'test),city.eq.hacked,title.ilike.(%'
    const result = sanitizeSearchQuery(injection)
    expect(result).not.toContain(')')
    expect(result).not.toContain('(')
    expect(result).not.toContain('%')
  })

  it('handles empty string', () => {
    expect(sanitizeSearchQuery('')).toBe('')
  })

  it('preserves accented characters', () => {
    expect(sanitizeSearchQuery('Tecnológico')).toBe('Tecnológico')
  })

  it('preserves Spanish ñ', () => {
    expect(sanitizeSearchQuery('Peña')).toBe('Peña')
  })
})
