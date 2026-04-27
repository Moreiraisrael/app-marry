import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  console.log("🔥 Starting Automated Client Test Flow Setup...")
  
  // Use Israel's account as consultant
  const consultantId = 'c586b8f5-9083-4ad8-a7ff-086640a20dc8'
  console.log(`✅ Consultant defined: ${consultantId}`)

  // Also fix his user_type just in case!
  await supabase.from('profiles').update({ user_type: 'consultant' }).eq('id', consultantId)

  const testEmail = `mariacliente_${Date.now()}@estilo.app.br`

  console.log("➡️ Registering new client...")
  const { data: authData, error: authErr } = await supabase.auth.signUp({
    email: testEmail,
    password: 'EleganciaVIP123!',
    options: {
      data: { full_name: 'Maria Victoria (Teste VIP)' }
    }
  })

  if (authErr && !authErr.message.includes('already registered')) {
    console.error("❌ Failed to sign up:", authErr)
    return
  }

  const clientId = authData.user?.id
  if (!clientId) return
  console.log(`✅ Client registered: ${testEmail} (${clientId})`)

  console.log("➡️ Configuring Client Profile...")
  await supabase.from('profiles').upsert({
    id: clientId,
    full_name: 'Maria Victoria (Teste VIP)',
    user_type: 'client',
    consultant_id: consultantId
  })

  console.log("➡️ Simulating 'Diagnóstico de Estilo'...")
  await supabase.from('quizzes').insert({
    client_id: clientId,
    quiz_type: 'Estilo Essencial',
    status: 'pending',
    answers: { 
        q1: 'Quero transmitir confiança', 
        q2: 'Meus fins de semana são com a família',
        q3: 'Gosto de cores neutras',
        q4: 'Amo tecidos naturais e cortes elegantes' 
    }
  })

  console.log("➡️ Simulating 'Análise de Biotipo'...")
  await supabase.from('quizzes').insert({
    client_id: clientId,
    quiz_type: 'Análise de Biotipo',
    status: 'pending',
    answers: { 
        height: '1.68m', 
        weight: '62kg',
        body_shape: 'Ampulheta',
        focus: 'Disfarçar ombros largos' 
    }
  })

  console.log("➡️ Simulating 'Análise de Coloração'...")
  await supabase.from('color_analysis_requests').insert({
    client_id: clientId,
    status: 'pending',
    images: ['https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=3000']
  })

  console.log("\n🎉 TEST COMPLETE: Client successfully injected with full Etapas!")
}

run()
