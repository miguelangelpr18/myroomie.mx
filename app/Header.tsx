import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'
import HeaderModeTabs from './components/HeaderModeTabs'
import UserMenu from './components/UserMenu'

export default async function Header() {
  const supabase = createServerSupabaseClient()

  // Obtener sesión
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    // No hay sesión: mostrar links públicos
    return (
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            myroomie.mx
          </Link>
          <nav className="flex gap-4 items-center">
            <HeaderModeTabs userId={undefined} hasProfile={undefined} />
            <Link href="/login" className="hover:underline">
              Login
            </Link>
            <Link href="/signup" className="hover:underline">
              Signup
            </Link>
          </nav>
        </div>
      </header>
    )
  }

  // Hay sesión: obtener perfil para mostrar nombre/avatar
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_url')
    .eq('user_id', session.user.id)
    .maybeSingle()

  const displayName = profile?.display_name || 'Mi cuenta'
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          myroomie.mx
        </Link>
        <nav className="flex gap-4 items-center">
          <HeaderModeTabs userId={session.user.id} hasProfile={!!profile} />
          <Link href="/messages" className="hover:underline">
            Messages
          </Link>
          <div className="flex items-center gap-3 ml-4 pl-4 border-l">
            <UserMenu
              displayName={displayName}
              avatarUrl={profile?.avatar_url || null}
              userId={session.user.id}
              initial={initial}
            />
          </div>
        </nav>
      </div>
    </header>
  )
}

