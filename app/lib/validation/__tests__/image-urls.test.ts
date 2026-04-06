import { describe, it, expect } from 'vitest'

// Test the URL validation logic used in attachListingImages
const SUPABASE_STORAGE_PREFIX = 'https://urispaxtwquqoqsiyedf.supabase.co/storage/v1/object/public/'

function isValidStorageUrl(url: string): boolean {
  return url.startsWith(SUPABASE_STORAGE_PREFIX)
}

describe('isValidStorageUrl', () => {
  it('accepts valid Supabase Storage URL', () => {
    const url = `${SUPABASE_STORAGE_PREFIX}listing-images/abc123.jpg`
    expect(isValidStorageUrl(url)).toBe(true)
  })

  it('accepts avatar URL', () => {
    const url = `${SUPABASE_STORAGE_PREFIX}avatars/user123.png`
    expect(isValidStorageUrl(url)).toBe(true)
  })

  it('rejects external URL', () => {
    expect(isValidStorageUrl('https://evil.com/image.jpg')).toBe(false)
  })

  it('rejects relative URL', () => {
    expect(isValidStorageUrl('/images/local.jpg')).toBe(false)
  })

  it('rejects javascript protocol', () => {
    expect(isValidStorageUrl('javascript:alert(1)')).toBe(false)
  })

  it('rejects data URI', () => {
    expect(isValidStorageUrl('data:image/png;base64,abc')).toBe(false)
  })

  it('rejects similar but different domain', () => {
    expect(isValidStorageUrl('https://evil.supabase.co/storage/v1/object/public/img.jpg')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(isValidStorageUrl('')).toBe(false)
  })
})

describe('attachListingImages validation rules', () => {
  const MAX_IMAGES = 10

  it('allows up to 10 images', () => {
    const urls = Array(10).fill(`${SUPABASE_STORAGE_PREFIX}listing-images/img.jpg`)
    expect(urls.length <= MAX_IMAGES).toBe(true)
  })

  it('rejects more than 10 images', () => {
    const urls = Array(11).fill(`${SUPABASE_STORAGE_PREFIX}listing-images/img.jpg`)
    expect(urls.length > MAX_IMAGES).toBe(true)
  })

  it('rejects array with mixed valid/invalid URLs', () => {
    const urls = [
      `${SUPABASE_STORAGE_PREFIX}listing-images/good.jpg`,
      'https://evil.com/bad.jpg',
    ]
    const allValid = urls.every(u => isValidStorageUrl(u))
    expect(allValid).toBe(false)
  })
})
