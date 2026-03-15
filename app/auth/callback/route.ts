import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

function getSafeRedirectPath(next: string | null): string {
  if (!next) return '/'
  // Only allow relative paths — block open redirects to external URLs
  if (next.startsWith('/') && !next.startsWith('//') && !next.includes('://')) {
    return next
  }
  return '/'
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = getSafeRedirectPath(searchParams.get('next'))

  if (code) {
    try {
      const supabase = createServerSupabaseClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) {
        // Use getUser() — validates token with the Supabase Auth server
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_id')
            .eq('user_id', user.id)
            .maybeSingle()

          if (!profile) {
            return NextResponse.redirect(`${origin}/onboarding/step-1`)
          }
        }
        return NextResponse.redirect(`${origin}${next}`)
      }
    } catch {
      // Fall through to error redirect
    }
  }

  return NextResponse.redirect(`${origin}/login?error=oauth_failed`)
}
