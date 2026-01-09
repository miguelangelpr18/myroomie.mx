import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import LogoutButton from './LogoutButton'

export default async function AppPage() {
  const supabase = createServerSupabaseClient()
  const { data: { session }, error } = await supabase.auth.getSession()

  // Si no hay sesión o hay error, redirigir a login
  if (!session || error) {
    redirect('/login')
  }

  const user = session.user

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <LogoutButton />
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Bienvenido</h2>
        <p className="text-gray-600 mb-2">
          <strong>Email:</strong> {user.email}
        </p>
        <p className="text-gray-600">
          <strong>ID:</strong> {user.id}
        </p>
      </div>
    </div>
  )
}

