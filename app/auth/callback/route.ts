import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    try {
      const supabase = createServerSupabaseClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_id')
            .eq('user_id', session.user.id)
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
