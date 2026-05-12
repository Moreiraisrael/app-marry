const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  const { data, error, count } = await supabaseAdmin
    .from('profiles')
    .update({ full_name: 'test' })
    .eq('id', '00000000-0000-0000-0000-000000000000')
    .select(); // Add select to check affected rows

  console.log('Error:', error);
  console.log('Data:', data);
}

test();
