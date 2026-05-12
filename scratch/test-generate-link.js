const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  const email = 'testuser123@example.com';
  
  // Try to create an invite
  console.log('Generating invite link...');
  const inviteResult = await supabaseAdmin.auth.admin.generateLink({
    type: 'invite',
    email: email,
    options: {
      data: {
        full_name: 'Test User',
        user_type: 'client',
      },
      redirectTo: 'http://localhost:3000/auth/callback'
    }
  });

  console.log('Invite Error:', inviteResult.error?.message);
  console.log('Invite Link:', inviteResult.data?.properties?.action_link);
  
  if (inviteResult.error) {
    console.log('Trying magic link...');
    const magicLinkResult = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: 'http://localhost:3000/auth/callback'
      }
    });
    console.log('Magic Link Error:', magicLinkResult.error?.message);
    console.log('Magic Link Link:', magicLinkResult.data?.properties?.action_link);
  }
}

test();
