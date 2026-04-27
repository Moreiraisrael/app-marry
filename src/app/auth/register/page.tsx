export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import RegisterClient from './register-client'

export const metadata: Metadata = {
  title: 'Cadastro - App Marry',
}

export default function RegisterPage() {
  return (
    <>
      <div id="vercel-dedupe-bypass-register" style={{ display: 'none' }} aria-hidden="true" />
      <RegisterClient />
    </>
  )
}
