import { z } from 'zod'

// Schema para validar filtros de listings
export const listingsFiltersSchema = z.object({
  q: z.string().optional(),
  city: z.string().optional(),
  zone: z.string().optional(),
  location_id: z.string().optional(),
  listing_type: z.enum(['all', 'room', 'roommate']).default('all'),
  min: z.string().optional(),
  max: z.string().optional(),
  sort: z.enum(['recent', 'price_asc', 'price_desc']).default('recent'),
}).refine(
  (data) => {
    // Validar que min <= max si ambos están presentes
    if (data.min && data.max) {
      const minNum = parseInt(data.min, 10)
      const maxNum = parseInt(data.max, 10)
      if (!isNaN(minNum) && !isNaN(maxNum)) {
        return minNum <= maxNum
      }
    }
    return true
  },
  {
    message: 'El precio mínimo debe ser menor o igual al precio máximo',
    path: ['min'], // Marca el error en el campo min
  }
)

// Schema para validar filtros de roomies
export const roomiesFiltersSchema = z.object({
  q: z.string().optional(),
  city: z.string().optional(),
  location_id: z.string().optional(),
  budget_min: z.string().optional(),
  budget_max: z.string().optional(),
}).refine(
  (data) => {
    // Validar que budget_min <= budget_max si ambos están presentes
    if (data.budget_min && data.budget_max) {
      const minNum = parseInt(data.budget_min, 10)
      const maxNum = parseInt(data.budget_max, 10)
      if (!isNaN(minNum) && !isNaN(maxNum)) {
        return minNum <= maxNum
      }
    }
    return true
  },
  {
    message: 'El presupuesto mínimo debe ser menor o igual al presupuesto máximo',
    path: ['budget_min'],
  }
)

export type ListingsFilters = z.infer<typeof listingsFiltersSchema>
export type RoomiesFilters = z.infer<typeof roomiesFiltersSchema>
