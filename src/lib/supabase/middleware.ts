import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
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

  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth')
  const isProtectedClient = request.nextUrl.pathname.startsWith('/client')
  const isProtectedConsultant = request.nextUrl.pathname.startsWith('/consultant')
  const isProtectedAdmin = request.nextUrl.pathname.startsWith('/admin')

  // Se o usuário não está autenticado e tenta acessar uma rota protegida
  if (!user && (isProtectedClient || isProtectedConsultant || isProtectedAdmin)) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // Se o usuário já está autenticado e tenta acessar /auth, envia pro dashboard
  if (user && isAuthRoute) {
    // Nós idealmente redirecionaríamos com base no tipo de perfil (user_type)
    // Como a resposta aqui pode ser rápida e ler o profile custa 1 call adicional:
    // podemos apenas mandar pra um router / hub ou inferir pelo pathname se existe
    const url = request.nextUrl.clone()
    url.pathname = '/consultant/dashboard' // default provisório
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
