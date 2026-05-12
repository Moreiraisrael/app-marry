export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import LoginClient from './login-client'
import { ConfigureTestsModal } from "@/components/quizzes/ConfigureTestsModal"

export const metadata: Metadata = {
  title: 'Login - App Marry',
}

export default function LoginPage() {
  return (
    <div className="flex h-screen w-full bg-background relative overflow-hidden">
      <div className="absolute top-4 left-4 z-50">
         <ConfigureTestsModal />
      </div>
      <div className="flex w-full h-full p-2 relative z-10">
        <div id="vercel-dedupe-bypass-login" style={{ display: 'none' }} aria-hidden="true" />
        <LoginClient />
      </div>
    </div>
  )
}
