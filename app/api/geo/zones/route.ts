import { NextRequest, NextResponse } from 'next/server'
import { getClientIp, checkGeoRateLimit } from '@/app/lib/rateLimit'
import { createClient } from '@supabase/supabase-js'

function normalizeText(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.,]/g, '')
    .replace(/\s+/g, ' ')
}

export async function GET(request: NextRequest) {
  const ip = getClientIp(request)
  if (!checkGeoRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Demasiadas solicitudes. Intenta de nuevo en un minuto.' },
      { status: 429 }
    )
  }

  const searchParams = request.nextUrl.searchParams
  const qRaw = searchParams.get('q')
  const locationIdRaw = searchParams.get('location_id')

  const q = typeof qRaw === 'string' ? qRaw.trim() : ''
  const locationId = typeof locationIdRaw === 'string' ? locationIdRaw.trim() : ''

  if (q.length < 2) {
    return NextResponse.json({ zones: [] }, { status: 200 })
  }

  if (!locationId || locationId.length < 10) {
    return NextResponse.json(
      { error: 'Falta o es inválido el parámetro location_id' },
      { status: 400 }
    )
  }

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
  
  if (!mapboxToken) {
    return NextResponse.json(
      { error: 'NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN no configurado' },
      { status: 500 }
    )
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: 'Configuración del servidor incompleta' },
      { status: 500 }
    )
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: location, error: locationError } = await supabase
    .from('locations')
    .select('city, lat, lng, country')
    .eq('id', locationId)
    .single()

  if (locationError || !location) {
    return NextResponse.json(
      { error: 'Ubicación no encontrada' },
      { status: 404 }
    )
  }

  const lat = location.lat != null ? Number(location.lat) : NaN
  const lng = location.lng != null ? Number(location.lng) : NaN
  
  // FALLBACK NACIONAL: Si no hay coordenadas, buscar en todo México
  const useFallback = Number.isNaN(lat) || Number.isNaN(lng)

  const locCityNorm = normalizeText(location.city ?? '')

  let bbox = ''
  let proximity = ''

  if (!useFallback) {
    // Calcular bounding box (~20km radius alrededor del punto)
    const latOffset = 0.18
    const lngOffset = 0.18 / Math.cos((lat * Math.PI) / 180)
    bbox = [
      lng - lngOffset,
      lat - latOffset,
      lng + lngOffset,
      lat + latOffset,
    ].join(',')
    proximity = `${lng},${lat}`
  }
  // Si useFallback, bbox y proximity quedan vacíos (búsqueda nacional)

  try {
    // Construir URL de Mapbox con o sin bbox
    let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?autocomplete=true&limit=12&types=neighborhood,locality,district&language=es&country=mx`
    
    if (bbox) {
      url += `&bbox=${bbox}`
    }
    if (proximity) {
      url += `&proximity=${proximity}`
    }
    url += `&access_token=${mapboxToken}`

    const res = await fetch(url)

    if (res.status === 429) {
      return NextResponse.json(
        { error: 'Demasiadas solicitudes. Intenta de nuevo en un minuto.' },
        { status: 429 }
      )
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: 'No se pudieron cargar zonas.' },
        { status: 500 }
      )
    }

    const data = (await res.json()) as { features?: Array<{ text?: string; place_type?: string[]; context?: Array<{ id?: string; text?: string }> }> }
    const features = Array.isArray(data?.features) ? data.features : []

    const seen = new Set<string>()
    const zones: string[] = []

    for (const feature of features) {
      const nameTrim = (feature.text ?? '').trim()
      if (!nameTrim || nameTrim.length < 2) continue
      
      // Evitar sugerir la ciudad misma
      if (normalizeText(nameTrim) === locCityNorm) continue

      const pt = Array.isArray(feature.place_type) ? feature.place_type : []
      
      // Solo permitir neighborhood, locality, district
      const isValidType = 
        pt.includes('neighborhood') || 
        pt.includes('locality') || 
        pt.includes('district')
      if (!isValidType) continue

      // SIN FILTRO DE CIUDAD - Confiar 100% en Mapbox y bbox
      // Si Mapbox lo devuelve y está en el área (bbox), mostrarlo

      const key = nameTrim.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      zones.push(nameTrim)
    }

    return NextResponse.json({ zones })
  } catch (err) {
    console.error('[ZONES API] Error:', err)
    return NextResponse.json(
      { error: 'No se pudieron cargar zonas.' },
      { status: 500 }
    )
  }
}
