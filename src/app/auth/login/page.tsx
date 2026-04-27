export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import LoginClient from './login-client'

export const metadata: Metadata = {
  title: 'Login - App Marry',
}

export default function LoginPage() {
  return (
    <>
      <div id="vercel-dedupe-bypass-login" style={{ display: 'none' }} aria-hidden="true" />
      <LoginClient />
    </>
  )
}
