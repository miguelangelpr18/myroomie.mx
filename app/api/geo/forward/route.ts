import { NextRequest, NextResponse } from 'next/server'
import { getClientIp, checkGeoRateLimit } from '@/app/lib/rateLimit'

export async function GET(request: NextRequest) {
  const ip = getClientIp(request)
  if (!checkGeoRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Demasiadas solicitudes. Intenta de nuevo en un minuto.' },
      { status: 429 }
    )
  }

  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')

  // Validar params
  if (!query || query.trim().length === 0) {
    return NextResponse.json(
      { error: 'Falta parámetro q (query)' },
      { status: 400 }
    )
  }

  const mapboxToken = process.env.MAPBOX_TOKEN

  if (!mapboxToken) {
    return NextResponse.json(
      { error: 'MAPBOX_TOKEN no configurado' },
      { status: 500 }
    )
  }

  try {
    // Llamar Mapbox Geocoding forward (autocomplete)
    const encodedQuery = encodeURIComponent(query.trim())
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedQuery}.json?types=place,locality,neighborhood&language=es&limit=5&country=mx&access_token=${mapboxToken}`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      const errorData = await response.text()
      return NextResponse.json(
        { error: `Error de Mapbox: ${response.status} ${errorData}` },
        { status: 500 }
      )
    }

    const data = await response.json()

    // Parsear respuesta y construir candidates
    if (!data.features || data.features.length === 0) {
      return NextResponse.json({
        candidates: [],
      })
    }

    const candidates = data.features.map((feature: any) => {
      const context = feature.context || []
      
      // Extraer información de contexto
      let city: string | null = null
      let region: string | null = null
      let country: string | null = null

      for (const ctx of context) {
        if (ctx.id.startsWith('place.')) {
          city = ctx.text
        } else if (ctx.id.startsWith('region.')) {
          region = ctx.text
        } else if (ctx.id.startsWith('country.')) {
          country = ctx.text
        }
      }

      // Si no hay city en contexto, usar el nombre principal del feature
      if (!city && feature.place_type?.includes('place')) {
        city = feature.text
      }

      // Construir label: "Ciudad, Región" o solo "Ciudad"
      const labelParts = [city, region].filter(Boolean)
      const label = labelParts.length > 0 ? labelParts.join(', ') : feature.place_name || feature.text

      return {
        place_id: feature.id,
        label,
        city,
        region,
        country,
        lat: feature.center ? feature.center[1] : null,
        lng: feature.center ? feature.center[0] : null,
      }
    }).filter((c: any) => {
      const ctry = (c?.country || '').toString().trim().toLowerCase()
      return ctry === 'méxico' || ctry === 'mexico'
    })

    return NextResponse.json({
      candidates,
    })
  } catch (error) {
    console.error('Error en forward geocoding:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}

