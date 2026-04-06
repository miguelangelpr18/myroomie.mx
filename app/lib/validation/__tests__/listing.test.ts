import { describe, it, expect } from 'vitest'
import { validateListingInput } from '../listing'

const validListing = {
  title: 'Cuarto amueblado en Monterrey',
  description: 'Cuarto amplio con baño privado, cerca del Tec de Monterrey. Incluye servicios básicos.',
  city: 'Monterrey',
  zone: 'Tecnológico',
  price_mxn: 5000,
  listing_type: 'room' as const,
}

describe('validateListingInput', () => {
  it('accepts valid listing', () => {
    const result = validateListingInput(validListing)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.title).toBe(validListing.title)
      expect(result.data.price_mxn).toBe(5000)
    }
  })

  it('trims whitespace from strings', () => {
    const result = validateListingInput({
      ...validListing,
      title: '  Cuarto amueblado en Monterrey  ',
    })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.title).toBe('Cuarto amueblado en Monterrey')
    }
  })

  // Title validation
  it('rejects title shorter than 10 chars', () => {
    const result = validateListingInput({ ...validListing, title: 'Corto' })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toContain('título')
  })

  it('rejects title longer than 80 chars', () => {
    const result = validateListingInput({ ...validListing, title: 'A'.repeat(81) })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toContain('título')
  })

  // Description validation
  it('rejects description shorter than 30 chars', () => {
    const result = validateListingInput({ ...validListing, description: 'Muy corta' })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toContain('descripción')
  })

  it('rejects description longer than 2000 chars', () => {
    const result = validateListingInput({ ...validListing, description: 'A'.repeat(2001) })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toContain('descripción')
  })

  // Price validation
  it('accepts null price', () => {
    const result = validateListingInput({ ...validListing, price_mxn: null })
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data.price_mxn).toBeNull()
  })

  it('rejects price below 500', () => {
    const result = validateListingInput({ ...validListing, price_mxn: 200 })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toContain('500')
  })

  it('rejects price above 80000', () => {
    const result = validateListingInput({ ...validListing, price_mxn: 100000 })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toContain('80')
  })

  it('rejects non-integer price', () => {
    const result = validateListingInput({ ...validListing, price_mxn: 5000.5 })
    expect(result.ok).toBe(false)
  })

  // Listing type
  it('rejects invalid listing_type', () => {
    const result = validateListingInput({ ...validListing, listing_type: 'house' })
    expect(result.ok).toBe(false)
  })

  it('accepts roommate listing_type', () => {
    const result = validateListingInput({ ...validListing, listing_type: 'roommate' })
    expect(result.ok).toBe(true)
  })

  // City/zone without location_id
  it('rejects empty city without location_id', () => {
    const result = validateListingInput({ ...validListing, city: '' })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toContain('ciudad')
  })

  it('rejects empty zone without location_id', () => {
    const result = validateListingInput({ ...validListing, zone: '' })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toContain('zona')
  })

  // With location_id
  it('allows empty city when location_id is provided', () => {
    const result = validateListingInput({
      ...validListing,
      city: '',
      location_id: 'place.123456789012',
    })
    expect(result.ok).toBe(true)
  })

  it('requires zone when location_id is provided', () => {
    const result = validateListingInput({
      ...validListing,
      zone: '',
      location_id: 'place.123456789012',
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toContain('zona')
  })

  // Optional fields
  it('accepts listing_subtype solo_renta', () => {
    const result = validateListingInput({
      ...validListing,
      listing_subtype: 'solo_renta',
    })
    expect(result.ok).toBe(true)
  })

  it('accepts amenities array', () => {
    const result = validateListingInput({
      ...validListing,
      amenities: ['wifi', 'estacionamiento'],
    })
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data.amenities).toEqual(['wifi', 'estacionamiento'])
  })

  // Edge cases
  it('rejects empty input', () => {
    const result = validateListingInput({})
    expect(result.ok).toBe(false)
  })
})
