import { NextRequest, NextResponse } from 'next/server'
import { getClientIp, checkGeoRateLimit } from '@/app/lib/rateLimit'

function buildReverseUrl(
  lng: number,
  lat: number,
  type: string,
  mapboxToken: string
): string {
  return `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?types=${type}&limit=1&language=es&country=mx&access_token=${mapboxToken}`
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
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  if (!lat || !lng) {
    return NextResponse.json(
      { error: 'Faltan parámetros lat y lng' },
      { status: 400 }
    )
  }

  const latNum = parseFloat(lat)
  const lngNum = parseFloat(lng)

  if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
    return NextResponse.json(
      { error: 'lat y lng deben ser números válidos' },
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

  try {
    // A) Request place (ciudad) — un solo type para evitar 422
    const urlPlace = buildReverseUrl(lngNum, latNum, 'place', mapboxToken)
    const resPlace = await fetch(urlPlace)

    if (resPlace.status === 429) {
      return NextResponse.json(
        { error: 'Demasiadas solicitudes. Intenta de nuevo en un minuto.' },
        { status: 429 }
      )
    }

    if (!resPlace.ok) {
      const errText = await resPlace.text()
      return NextResponse.json(
        { error: `Error de Mapbox: ${resPlace.status} ${errText}` },
        { status: 500 }
      )
    }

    const dataPlace = await resPlace.json()
    const featuresPlace = dataPlace?.features ?? []

    if (!Array.isArray(featuresPlace) || featuresPlace.length === 0) {
      return NextResponse.json(
        { error: 'Ubicación no encontrada en México' },
        { status: 404 }
      )
    }

    const featurePlace = featuresPlace[0]
    const context = Array.isArray(featurePlace.context) ? featurePlace.context : []

    let city: string | null = null
    let region: string | null = null
    let country: string | null = null

    for (const ctx of context) {
      if (ctx.id?.startsWith('place')) {
        city = ctx.text ?? null
      }
      if (ctx.id?.startsWith('region')) {
        region = ctx.text ?? null
      }
      if (ctx.id?.startsWith('country')) {
        country = ctx.text ?? null
      }
    }

    if (!city && featurePlace.text) {
      city = String(featurePlace.text).trim()
    }

    // México-only
    const ctry = (country || '').trim().toLowerCase()
    if (ctry && ctry !== 'méxico' && ctry !== 'mexico') {
      return NextResponse.json(
        { error: 'Por ahora solo disponible en México' },
        { status: 404 }
      )
    }

    if (!city) {
      return NextResponse.json(
        { error: 'Ubicación no encontrada en México' },
        { status: 404 }
      )
    }

    // B) Request neighborhood (zona/colonia) — un solo type
    let zone: string | null = null
    const urlNeighborhood = buildReverseUrl(lngNum, latNum, 'neighborhood', mapboxToken)
    const resNeighborhood = await fetch(urlNeighborhood)

    if (resNeighborhood.status === 429) {
      return NextResponse.json(
        { error: 'Demasiadas solicitudes. Intenta de nuevo en un minuto.' },
        { status: 429 }
      )
    }

    if (resNeighborhood.ok) {
      const dataNeighborhood = await resNeighborhood.json()
      const featuresNeighborhood = dataNeighborhood?.features ?? []
      if (Array.isArray(featuresNeighborhood) && featuresNeighborhood.length > 0 && featuresNeighborhood[0]?.text) {
        zone = String(featuresNeighborhood[0].text).trim()
      }
    }

    // C) Fallback zone: locality si no hubo neighborhood
    if (!zone) {
      const urlLocality = buildReverseUrl(lngNum, latNum, 'locality', mapboxToken)
      const resLocality = await fetch(urlLocality)

      if (resLocality.status !== 429 && resLocality.ok) {
        const dataLocality = await resLocality.json()
        const featuresLocality = dataLocality?.features ?? []
        if (Array.isArray(featuresLocality) && featuresLocality.length > 0 && featuresLocality[0]?.text) {
          zone = String(featuresLocality[0].text).trim()
        }
      }
    }

    const labelParts = [zone, city, region].filter(Boolean)
    const label = labelParts.length > 0 ? labelParts.join(', ') : city

    return NextResponse.json({
      city: city ?? '',
      zone: zone ?? '',
      label: label ?? '',
      place_id: featurePlace.id ?? null,
      region: region ?? null,
      country: country ?? null,
      lat: featurePlace.center?.[1] ?? latNum,
      lng: featurePlace.center?.[0] ?? lngNum,
    })
  } catch (error) {
    console.error('Error en reverse geocoding:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}
