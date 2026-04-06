import { describe, it, expect } from 'vitest'
import { validateProfileInput, validateProfileLifestyleInput } from '../profile'

const validProfile = {
  display_name: 'Miguel Peña',
  city: 'Monterrey',
  zone: 'Tecnológico',
}

describe('validateProfileInput', () => {
  it('accepts valid profile', () => {
    const result = validateProfileInput(validProfile)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.display_name).toBe('Miguel Peña')
    }
  })

  it('trims whitespace', () => {
    const result = validateProfileInput({ ...validProfile, display_name: '  Miguel  ' })
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data.display_name).toBe('Miguel')
  })

  // Display name
  it('rejects display_name shorter than 2 chars', () => {
    const result = validateProfileInput({ ...validProfile, display_name: 'A' })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toContain('nombre')
  })

  it('rejects display_name longer than 40 chars', () => {
    const result = validateProfileInput({ ...validProfile, display_name: 'A'.repeat(41) })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toContain('nombre')
  })

  // City/zone with requireCityZone
  it('requires city when requireCityZone is true', () => {
    const result = validateProfileInput(
      { ...validProfile, city: '' },
      { requireCityZone: true }
    )
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toContain('ciudad')
  })

  it('requires zone when requireCityZone is true', () => {
    const result = validateProfileInput(
      { ...validProfile, zone: '' },
      { requireCityZone: true }
    )
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toContain('zona')
  })

  it('allows empty city/zone without requireCityZone', () => {
    const result = validateProfileInput({
      display_name: 'Miguel Peña',
      city: '',
      zone: '',
    })
    expect(result.ok).toBe(true)
  })

  // Bio
  it('accepts valid bio', () => {
    const result = validateProfileInput({
      ...validProfile,
      bio: 'Soy estudiante del Tec de Monterrey, busco roomie tranquilo.',
    })
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data.bio).toContain('estudiante')
  })

  it('rejects bio shorter than 30 chars', () => {
    const result = validateProfileInput({
      ...validProfile,
      bio: 'Muy corta',
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toContain('bio')
  })

  it('rejects bio longer than 400 chars', () => {
    const result = validateProfileInput({
      ...validProfile,
      bio: 'A'.repeat(401),
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toContain('bio')
  })

  it('treats empty bio as null', () => {
    const result = validateProfileInput({ ...validProfile, bio: '' })
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data.bio).toBeNull()
  })

  // Age
  it('accepts valid age', () => {
    const result = validateProfileInput({ ...validProfile, age: 25 })
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data.age).toBe(25)
  })

  it('rejects age below 18', () => {
    const result = validateProfileInput({ ...validProfile, age: 16 })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toContain('edad')
  })

  it('rejects age above 99', () => {
    const result = validateProfileInput({ ...validProfile, age: 100 })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toContain('edad')
  })

  it('accepts null age', () => {
    const result = validateProfileInput({ ...validProfile, age: null })
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data.age).toBeNull()
  })

  // Location ID
  it('requires location_id when requireLocationId is true', () => {
    const result = validateProfileInput(
      { ...validProfile, location_id: '' },
      { requireLocationId: true }
    )
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toContain('ubicación')
  })

  it('accepts valid location_id', () => {
    const result = validateProfileInput(
      { ...validProfile, location_id: 'place.123456789012' },
      { requireLocationId: true }
    )
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data.location_id).toBe('place.123456789012')
  })

  // Avatar
  it('normalizes empty avatar_url to null', () => {
    const result = validateProfileInput({ ...validProfile, avatar_url: '' })
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data.avatar_url).toBeNull()
  })

  // Edge cases
  it('rejects empty input', () => {
    const result = validateProfileInput({})
    expect(result.ok).toBe(false)
  })
})

describe('validateProfileLifestyleInput', () => {
  const validLifestyle = {
    pets: true,
    smoker: false,
    parties: false,
    cleanliness: 2,
    schedule: 'day',
  }

  it('accepts valid lifestyle', () => {
    const result = validateProfileLifestyleInput(validLifestyle)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.pets).toBe(true)
      expect(result.data.smoker).toBe(false)
      expect(result.data.cleanliness).toBe(2)
      expect(result.data.schedule).toBe('day')
    }
  })

  it('accepts night schedule', () => {
    const result = validateProfileLifestyleInput({ ...validLifestyle, schedule: 'night' })
    expect(result.ok).toBe(true)
  })

  it('rejects invalid schedule', () => {
    const result = validateProfileLifestyleInput({ ...validLifestyle, schedule: 'mixed' })
    expect(result.ok).toBe(false)
  })

  it('rejects cleanliness below 1', () => {
    const result = validateProfileLifestyleInput({ ...validLifestyle, cleanliness: 0 })
    expect(result.ok).toBe(false)
  })

  it('rejects cleanliness above 3', () => {
    const result = validateProfileLifestyleInput({ ...validLifestyle, cleanliness: 4 })
    expect(result.ok).toBe(false)
  })

  it('defaults booleans to false when null/undefined', () => {
    const result = validateProfileLifestyleInput({
      pets: null,
      smoker: undefined,
      parties: null,
      cleanliness: 1,
      schedule: 'day',
    })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.pets).toBe(false)
      expect(result.data.smoker).toBe(false)
      expect(result.data.parties).toBe(false)
    }
  })
})
