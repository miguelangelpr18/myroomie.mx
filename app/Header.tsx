import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'
import HeaderModeTabs from './components/HeaderModeTabs'
import UserMenu from './components/UserMenu'
import GlobalSearchBar from './components/search/GlobalSearchBar'
import QuickSearchDropdown from './components/search/QuickSearchDropdown'
import LogoLink from './components/LogoLink'

export default async function Header() {
  const supabase = createServerSupabaseClient()

  // Obtener sesión
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    // No hay sesión: mostrar links públicos
    return (
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-neutral-200/60">
        <div className="mx-auto flex h-16 items-center justify-between gap-4 px-4 md:px-6">
          {/* Left: Logo */}
          <LogoLink />
          
          {/* Center: Quick Search + Create Button */}
          <div className="flex-1 flex items-center justify-center gap-2 max-w-xl mx-4 hidden md:flex">
            <div className="flex-1">
              <QuickSearchDropdown />
            </div>
            <Link
              href="/listings/new"
              className="flex-shrink-0 w-11 h-11 rounded-full bg-white text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 active:bg-neutral-100 transition-colors flex items-center justify-center shadow-sm ring-1 ring-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-2"
              aria-label="Publicar anuncio"
            >
              <span className="text-xl font-semibold leading-none">+</span>
            </Link>
          </div>
          
          {/* Right: Actions */}
          <nav className="flex gap-4 items-center flex-shrink-0">
            <HeaderModeTabs userId={undefined} hasProfile={undefined} />
            <Link href="/login" className="hover:underline">
              Iniciar sesión
            </Link>
            <Link href="/signup" className="hover:underline">
              Registrarse
            </Link>
          </nav>
        </div>
        {/* Mobile: Search bar below */}
        <div className="md:hidden px-4 pb-3">
          <QuickSearchDropdown />
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
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-neutral-200/60">
      <div className="mx-auto flex h-16 items-center justify-between gap-4 px-4 md:px-6">
        {/* Left: Logo */}
        <LogoLink />
        
        {/* Center: Quick Search + Create Button */}
        <div className="flex-1 flex items-center justify-center gap-2 max-w-xl mx-4 hidden md:flex">
          <div className="flex-1">
            <QuickSearchDropdown />
          </div>
          <Link
            href="/listings/new"
            className="flex-shrink-0 w-11 h-11 rounded-full bg-white text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 active:bg-neutral-100 transition-colors flex items-center justify-center shadow-sm ring-1 ring-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-2"
            aria-label="Publicar anuncio"
          >
            <span className="text-xl font-semibold leading-none">+</span>
          </Link>
        </div>
        
        {/* Right: Actions */}
        <nav className="flex gap-4 items-center flex-shrink-0">
          <HeaderModeTabs userId={session.user.id} hasProfile={!!profile} />
          {/* Minimal Right: Messages Icon + Avatar */}
          <div className="inline-flex items-center gap-2">
            <Link
              href="/messages"
              className="w-10 h-10 rounded-full bg-white ring-1 ring-black/5 hover:bg-neutral-50 transition-colors flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
              aria-label="Mensajes"
            >
              <svg
                className="w-5 h-5 text-neutral-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </Link>
            <div className="[&_button>span]:hidden">
              <UserMenu
                displayName={displayName}
                avatarUrl={profile?.avatar_url || null}
                userId={session.user.id}
                initial={initial}
              />
            </div>
          </div>
        </nav>
      </div>
      {/* Mobile: Quick Search below */}
      <div className="md:hidden px-4 pb-3">
        <QuickSearchDropdown />
      </div>
    </header>
  )
}

