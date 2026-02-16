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
const CLEANLINESS_MIN = 1
const CLEANLINESS_MAX = 3

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

function trim(s: unknown): string {
  if (s == null) return ''
  return String(s).trim()
}

function toInt(v: unknown): number | null {
  if (v === null || v === undefined) return null
  const n = Number(v)
  return Number.isNaN(n) ? null : Math.floor(n)
}

export type ValidateProfileBaseOptions = {
  requireCityZone?: boolean
  requireLocationId?: boolean
}

/**
 * Valida y normaliza datos de perfil base (display_name, city, zone, avatar, bio, age).
 * - display_name: requerido, 2–40 caracteres (trim).
 * - city/zone: si requireCityZone, requeridos 2–60 y 2–80; si no, opcionales con mismos límites.
 * - avatar_url: opcional, trim.
 * - bio: opcional; si existe, 30–400 caracteres.
 * - age: opcional; si existe, 18–99 entero.
 */
export function validateProfileInput(
  input: Partial<Record<keyof ProfileBaseInput, unknown>>,
  options: ValidateProfileBaseOptions = {}
): { ok: true; data: ProfileBaseNormalized } | { ok: false; error: string } {
  const { requireCityZone = false, requireLocationId = false } = options
  const display_name = trim(input?.display_name)
  const city = trim(input?.city)
  const zone = trim(input?.zone)
  const location_id = trim(input?.location_id)
  const avatar_url = input?.avatar_url != null && trim(input.avatar_url) !== '' ? trim(input.avatar_url) : null
  const bioRaw = trim(input?.bio)
  const bio = bioRaw === '' ? null : bioRaw
  const ageRaw = toInt(input?.age)

  if (!display_name) return { ok: false, error: 'El nombre es requerido.' }
  if (display_name.length < DISPLAY_NAME_MIN) return { ok: false, error: `El nombre debe tener entre ${DISPLAY_NAME_MIN} y ${DISPLAY_NAME_MAX} caracteres.` }
  if (display_name.length > DISPLAY_NAME_MAX) return { ok: false, error: `El nombre debe tener entre ${DISPLAY_NAME_MIN} y ${DISPLAY_NAME_MAX} caracteres.` }

  if (requireLocationId) {
    if (!location_id || location_id.length < LOCATION_ID_MIN) return { ok: false, error: 'Selecciona una ubicación de la lista.' }
    // city/zone no obligatorios cuando hay location_id; zone siempre opcional
    if (city.length > 0 && (city.length < CITY_MIN || city.length > CITY_MAX)) return { ok: false, error: `La ciudad debe tener entre ${CITY_MIN} y ${CITY_MAX} caracteres.` }
    if (zone.length > 0 && (zone.length < ZONE_MIN || zone.length > ZONE_MAX)) return { ok: false, error: `La zona debe tener entre ${ZONE_MIN} y ${ZONE_MAX} caracteres.` }
  } else if (requireCityZone) {
    if (!city) return { ok: false, error: 'La ciudad es requerida.' }
    if (city.length < CITY_MIN) return { ok: false, error: `La ciudad debe tener entre ${CITY_MIN} y ${CITY_MAX} caracteres.` }
    if (city.length > CITY_MAX) return { ok: false, error: `La ciudad debe tener entre ${CITY_MIN} y ${CITY_MAX} caracteres.` }
    if (!zone) return { ok: false, error: 'La zona es requerida.' }
    if (zone.length < ZONE_MIN) return { ok: false, error: `La zona debe tener entre ${ZONE_MIN} y ${ZONE_MAX} caracteres.` }
    if (zone.length > ZONE_MAX) return { ok: false, error: `La zona debe tener entre ${ZONE_MIN} y ${ZONE_MAX} caracteres.` }
  } else {
    if (city.length > 0 && (city.length < CITY_MIN || city.length > CITY_MAX)) return { ok: false, error: `La ciudad debe tener entre ${CITY_MIN} y ${CITY_MAX} caracteres.` }
    if (zone.length > 0 && (zone.length < ZONE_MIN || zone.length > ZONE_MAX)) return { ok: false, error: `La zona debe tener entre ${ZONE_MIN} y ${ZONE_MAX} caracteres.` }
  }

  if (bio !== null) {
    if (bio.length < BIO_MIN) return { ok: false, error: `La bio debe tener entre ${BIO_MIN} y ${BIO_MAX} caracteres.` }
    if (bio.length > BIO_MAX) return { ok: false, error: `La bio debe tener entre ${BIO_MIN} y ${BIO_MAX} caracteres.` }
  }

  if (ageRaw !== null) {
    if (ageRaw < AGE_MIN || ageRaw > AGE_MAX) return { ok: false, error: `La edad debe estar entre ${AGE_MIN} y ${AGE_MAX}.` }
  }

  return {
    ok: true,
    data: {
      display_name,
      city: city || '',
      zone: zone || '',
      location_id: location_id && location_id.length >= LOCATION_ID_MIN ? location_id : null,
      avatar_url,
      bio,
      age: ageRaw,
    },
  }
}

/**
 * Valida y normaliza datos de estilo de vida (pets, smoker, parties, cleanliness, schedule).
 * - pets, smoker, parties: boolean (normalizar con Boolean).
 * - cleanliness: requerido, 1–3.
 * - schedule: requerido, 'day' | 'night'.
 */
export function validateProfileLifestyleInput(
  input: Partial<Record<keyof ProfileLifestyleInput, unknown>>
): { ok: true; data: ProfileLifestyleNormalized } | { ok: false; error: string } {
  const pets = input?.pets === true
  const smoker = input?.smoker === true
  const parties = input?.parties === true
  const cleanliness = toInt(input?.cleanliness)
  const schedule = trim(input?.schedule)

  if (cleanliness === null || cleanliness === undefined) {
    return { ok: false, error: 'El nivel de limpieza es requerido.' }
  }
  if (cleanliness < CLEANLINESS_MIN || cleanliness > CLEANLINESS_MAX) {
    return { ok: false, error: `El nivel de limpieza debe ser ${CLEANLINESS_MIN}, 2 o ${CLEANLINESS_MAX}.` }
  }

  if (schedule !== 'day' && schedule !== 'night') {
    return { ok: false, error: 'El horario es requerido (día o noche).' }
  }

  return {
    ok: true,
    data: {
      pets,
      smoker,
      parties,
      cleanliness,
      schedule: schedule as 'day' | 'night',
    },
  }
}
