require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY); // oh wait, we only have anon key
async function test() {
  const { data, error } = await s.from('partner_stores').insert({ name: 'test', user_id: '123' });
  console.log(error);
}
test();
