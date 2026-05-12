import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth') || request.nextUrl.pathname === '/'
  const isProtectedClient = request.nextUrl.pathname.startsWith('/client')
  const isProtectedConsultant = request.nextUrl.pathname.startsWith('/consultant')
  const isProtectedAdmin = request.nextUrl.pathname.startsWith('/admin')

  // Se o usuário não está autenticado e tenta acessar uma rota protegida
  if (!user) {
    if (isProtectedClient) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/client'
      return NextResponse.redirect(url)
    }
    if (isProtectedConsultant || isProtectedAdmin) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/consultant'
      return NextResponse.redirect(url)
    }
  }

  // Lógica de Redirecionamento Baseada em Role (user_type)
  if (user) {
    let userType = user.user_metadata?.user_type

    // Fallback: se não estiver nos metadados, busca no banco
    if (!userType) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .single()
      userType = profile?.user_type
    }

    // Bloqueia acesso cruzado
    if (isProtectedConsultant && userType === 'client') {
      const url = request.nextUrl.clone()
      url.pathname = '/client/dashboard'
      return NextResponse.redirect(url)
    }

    if (isProtectedClient && userType !== 'client') {
      const url = request.nextUrl.clone()
      url.pathname = '/consultant/dashboard'
      return NextResponse.redirect(url)
    }

    // Se tenta acessar rotas de auth (ex: /auth/login), redireciona pro dashboard
    if (isAuthRoute) {
      const url = request.nextUrl.clone()
      url.pathname = userType === 'client' ? '/client/dashboard' : '/consultant/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
