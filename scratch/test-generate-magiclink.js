const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  const email = 'confirmeduser@example.com';

  const magicLinkResult = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email: email,
    options: {
      redirectTo: 'http://localhost:3000/auth/callback'
    }
  });

  console.log('Magic Link Error:', magicLinkResult.error?.message);
  console.log('Magic Link User:', magicLinkResult.data?.user?.id);
  console.log('Magic Link Link:', magicLinkResult.data?.properties?.action_link);
}

test();
