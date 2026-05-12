const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  const email = 'test_redirect_fail@example.com';
  
  const inviteResult = await supabaseAdmin.auth.admin.generateLink({
    type: 'invite',
    email: email,
    options: {
      redirectTo: 'https://completely-unauthorized-url.com/auth/callback'
    }
  });

  console.log('Error:', inviteResult.error?.message);
  console.log('Link:', inviteResult.data?.properties?.action_link);
}

test();
