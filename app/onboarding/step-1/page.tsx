import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import OnboardingForm from './OnboardingForm'

export default async function OnboardingStep1Page() {
  const supabase = createServerSupabaseClient()

  const { data: { user }, error } = await supabase.auth.getUser()
  if (!user || error) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-brand">Paso 1 de 2</span>
          <span className="text-sm text-neutral-500">50% completado</span>
        </div>
        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
          <div className="h-full bg-brand w-1/2 transition-all duration-300"></div>
        </div>
      </div>

      <h1 className="text-3xl font-bold mb-6">Completa tu perfil</h1>
      <p className="text-gray-600 mb-8">
        Comparte información básica para que otros usuarios puedan encontrarte.
      </p>

      <OnboardingForm initialData={profile || null} />
    </div>
  )
}

