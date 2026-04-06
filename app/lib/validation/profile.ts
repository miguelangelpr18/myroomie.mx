'use strict'

import { z } from 'zod'

const DISPLAY_NAME_MIN = 2
const DISPLAY_NAME_MAX = 40
const CITY_MIN = 2
const CITY_MAX = 60
const ZONE_MIN = 2
const ZONE_MAX = 80
const LOCATION_ID_MIN = 10
const BIO_MIN = 30
const BIO_MAX = 400
const AGE_MIN = 18
const AGE_MAX = 99

// ── Profile base schema ──────────────────────────────────────────────────────

const profileBaseSchema = z.object({
  display_name: z
    .string()
    .trim()
    .min(DISPLAY_NAME_MIN, `El nombre debe tener entre ${DISPLAY_NAME_MIN} y ${DISPLAY_NAME_MAX} caracteres.`)
    .max(DISPLAY_NAME_MAX, `El nombre debe tener entre ${DISPLAY_NAME_MIN} y ${DISPLAY_NAME_MAX} caracteres.`),
  city: z.string().trim().default(''),
  zone: z.string().trim().default(''),
  location_id: z.string().trim().nullable().optional(),
  avatar_url: z.string().trim().nullable().optional(),
  bio: z.string().trim().nullable().optional(),
  age: z
    .number()
    .int()
    .min(AGE_MIN, `La edad debe estar entre ${AGE_MIN} y ${AGE_MAX}.`)
    .max(AGE_MAX, `La edad debe estar entre ${AGE_MIN} y ${AGE_MAX}.`)
    .nullable()
    .optional(),
})

export type ProfileBaseInput = {
  display_name: string
  city?: string
  zone?: string
  location_id?: string | null
  avatar_url?: string | null
  bio?: string | null
  age?: number | null
}

export type ProfileBaseNormalized = {
  display_name: string
  city: string
  zone: string
  location_id: string | null
  avatar_url: string | null
  bio: string | null
  age: number | null
}

export type ValidateProfileBaseOptions = {
  requireCityZone?: boolean
  requireLocationId?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateProfileInput(
  input: any,
  options: ValidateProfileBaseOptions = {}
): { ok: true; data: ProfileBaseNormalized } | { ok: false; error: string } {
  const { requireCityZone = false, requireLocationId = false } = options

  const result = profileBaseSchema.safeParse(input)
  if (!result.success) {
    return { ok: false, error: result.error.issues[0].message }
  }

  const data = result.data
  const city = data.city
  const zone = data.zone
  const location_id = data.location_id ? data.location_id : ''
  const hasLocationId = location_id.length >= LOCATION_ID_MIN

  if (requireLocationId) {
    if (!hasLocationId) return { ok: false, error: 'Selecciona una ubicación de la lista.' }
    if (city.length > 0 && (city.length < CITY_MIN || city.length > CITY_MAX)) {
      return { ok: false, error: `La ciudad debe tener entre ${CITY_MIN} y ${CITY_MAX} caracteres.` }
    }
    if (zone.length > 0 && (zone.length < ZONE_MIN || zone.length > ZONE_MAX)) {
      return { ok: false, error: `La zona debe tener entre ${ZONE_MIN} y ${ZONE_MAX} caracteres.` }
    }
  } else if (requireCityZone) {
    if (!city) return { ok: false, error: 'La ciudad es requerida.' }
    if (city.length < CITY_MIN || city.length > CITY_MAX) {
      return { ok: false, error: `La ciudad debe tener entre ${CITY_MIN} y ${CITY_MAX} caracteres.` }
    }
    if (!zone) return { ok: false, error: 'La zona es requerida.' }
    if (zone.length < ZONE_MIN || zone.length > ZONE_MAX) {
      return { ok: false, error: `La zona debe tener entre ${ZONE_MIN} y ${ZONE_MAX} caracteres.` }
    }
  } else {
    if (city.length > 0 && (city.length < CITY_MIN || city.length > CITY_MAX)) {
      return { ok: false, error: `La ciudad debe tener entre ${CITY_MIN} y ${CITY_MAX} caracteres.` }
    }
    if (zone.length > 0 && (zone.length < ZONE_MIN || zone.length > ZONE_MAX)) {
      return { ok: false, error: `La zona debe tener entre ${ZONE_MIN} y ${ZONE_MAX} caracteres.` }
    }
  }

  // Bio validation
  const bio = data.bio && data.bio.length > 0 ? data.bio : null
  if (bio !== null) {
    if (bio.length < BIO_MIN) return { ok: false, error: `La bio debe tener entre ${BIO_MIN} y ${BIO_MAX} caracteres.` }
    if (bio.length > BIO_MAX) return { ok: false, error: `La bio debe tener entre ${BIO_MIN} y ${BIO_MAX} caracteres.` }
  }

  const avatar_url = data.avatar_url && data.avatar_url.length > 0 ? data.avatar_url : null

  return {
    ok: true,
    data: {
      display_name: data.display_name,
      city: city || '',
      zone: zone || '',
      location_id: hasLocationId ? location_id : null,
      avatar_url,
      bio,
      age: data.age ?? null,
    },
  }
}

// ── Profile lifestyle schema ──────────────────────────────────────────────────

const profileLifestyleSchema = z.object({
  pets: z.boolean().default(false),
  smoker: z.boolean().default(false),
  parties: z.boolean().default(false),
  cleanliness: z
    .number()
    .int()
    .min(1, 'El nivel de limpieza debe ser 1, 2 o 3.')
    .max(3, 'El nivel de limpieza debe ser 1, 2 o 3.'),
  schedule: z.enum(['day', 'night'], {
    error: 'El horario es requerido (día o noche).',
  }),
})

export type ProfileLifestyleInput = {
  pets?: boolean | null
  smoker?: boolean | null
  parties?: boolean | null
  cleanliness?: number | null
  schedule?: string | null
}

export type ProfileLifestyleNormalized = {
  pets: boolean
  smoker: boolean
  parties: boolean
  cleanliness: number
  schedule: 'day' | 'night'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateProfileLifestyleInput(
  input: any
): { ok: true; data: ProfileLifestyleNormalized } | { ok: false; error: string } {
  const parsed = profileLifestyleSchema.safeParse({
    pets: input?.pets === true,
    smoker: input?.smoker === true,
    parties: input?.parties === true,
    cleanliness: input?.cleanliness != null ? Number(input.cleanliness) : undefined,
    schedule: input?.schedule,
  })

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message }
  }

  return { ok: true, data: parsed.data }
}
