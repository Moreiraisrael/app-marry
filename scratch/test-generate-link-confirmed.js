const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  const email = 'confirmeduser@example.com';
  
  // Create user directly
  const { data: user, error: userError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: 'password123',
    email_confirm: true // CONFIRMED!
  });
  
  if (userError) {
    console.log('Error creating user:', userError.message);
  }

  // Try to create an invite
  console.log('Generating invite link...');
  const inviteResult = await supabaseAdmin.auth.admin.generateLink({
    type: 'invite',
    email: email,
    options: {
      redirectTo: 'http://localhost:3000/auth/callback'
    }
  });

  console.log('Invite Error:', inviteResult.error?.message);
  console.log('Invite Link:', inviteResult.data?.properties?.action_link);
}

test();
