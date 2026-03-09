import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requireAuthOrRedirect } from '@/lib/requireAuth'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import EditProfileForm from './EditProfileForm'

export const metadata: Metadata = {
  title: 'Editar perfil',
}

export default async function EditProfilePage() {
  await requireAuthOrRedirect()

  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .maybeSingle()

  if (!profile) redirect('/onboarding/step-1')

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight mb-1">Editar perfil</h1>
        <p className="text-sm text-neutral-500">Los cambios se reflejan de inmediato en tu perfil público.</p>
      </div>
      <EditProfileForm profile={profile} />
    </div>
  )
}
