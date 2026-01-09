import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function Explore() {
  const supabase = createServerSupabaseClient()

  // Obtener perfiles (públicos)
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('display_name, city, zone, avatar_url')
    .limit(20)
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Explorar</h1>
        <Link
          href="/onboarding/step-1"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Crear/editar mi perfil
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-6">
          Error al cargar perfiles: {error.message}
        </div>
      )}

      {!profiles || profiles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg mb-4">Aún no hay perfiles</p>
          <Link
            href="/onboarding/step-1"
            className="text-blue-600 hover:underline"
          >
            Sé el primero en crear tu perfil
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((profile) => (
            <div
              key={profile.display_name}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              {profile.avatar_url && (
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name}
                  className="w-20 h-20 rounded-full mb-4 object-cover"
                />
              )}
              <h2 className="text-xl font-semibold mb-2">{profile.display_name}</h2>
              <p className="text-gray-600 mb-1">
                <strong>Ciudad:</strong> {profile.city}
              </p>
              <p className="text-gray-600">
                <strong>Zona:</strong> {profile.zone}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
