import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requireProfileOrRedirect } from '@/lib/requireProfile'
import { redirect } from 'next/navigation'
import OnboardingLifestyleForm from './OnboardingLifestyleForm'

export default async function OnboardingStep2Page() {
  // Verificar que el usuario tenga perfil
  await requireProfileOrRedirect()

  const supabase = createServerSupabaseClient()

  // Verificar sesión
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (!session || sessionError) {
    redirect('/login')
  }

  // Buscar perfil del usuario (para verificar que existe)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('pets, smoker, cleanliness, parties, schedule')
    .eq('user_id', session.user.id)
    .single()

  // Si no existe perfil, redirect a step-1
  if (!profile || profileError) {
    redirect('/onboarding/step-1')
  }

  // Pasar datos iniciales al formulario
  const initialData = {
    pets: profile.pets ?? null,
    smoker: profile.smoker ?? null,
    cleanliness: profile.cleanliness ?? null,
    parties: profile.parties ?? null,
    schedule: profile.schedule ?? null,
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Estilo de vida</h1>
      <p className="text-gray-600 mb-8">
        Comparte información sobre tu estilo de vida para encontrar un roomie compatible.
      </p>

      <OnboardingLifestyleForm initialData={initialData} />
    </div>
  )
}

