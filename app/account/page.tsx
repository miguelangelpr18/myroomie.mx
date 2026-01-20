import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requireAuthOrRedirect } from '@/lib/requireAuth'
import AccountForm from './AccountForm'

export default async function AccountPage() {
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
    .select('display_name, avatar_url')
    .eq('user_id', session.user.id)
    .maybeSingle()

  const displayName = profile?.display_name || ''
  const avatarUrl = profile?.avatar_url || null
  const email = session.user.email || ''

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <AccountForm
          initialData={{
            display_name: displayName,
            avatar_url: avatarUrl,
            email: email,
          }}
        />
      </div>

      {/* Verifications placeholder */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Verifications</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg opacity-50">
            <div>
              <p className="font-medium">Verify phone</p>
              <p className="text-sm text-gray-500">Coming soon</p>
            </div>
            <button disabled className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg text-sm cursor-not-allowed">
              Verify
            </button>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg opacity-50">
            <div>
              <p className="font-medium">Verify ID</p>
              <p className="text-sm text-gray-500">Coming soon</p>
            </div>
            <button disabled className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg text-sm cursor-not-allowed">
              Verify
            </button>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg opacity-50">
            <div>
              <p className="font-medium">Social media</p>
              <p className="text-sm text-gray-500">Coming soon</p>
            </div>
            <button disabled className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg text-sm cursor-not-allowed">
              Verify
            </button>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg opacity-50">
            <div>
              <p className="font-medium">Credit check</p>
              <p className="text-sm text-gray-500">Coming soon</p>
            </div>
            <button disabled className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg text-sm cursor-not-allowed">
              Verify
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

