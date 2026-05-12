import { createClient } from '@supabase/supabase-js'

// We will use the service role key to test the upsert, to bypass RLS and see if there is any database level error
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function testUpsert() {
  const { data, error } = await supabase
    .from('quiz_configurations')
    .upsert({
      consultant_id: 'e696f8c7-4318-4e89-a29d-111111111111', // dummy id
      quiz_type: 'style',
      questions: [{ text: 'Question 1', options: ['A', 'B'] }],
      updated_at: new Date().toISOString()
    }, { onConflict: 'consultant_id,quiz_type' })

  console.log({ data, error })
}

testUpsert()
