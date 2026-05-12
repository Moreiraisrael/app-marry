const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  const email = 'newuser999@example.com';
  
  console.log('Generating invite link with options.data...');
  const inviteResult = await supabaseAdmin.auth.admin.generateLink({
    type: 'invite',
    email: email,
    options: {
      data: {
        full_name: 'Test',
        user_type: 'client',
      },
      redirectTo: 'http://localhost:3000/auth/callback'
    }
  });

  console.log('Invite Error:', inviteResult.error?.message);
  console.log('Invite Link:', inviteResult.data?.properties?.action_link);
}

test();
