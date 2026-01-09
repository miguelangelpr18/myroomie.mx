import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import OnboardingForm from './OnboardingForm'

export default async function OnboardingStep1Page() {
  const supabase = createServerSupabaseClient()

  // Verificar sesión - si no hay, redirigir a login
  const { data: { session }, error } = await supabase.auth.getSession()
  if (!session || error) {
    redirect('/login')
  }

  // Obtener perfil existente (si existe)
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .single()

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Completa tu perfil</h1>
      <p className="text-gray-600 mb-8">
        Comparte información básica para que otros usuarios puedan encontrarte.
      </p>

      <OnboardingForm initialData={profile || null} />
    </div>
  )
}

