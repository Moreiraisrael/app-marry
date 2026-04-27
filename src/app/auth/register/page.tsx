export const dynamic = 'force-dynamic'

import RegisterClient from './register-client'

export default function RegisterPage() {
  // Unique identifier to bypass Vercel symlink EPERM bug
  console.log('Rendering RegisterPage')
  return <RegisterClient />
}
