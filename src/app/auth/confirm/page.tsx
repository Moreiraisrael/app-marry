'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export default function ConfirmPage() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error || !session) {
        console.error('Session error or no session:', error)
        router.push('/auth/consultant?error=Invalid+Link')
        return
      }

      // We have a session! Check if there is a next parameter to redirect
      const searchParams = new URLSearchParams(window.location.search)
      let next = searchParams.get('next')

      // Fallback: Check if we have a cookie set by the verify route
      if (!next) {
        const cookies = document.cookie.split(';')
        for (const cookie of cookies) {
          const [name, value] = cookie.trim().split('=')
          if (name === 'redirect_next') {
            next = decodeURIComponent(value)
            // Clear the cookie
            document.cookie = 'redirect_next=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
            break
          }
        }
      }

      if (next) {
        router.push(next)
        return
      }

      // Check the profile to redirect properly as fallback
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', session.user.id)
        .single()

      if (profile?.user_type === 'client') {
        router.push('/client/dashboard')
      } else {
        router.push('/consultant/dashboard')
      }
    }

    // Supabase will automatically parse the #access_token from the URL 
    // and establish the session on the client side. We just need to wait for it.
    // getSession() will read it if it has already been parsed, but to be safe we can also listen to auth changes:
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        if (session) checkSession()
      }
    })

    // Se a URL não tiver hash (ou seja, não for implicit flow),
    // ou se o cliente já inicializou e limpou a hash, tentamos checar a sessão agora:
    if (!window.location.hash || !window.location.hash.includes('access_token')) {
      checkSession()
    }

    // Fallback de segurança: se após 3 segundos a sessão não tiver sido processada (ex: link expirado)
    const timeoutId = setTimeout(() => {
      checkSession()
    }, 3000)

    return () => {
      authListener.subscription.unsubscribe()
      clearTimeout(timeoutId)
    }
  }, [router])

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col items-center justify-center p-4">
      <Loader2 className="h-8 w-8 animate-spin text-[#c2b291] mb-4" />
      <p className="text-[#565554] font-serif text-lg">Confirmando seu acesso...</p>
    </div>
  )
}
