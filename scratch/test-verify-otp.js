const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })
require('dotenv').config({ path: '.env' })

async function test() {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const email = 'test-magic-' + Date.now() + '@example.com'
  
  // 1. generateLink
  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email: email,
    options: {
      redirectTo: `http://localhost:3000/auth/confirm`
    }
  })

  if (linkError) {
    console.error('generateLink error', linkError)
    return
  }

  const actionLink = linkData.properties.action_link
  console.log('Action Link:', actionLink)

  const urlObj = new URL(actionLink)
  const token = urlObj.searchParams.get('token')
  const type = urlObj.searchParams.get('type')
  
  console.log('Extracted Token:', token)
  console.log('Extracted Type:', type)

  // 2. verifyOtp
  const { data: verifyData, error: verifyError } = await supabaseAdmin.auth.verifyOtp({
    token_hash: token,
    type: type
  })

  if (verifyError) {
    console.error('verifyOtp error', verifyError)
  } else {
    console.log('verifyOtp success! Session:', !!verifyData.session)
  }
}

test()
