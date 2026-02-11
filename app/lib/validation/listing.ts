const TITLE_MIN = 10
const TITLE_MAX = 80
const DESC_MIN = 30
const DESC_MAX = 2_000
const PRICE_MIN = 500
const PRICE_MAX = 80_000
const CITY_ZONE_MIN = 2
const LOCATION_ID_MIN_LEN = 10

export type ListingInput = {
  title: string
  description: string
  city: string
  zone: string
  price_mxn: number | null
  listing_type: 'room' | 'roommate'
  location_id?: string | null
}

export type ListingNormalized = ListingInput

function trim(s: unknown): string {
  if (s == null) return ''
  const t = String(s).trim()
  return t
}

function isEmptyPrice(v: unknown): boolean {
  if (v === null || v === undefined) return true
  if (trim(v) === '') return true
  return false
}

export function validateListingInput(
  input: Partial<Record<keyof ListingInput, unknown>>
): { ok: true; data: ListingNormalized } | { ok: false; error: string } {
  const title = trim(input?.title)
  const description = trim(input?.description)
  const city = trim(input?.city)
  const zone = trim(input?.zone)
  const location_id = trim(input?.location_id)
  const listing_type = input?.listing_type
  const hasLocationId = location_id.length > 0

  if (!title) return { ok: false, error: 'El título es requerido.' }
  if (title.length < TITLE_MIN) return { ok: false, error: `El título debe tener entre ${TITLE_MIN} y ${TITLE_MAX} caracteres.` }
  if (title.length > TITLE_MAX) return { ok: false, error: `El título debe tener entre ${TITLE_MIN} y ${TITLE_MAX} caracteres.` }

  if (!description) return { ok: false, error: 'La descripción es requerida.' }
  if (description.length < DESC_MIN) return { ok: false, error: `La descripción debe tener entre ${DESC_MIN} y ${DESC_MAX} caracteres.` }
  if (description.length > DESC_MAX) return { ok: false, error: `La descripción debe tener entre ${DESC_MIN} y ${DESC_MAX} caracteres.` }

  if (hasLocationId) {
    if (location_id.length < LOCATION_ID_MIN_LEN) {
      return { ok: false, error: 'El ID de ubicación no es válido.' }
    }
  } else {
    if (!city) return { ok: false, error: 'La ciudad es requerida.' }
    if (city.length < CITY_ZONE_MIN) return { ok: false, error: 'La ciudad debe tener al menos 2 caracteres.' }
    if (!zone) return { ok: false, error: 'La zona es requerida.' }
    if (zone.length < CITY_ZONE_MIN) return { ok: false, error: 'La zona debe tener al menos 2 caracteres.' }
  }

  if (listing_type !== 'room' && listing_type !== 'roommate') {
    return { ok: false, error: 'Tipo de anuncio inválido. Elige "Rento cuarto" o "Busco roomie".' }
  }

  let priceFinal: number | null = null
  if (!isEmptyPrice(input?.price_mxn)) {
    const num = Number(input?.price_mxn)
    if (Number.isNaN(num)) {
      return { ok: false, error: 'El precio debe ser un número entero.' }
    }
    if (!Number.isInteger(num)) {
      return { ok: false, error: 'El precio debe ser un número entero.' }
    }
    if (num < PRICE_MIN) return { ok: false, error: `El precio mínimo es $${PRICE_MIN} MXN.` }
    if (num > PRICE_MAX) return { ok: false, error: `El precio máximo es $${PRICE_MAX} MXN.` }
    priceFinal = num
  }

  return {
    ok: true,
    data: {
      title,
      description,
      city,
      zone,
      price_mxn: priceFinal,
      listing_type,
      location_id: hasLocationId ? location_id : null,
    },
  }
}
