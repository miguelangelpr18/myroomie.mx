import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requireAuthOrRedirect } from '@/lib/requireAuth'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import EditListingForm from './EditListingForm'

export const metadata: Metadata = {
  title: 'Editar anuncio',
}

export default async function EditListingPage({
  params,
}: {
  params: { id: string }
}) {
  const { user } = await requireAuthOrRedirect()

  const supabase = createServerSupabaseClient()

  const { data: listing } = await supabase
    .from('listings')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!listing) redirect('/listings')
  if (listing.user_id !== user.id) redirect(`/listings/${params.id}`)

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight mb-6">Editar anuncio</h1>
      <EditListingForm listing={listing} />
    </div>
  )
}
