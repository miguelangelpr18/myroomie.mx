/**
 * Helper para limpiar persistencia de ubicación (localStorage)
 * Safe para SSR: retorna early si window no existe
 */
export function clearLocationPersistence(): void {
  if (typeof window === 'undefined') return

  localStorage.removeItem('last_location_id')
  localStorage.removeItem('last_location_label')
  localStorage.removeItem('last_city_label')
  localStorage.removeItem('last_city_value')
}

/**
 * Limpia parámetros de ubicación de una string de search params
 * @param searchParamsString - String de search params (ej: "location_id=123&city=Monterrey&min=5000")
 * @returns Nueva string sin location_id, city, q (sin prefijo '?')
 * @example
 * clearLocationFromUrlParams("location_id=123&city=Monterrey&min=5000") // => "min=5000"
 * clearLocationFromUrlParams("location_id=123") // => ""
 */
export function clearLocationFromUrlParams(searchParamsString: string): string {
  const params = new URLSearchParams(searchParamsString)
  params.delete('location_id')
  params.delete('city')
  params.delete('q')
  return params.toString()
}

