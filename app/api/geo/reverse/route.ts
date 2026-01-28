import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  // Validar params
  if (!lat || !lng) {
    return NextResponse.json(
      { error: 'Faltan parámetros lat y lng' },
      { status: 400 }
    )
  }

  const latNum = parseFloat(lat)
  const lngNum = parseFloat(lng)

  if (isNaN(latNum) || isNaN(lngNum)) {
    return NextResponse.json(
      { error: 'lat y lng deben ser números válidos' },
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
    // Llamar Mapbox Geocoding reverse
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lngNum},${latNum}.json?types=place,locality,neighborhood&language=es&limit=1&country=mx&access_token=${mapboxToken}`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      const errorData = await response.text()
      return NextResponse.json(
        { error: `Error de Mapbox: ${response.status} ${errorData}` },
        { status: 500 }
      )
    }

    const data = await response.json()

    // Parsear respuesta
    if (!data.features || data.features.length === 0) {
      return NextResponse.json(
        { error: 'No se encontró ubicación' },
        { status: 404 }
      )
    }

    const feature = data.features[0]
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

    // México-only
    const ctry = (country || '').toString().trim().toLowerCase()
    if (!(ctry === 'méxico' || ctry === 'mexico')) {
      return NextResponse.json(
        { error: 'Por ahora solo disponible en México' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      place_id: feature.id,
      label,
      city,
      region,
      country,
      lat: feature.center ? feature.center[1] : null,
      lng: feature.center ? feature.center[0] : null,
    })
  } catch (error) {
    console.error('Error en reverse geocoding:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}

