import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local or .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') })
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials in .env.local or .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testAuth() {
  console.log('Testing Supabase Auth connection to:', supabaseUrl)
  const testEmail = `test_${Date.now()}@example.com`
  const testPassword = 'Password123!'

  console.log(`\n1. Attempting to sign up with ${testEmail}...`)
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      data: {
        full_name: 'Test User',
        user_type: 'client'
      }
    }
  })

  if (signUpError) {
    console.error('   ❌ Sign up failed:', signUpError.message)
    return
  }

  console.log('   ✅ Sign up successful!')
  if (signUpData.session) {
    console.log('   ℹ️ Session returned. Email confirmation is likely DISABLED.')
  } else {
    console.log('   ℹ️ No session returned. Email confirmation is likely ENABLED.')
  }

  console.log('\n2. Attempting to sign in right after sign up...')
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword
  })

  if (signInError) {
    console.error('   ❌ Sign in failed:', signInError.message)
  } else {
    console.log('   ✅ Sign in successful! User ID:', signInData.user.id)
  }
}

testAuth()
