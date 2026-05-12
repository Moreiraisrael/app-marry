const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local', override: true });
require('dotenv').config({ path: '.env', override: true });

async function test() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  // We need a consultant ID. Let's find one first.
  const { data: users, error: userError } = await supabase.auth.admin.listUsers();
  if (userError || !users || !users.users.length) {
    console.error('Failed to list users:', userError);
    return;
  }
  
  const consultantId = users.users[0].id; // just pick the first user
  console.log('Testing with consultant ID:', consultantId);

  const payload = {
    consultant_id: consultantId,
    quiz_type: 'style',
    questions: [{ id: '1', text: 'Test?', options: ['A', 'B'] }],
    updated_at: new Date().toISOString()
  };

  const { data, error: upsertError } = await supabase
    .from('quiz_configurations')
    .upsert(payload, { onConflict: 'consultant_id,quiz_type' })
    .select();

  if (upsertError) {
    console.error('Upsert failed:', upsertError);
  } else {
    console.log('Upsert succeeded! Data:', data);
  }
}

test();
