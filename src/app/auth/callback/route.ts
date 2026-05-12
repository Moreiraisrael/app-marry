import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  let next = searchParams.get('next')

  if (code) {
    const supabase = await createClient()
    const { error, data: authData } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && authData?.user) {
      // Determine the correct next URL if it was not explicitly provided
      if (!next) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', authData.user.id)
          .single()

        if (profile?.user_type === 'client') {
          next = '/client/dashboard'
        } else {
          next = '/consultant/dashboard'
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
