import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'
import LogoutButton from './app/LogoutButton'

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
            <Link href="/explore" className="hover:underline">
              Explore
            </Link>
            <Link href="/listings" className="hover:underline">
              Listings
            </Link>
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
          <Link href="/explore" className="hover:underline">
            Explore
          </Link>
          <Link href="/listings" className="hover:underline">
            Listings
          </Link>
          <Link href="/messages" className="hover:underline">
            Messages
          </Link>
          <div className="flex items-center gap-3 ml-4 pl-4 border-l">
            <div className="flex items-center gap-2">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={displayName}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                  {initial}
                </div>
              )}
              <span className="text-sm font-medium">{displayName}</span>
            </div>
            <LogoutButton />
          </div>
        </nav>
      </div>
    </header>
  )
}

