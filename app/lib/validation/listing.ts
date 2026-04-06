'use strict'

import { z } from 'zod'

const TITLE_MIN = 10
const TITLE_MAX = 80
const DESC_MIN = 30
const DESC_MAX = 2_000
const PRICE_MIN = 500
const PRICE_MAX = 80_000
const ZONE_MAX = 80
const LOCATION_ID_MIN_LEN = 10

const listingSchema = z.object({
  title: z
    .string()
    .trim()
    .min(TITLE_MIN, `El título debe tener entre ${TITLE_MIN} y ${TITLE_MAX} caracteres.`)
    .max(TITLE_MAX, `El título debe tener entre ${TITLE_MIN} y ${TITLE_MAX} caracteres.`),
  description: z
    .string()
    .trim()
    .min(DESC_MIN, `La descripción debe tener entre ${DESC_MIN} y ${DESC_MAX} caracteres.`)
    .max(DESC_MAX, `La descripción debe tener entre ${DESC_MIN} y ${DESC_MAX} caracteres.`),
  city: z.string().trim().default(''),
  zone: z.string().trim().default(''),
  price_mxn: z
    .union([
      z.null(),
      z.number().int('El precio debe ser un número entero.')
        .min(PRICE_MIN, `El precio mínimo es $${PRICE_MIN} MXN.`)
        .max(PRICE_MAX, `El precio máximo es $${PRICE_MAX} MXN.`),
    ])
    .nullable()
    .default(null),
  listing_type: z.enum(['room', 'roommate'], {
    error: 'Tipo de anuncio inválido. Elige "Rento cuarto" o "Busco roomie".',
  }),
  location_id: z.string().trim().nullable().optional(),
  listing_subtype: z.enum(['solo_renta', 'buscar_roomie']).optional(),
  lifestyle_prefs: z.record(z.string(), z.unknown()).nullable().optional(),
  amenities: z.array(z.string()).optional(),
})

export type ListingInput = z.input<typeof listingSchema>
export type ListingNormalized = z.output<typeof listingSchema>

export function validateListingInput(
  input: any
): { ok: true; data: ListingNormalized } | { ok: false; error: string } {
  const result = listingSchema.safeParse(input)

  if (!result.success) {
    return { ok: false, error: result.error.issues[0].message }
  }

  const data = result.data
  const hasLocationId = !!data.location_id && data.location_id.length >= LOCATION_ID_MIN_LEN

  // Location-dependent city/zone validation
  if (hasLocationId) {
    if (!data.zone || data.zone.length < 2) {
      return { ok: false, error: 'La zona / colonia es obligatoria.' }
    }
    if (data.zone.length > ZONE_MAX) {
      return { ok: false, error: 'La zona / colonia debe tener entre 2 y 80 caracteres.' }
    }
    if (data.city.length > 0 && data.city.length < 2) {
      return { ok: false, error: 'La ciudad debe tener al menos 2 caracteres.' }
    }
  } else {
    if (!data.city) return { ok: false, error: 'La ciudad es requerida.' }
    if (data.city.length < 2) return { ok: false, error: 'La ciudad debe tener al menos 2 caracteres.' }
    if (!data.zone) return { ok: false, error: 'La zona es requerida.' }
    if (data.zone.length < 2) return { ok: false, error: 'La zona debe tener al menos 2 caracteres.' }
    if (data.zone.length > ZONE_MAX) return { ok: false, error: 'La zona / colonia debe tener entre 2 y 80 caracteres.' }
  }

  return {
    ok: true,
    data: {
      ...data,
      location_id: hasLocationId ? data.location_id! : null,
    },
  }
}
