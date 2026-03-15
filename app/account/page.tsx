import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requireAuthOrRedirect } from '@/lib/requireAuth'
import AccountForm from './AccountForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Configuración de cuenta',
}

export default async function AccountPage() {
  const { user } = await requireAuthOrRedirect()

  const supabase = createServerSupabaseClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_url')
    .eq('user_id', user.id)
    .maybeSingle()

  const displayName = profile?.display_name || ''
  const avatarUrl = profile?.avatar_url || null
  const email = user.email || ''

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Configuración de cuenta</h1>

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
        <h2 className="text-xl font-semibold mb-4">Verificaciones</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg opacity-50">
            <div>
              <p className="font-medium">Verificar teléfono</p>
              <p className="text-sm text-gray-500">Próximamente</p>
            </div>
            <button disabled className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg text-sm cursor-not-allowed">
              Verificar
            </button>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg opacity-50">
            <div>
              <p className="font-medium">Verificar identificación</p>
              <p className="text-sm text-gray-500">Próximamente</p>
            </div>
            <button disabled className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg text-sm cursor-not-allowed">
              Verificar
            </button>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg opacity-50">
            <div>
              <p className="font-medium">Redes sociales</p>
              <p className="text-sm text-gray-500">Próximamente</p>
            </div>
            <button disabled className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg text-sm cursor-not-allowed">
              Verificar
            </button>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg opacity-50">
            <div>
              <p className="font-medium">Reporte de crédito</p>
              <p className="text-sm text-gray-500">Próximamente</p>
            </div>
            <button disabled className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg text-sm cursor-not-allowed">
              Verificar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}



