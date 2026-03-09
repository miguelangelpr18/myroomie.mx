import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requireAuthOrRedirect } from '@/lib/requireAuth'
import Link from 'next/link'
import { Card, CardHeader, CardContent } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mi Panel',
}

export default async function DashboardPage() {
  await requireAuthOrRedirect()

  const supabase = createServerSupabaseClient()

  // Obtener sesión
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return null
  }

  // Obtener perfil del usuario
  const { data: profile } = await supabase
    .from('profiles')
    .select('user_id, display_name, avatar_url, featured_until')
    .eq('user_id', session.user.id)
    .maybeSingle()

  // Obtener listings del usuario
  const { data: listings } = await supabase
    .from('listings')
    .select('id, title, city, zone, price_mxn, listing_type, created_at, featured_until')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  const initial = profile?.display_name?.charAt(0).toUpperCase() || session.user.email?.charAt(0).toUpperCase() || '?'
  const now = new Date()
  const isFeatured = profile?.featured_until && new Date(profile.featured_until) > now

  return (
    <div className="container mx-auto px-4 md:px-8 py-16 max-w-6xl">
      <h1 className="text-2xl font-semibold tracking-tight mb-8">Mi Panel</h1>

      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
        {/* Card: Your profile */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium mb-4">Tu perfil</h2>
          </CardHeader>
          <CardContent>
          
          {profile ? (
            <>
              <div className="flex items-center gap-4 mb-4">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-brand text-white flex items-center justify-center text-2xl font-semibold">
                    {initial}
                  </div>
                )}
                <div>
                  <p className="font-medium text-lg">{profile.display_name}</p>
                  <Badge variant="subtle" className="mt-1">Activo</Badge>
                </div>
              </div>
              {isFeatured && profile.featured_until && (
                <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-neutral-700">
                    <strong className="text-orange-700">Promoción activa hasta:</strong>{' '}
                    {new Date(profile.featured_until).toLocaleDateString('es-MX', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}
              {!isFeatured && (
                <div className="mb-4 p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                  <p className="text-sm text-neutral-600">No tienes promoción activa</p>
                </div>
              )}
              <div className="flex gap-2">
                <Link
                  href={`/profiles/${session.user.id}`}
                  className="flex-1 inline-flex items-center justify-center h-10 px-4 text-sm rounded-lg font-medium transition-colors bg-orange-600 text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-300"
                >
                  Ver mi perfil
                </Link>
                <Link
                  href="/promote/profile"
                  className="flex-1 inline-flex items-center justify-center h-10 px-4 text-sm rounded-lg font-medium transition-colors border border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-orange-300"
                >
                  Promocionar perfil (Roomies)
                </Link>
              </div>
            </>
          ) : (
            <EmptyState
              variant="compact"
              icon="profile"
              title="Aún no has completado tu perfil"
              ctaLabel="Completar perfil"
              ctaHref="/onboarding/step-1"
            />
          )}
          </CardContent>
        </Card>

        {/* Card: Your listings */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium mb-4">Tus anuncios</h2>
          </CardHeader>
          <CardContent>
          {!listings || listings.length === 0 ? (
            <EmptyState
              variant="compact"
              icon="listings"
              title="Aún no has creado ningún listing"
              ctaLabel="Crear listing"
              ctaHref="/listings/new"
            />
          ) : (
            <div className="space-y-3">
              {listings.map((listing) => {
                const typeLabel = listing.listing_type === 'room' ? 'Rento cuarto' : 'Busco roomie'
                const now = new Date()
                const isFeatured = listing.featured_until && new Date(listing.featured_until) > now
                return (
                  <div
                    key={listing.id}
                    className="p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <Link href={`/listings/${listing.id}`} className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="subtle">{typeLabel}</Badge>
                          {isFeatured && <Badge variant="featured">Destacado</Badge>}
                        </div>
                        <h3 className="font-medium mb-1">{listing.title}</h3>
                        <p className="text-sm text-neutral-600">
                          {listing.city}, {listing.zone}
                        </p>
                        {listing.price_mxn && (
                          <p className="text-sm font-medium text-neutral-800 mt-1">
                            ${listing.price_mxn.toLocaleString()} MXN/mes
                          </p>
                        )}
                        {isFeatured && listing.featured_until && (
                          <p className="text-xs text-orange-700 mt-2">
                            Destacado hasta:{' '}
                            {new Date(listing.featured_until).toLocaleDateString('es-MX', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        )}
                      </Link>
                      <Link 
                        href={`/promote/listing/${listing.id}`}
                        className="inline-flex items-center justify-center h-9 px-3 text-sm rounded-lg font-medium transition-colors bg-orange-600 text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-300 whitespace-nowrap"
                      >
                        Promocionar anuncio
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          </CardContent>
        </Card>
      </div>

      {/* Card: Verifications */}
      <Card className="mt-4 md:mt-6">
        <CardHeader>
          <h2 className="text-lg font-medium mb-4">Verificaciones</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg opacity-50">
              <div>
                <p className="font-medium text-sm">Verificar teléfono</p>
                <p className="text-xs text-neutral-500">Próximamente</p>
              </div>
              <Button disabled variant="secondary" size="sm">Verificar</Button>
            </div>
            <div className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg opacity-50">
              <div>
                <p className="font-medium text-sm">Verificar identificación</p>
                <p className="text-xs text-neutral-500">Próximamente</p>
              </div>
              <Button disabled variant="secondary" size="sm">Verificar</Button>
            </div>
            <div className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg opacity-50">
              <div>
                <p className="font-medium text-sm">Redes sociales</p>
                <p className="text-xs text-neutral-500">Próximamente</p>
              </div>
              <Button disabled variant="secondary" size="sm">Verificar</Button>
            </div>
            <div className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg opacity-50">
              <div>
                <p className="font-medium text-sm">Reporte de crédito</p>
                <p className="text-xs text-neutral-500">Próximamente</p>
              </div>
              <Button disabled variant="secondary" size="sm">Verificar</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

