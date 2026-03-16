import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // Require authenticated user before any write operation
    const supabaseAuth = createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser()
    if (!user || authError) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
    }

    const body = await request.json()
    const { provider, place_id, label, city, region, country, lat, lng } = body

    // Validar campos requeridos
    if (!provider || !place_id || !label) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: provider, place_id, label' },
        { status: 400 }
      )
    }

    // Validar provider debe ser "mapbox"
    if (typeof provider !== 'string' || provider !== 'mapbox') {
      return NextResponse.json(
        { error: 'provider debe ser "mapbox"' },
        { status: 400 }
      )
    }

    // Validar place_id: string 5..120 caracteres
    if (typeof place_id !== 'string' || place_id.length < 5 || place_id.length > 120) {
      return NextResponse.json(
        { error: 'place_id debe ser un string entre 5 y 120 caracteres' },
        { status: 400 }
      )
    }

    // Validar place_id debe cumplir prefijo esperado (place./locality./neighborhood.)
    const validPrefixes = ['place.', 'locality.', 'neighborhood.']
    if (!validPrefixes.some(prefix => place_id.startsWith(prefix))) {
      return NextResponse.json(
        { error: 'place_id debe comenzar con "place.", "locality." o "neighborhood."' },
        { status: 400 }
      )
    }

    // Validar label: string 1..120 caracteres
    if (typeof label !== 'string' || label.trim().length === 0 || label.length > 120) {
      return NextResponse.json(
        { error: 'label debe ser un string entre 1 y 120 caracteres' },
        { status: 400 }
      )
    }

    // Validar city opcional pero si viene: max 120 caracteres
    if (city !== undefined && city !== null) {
      if (typeof city !== 'string' || city.length > 120) {
        return NextResponse.json(
          { error: 'city debe ser un string de máximo 120 caracteres' },
          { status: 400 }
        )
      }
    }

    // Validar region opcional pero si viene: max 120 caracteres
    if (region !== undefined && region !== null) {
      if (typeof region !== 'string' || region.length > 120) {
        return NextResponse.json(
          { error: 'region debe ser un string de máximo 120 caracteres' },
          { status: 400 }
        )
      }
    }

    // Validar country opcional pero si viene: max 120 caracteres
    if (country !== undefined && country !== null) {
      if (typeof country !== 'string' || country.length > 120) {
        return NextResponse.json(
          { error: 'country debe ser un string de máximo 120 caracteres' },
          { status: 400 }
        )
      }
    }

    // Validar y parsear lat si viene: número -90..90
    let latNum: number | null = null
    if (lat !== undefined && lat !== null) {
      latNum = typeof lat === 'string' ? parseFloat(lat) : lat
      if (typeof latNum !== 'number' || isNaN(latNum) || latNum < -90 || latNum > 90) {
        return NextResponse.json(
          { error: 'lat debe ser un número entre -90 y 90' },
          { status: 400 }
        )
      }
    }

    // Validar y parsear lng si viene: número -180..180
    let lngNum: number | null = null
    if (lng !== undefined && lng !== null) {
      lngNum = typeof lng === 'string' ? parseFloat(lng) : lng
      if (typeof lngNum !== 'number' || isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
        return NextResponse.json(
          { error: 'lng debe ser un número entre -180 y 180' },
          { status: 400 }
        )
      }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: 'Missing SUPABASE_SERVICE_ROLE_KEY' },
        { status: 500 }
      )
    }

    if (!supabaseUrl) {
      return NextResponse.json(
        { error: 'Missing NEXT_PUBLIC_SUPABASE_URL' },
        { status: 500 }
      )
    }

    // Service role (admin) client: bypass RLS on server
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })

    // Upsert en locations (usando unique index en provider+place_id)
    // latNum y lngNum ya están validados y parseados arriba
    const { data, error } = await supabase
      .from('locations')
      .upsert(
        {
          provider,
          place_id,
          label: label.trim(),
          city: city && city.trim() ? city.trim() : null,
          region: region && region.trim() ? region.trim() : null,
          country: country && country.trim() ? country.trim() : null,
          lat: latNum,
          lng: lngNum,
        },
        {
          onConflict: 'provider,place_id',
        }
      )
      .select('id')
      .single()

    if (error) {
      console.error('Error al hacer upsert en locations:', error)
      return NextResponse.json(
        { error: 'Error al guardar ubicación.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      location_id: data.id,
    })
  } catch (error) {
    console.error('Error en upsert de locations:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 }
    )
  }
}

