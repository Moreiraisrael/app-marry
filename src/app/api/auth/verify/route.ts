import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const token = searchParams.get('token')
  const type = searchParams.get('type') || 'invite'
  const next = searchParams.get('next')
  
  if (token) {
    const supabase = await createClient()
    
    // Verificação nativa server-side, contornando redirects problemáticos do Supabase
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: type as any
    })
    
    if (error) {
      console.error('Erro ao verificar link no servidor:', error.message)
      return NextResponse.redirect(`${origin}/auth/consultant?error=Invalid+Link`)
    }
    
    // Redireciona diretamente para o destino, a sessão já está nos cookies
    if (next) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    
    return NextResponse.redirect(`${origin}/auth/consultant`)
  }

  return NextResponse.redirect(`${origin}/auth/consultant`)
}
