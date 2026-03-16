import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requireProfileOrRedirect } from '@/lib/requireProfile'
import { redirect } from 'next/navigation'
import OnboardingLifestyleForm from './OnboardingLifestyleForm'

export default async function OnboardingStep2Page() {
  const { user } = await requireProfileOrRedirect()

  const supabase = createServerSupabaseClient()

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('pets, smoker, cleanliness, parties, schedule')
    .eq('user_id', user.id)
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
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-brand">Paso 2 de 2</span>
          <span className="text-sm text-neutral-500">100% completado</span>
        </div>
        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
          <div className="h-full bg-brand w-full transition-all duration-300"></div>
        </div>
      </div>

      <h1 className="text-2xl font-semibold tracking-tight mb-3">Estilo de vida</h1>
      <p className="text-neutral-500 text-sm mb-8">
        Comparte información sobre tu estilo de vida para encontrar un roomie compatible.
      </p>

      <OnboardingLifestyleForm initialData={initialData} />
    </div>
  )
}



