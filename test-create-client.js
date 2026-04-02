/* Script para verificar e criar cliente de teste via Supabase */
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testCreateClient() {
  // Primeiro: fazer login como consultora
  console.log('1. Fazendo login como consultora...')
  const { data: { user }, error: loginError } = await supabase.auth.signInWithPassword({
    email: 'moreiraisrael1997@gmail.com',
    password: '56169715'
  })
  
  if (loginError) {
    console.error('❌ Erro no login:', loginError.message)
    return
  }
  console.log('✅ Logada como:', user?.email, 'ID:', user?.id)

  // Segundo: tentar criar usuário cliente com signUp
  console.log('\n2. Criando cliente de teste...')
  const testEmail = `cliente.teste.${Date.now()}@exemplo.com`
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email: testEmail,
    password: 'ClienteTest@123!',
    options: {
      data: { full_name: 'Ana Teste Silva', user_type: 'client' }
    }
  })

  if (signUpError) {
    console.error('❌ Erro no signUp:', signUpError.message)
    console.error('Status:', signUpError.status)
    return
  }
  
  console.log('✅ Auth user criado:')
  console.log('   ID:', authData.user?.id)
  console.log('   Email:', authData.user?.email)
  console.log('   Confirmed:', authData.user?.email_confirmed_at ? 'SIM' : 'NÃO (esperando confirmação)')
  console.log('   Session:', authData.session ? 'ATIVA' : 'NULA (email pendente)')

  // Terceiro: verificar se podemos inserir na profiles
  if (authData.user) {
    console.log('\n3. Tentando inserir na tabela profiles...')
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        full_name: 'Ana Teste Silva',
        email: testEmail,
        user_type: 'client',
        consultant_id: user?.id,
      })
      .select()
      .single()

    if (profileError) {
      console.error('❌ Erro ao inserir profile:', profileError.message)
      console.error('Code:', profileError.code)
    } else {
      console.log('✅ Profile criado:', JSON.stringify(profile, null, 2))
    }
  }
}

testCreateClient()
