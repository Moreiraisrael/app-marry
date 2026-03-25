const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function check() {
  console.log('Checking connection to:', supabaseUrl)
  const { data, error } = await supabase
    .from('profiles')
    .select('count', { count: 'exact', head: true })
  
  if (error) {
    if (error.message.includes('Could not find the table')) {
      console.error('❌ Table "profiles" DOES NOT exist yet.')
    } else {
      console.error('⚠️ Connection error:', error.message)
    }
  } else {
    console.log('✅ Table "profiles" EXISTS!')
  }
}

check()
