import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'
import HeaderModeTabs from './components/HeaderModeTabs'
import UserMenu from './components/UserMenu'
import GlobalSearchBar from './components/search/GlobalSearchBar'

export default async function Header() {
  const supabase = createServerSupabaseClient()

  // Obtener sesión
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    // No hay sesión: mostrar links públicos
    return (
      <header className="border-b border-neutral-200 bg-white relative z-30">
        <div className="mx-auto flex h-16 items-center justify-between gap-4 px-4 md:px-8">
          <Link href="/" className="text-xl font-semibold tracking-tight text-neutral-900 hover:text-neutral-700 flex-shrink-0">
            myroomie.mx
          </Link>
          <div className="flex-1 max-w-2xl mx-4 hidden md:block">
            <GlobalSearchBar />
          </div>
          <nav className="flex gap-4 items-center flex-shrink-0">
            <HeaderModeTabs userId={undefined} hasProfile={undefined} />
            <Link href="/login" className="hover:underline">
              Login
            </Link>
            <Link href="/signup" className="hover:underline">
              Signup
            </Link>
          </nav>
        </div>
        <div className="md:hidden px-4 pb-3">
          <GlobalSearchBar />
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
    <header className="border-b border-neutral-200 bg-white relative z-30">
      <div className="mx-auto flex h-16 items-center justify-between gap-4 px-4 md:px-8">
        <Link href="/" className="text-xl font-semibold tracking-tight text-neutral-900 hover:text-neutral-700 flex-shrink-0">
          myroomie.mx
        </Link>
        <div className="flex-1 max-w-2xl mx-4 hidden md:block">
          <GlobalSearchBar />
        </div>
        <nav className="flex gap-4 items-center flex-shrink-0">
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
      <div className="md:hidden px-4 pb-3">
        <GlobalSearchBar />
      </div>
    </header>
  )
}

