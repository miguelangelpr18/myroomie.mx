import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function SignupIntentPage() {
  const supabase = createServerSupabaseClient()

  // Verificar sesión
  const { data: { session } } = await supabase.auth.getSession()

  // Si no hay sesión, mostrar CTAs para login/signup
  if (!session) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8 text-center">¿Qué quieres hacer primero?</h1>
        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Card 1: Buscar roomie */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h2 className="text-xl font-semibold mb-3">Buscar roomie</h2>
            <p className="text-gray-600 mb-4">
              Completa tu perfil y encuentra a tu roomie ideal.
            </p>
            <Link
              href="/login?intent=roomies"
              className="block w-full bg-[#FF7A18] text-white px-4 py-3 rounded-lg hover:bg-[#E86F14] text-center font-medium"
            >
              Continuar
            </Link>
          </div>

          {/* Card 2: Rentar */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h2 className="text-xl font-semibold mb-3">Rentar cuarto/depa/casa</h2>
            <p className="text-gray-600 mb-4">
              Publica tu anuncio y encuentra inquilinos.
            </p>
            <Link
              href="/login?intent=listings"
              className="block w-full bg-[#FF7A18] text-white px-4 py-3 rounded-lg hover:bg-[#E86F14] text-center font-medium"
            >
              Continuar
            </Link>
          </div>
        </div>

        {/* CTAs para login/signup */}
        <div className="text-center space-y-4">
          <p className="text-gray-600">¿Ya tienes cuenta?</p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/login"
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 font-medium"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/signup"
              className="bg-[#FF7A18] text-white px-6 py-2 rounded-lg hover:bg-[#E86F14] font-medium"
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Si hay sesión, mostrar cards con navegación directa
  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8 text-center">¿Qué quieres hacer primero?</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Card 1: Buscar roomie */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h2 className="text-xl font-semibold mb-3">Buscar roomie</h2>
          <p className="text-gray-600 mb-4">
            Completa tu perfil y encuentra a tu roomie ideal.
          </p>
          <Link
            href="/onboarding/step-1?intent=roomies"
            className="block w-full bg-[#FF7A18] text-white px-4 py-3 rounded-lg hover:bg-[#E86F14] text-center font-medium"
          >
            Continuar
          </Link>
        </div>

        {/* Card 2: Rentar */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h2 className="text-xl font-semibold mb-3">Rentar cuarto/depa/casa</h2>
          <p className="text-gray-600 mb-4">
            Publica tu anuncio y encuentra inquilinos.
          </p>
          <Link
            href="/listings/new"
            className="block w-full bg-[#FF7A18] text-white px-4 py-3 rounded-lg hover:bg-[#E86F14] text-center font-medium"
          >
            Continuar
          </Link>
        </div>
      </div>
    </div>
  )
}


