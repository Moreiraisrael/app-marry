const { createClient } = require('@supabase/supabase-js');

async function test() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // Let's use the consultant's email to login
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error: signInError } = await supabase.auth.signInWithPassword({
    email: 'teste@marrymiele.com',
    password: 'password123' // Or we can just insert with anon if we disable RLS, but wait
  });

  if (signInError) {
    console.error('Login error:', signInError.message);
    // If login fails, we can't test RLS properly from outside without the password.
  } else {
    console.log('Logged in as:', data.user.id);
    const { error: upsertError } = await supabase
      .from('quiz_configurations')
      .upsert({
        consultant_id: data.user.id,
        quiz_type: 'style',
        questions: [{ id: '1', text: 'Test', options: ['A'] }],
        updated_at: new Date().toISOString()
      }, { onConflict: 'consultant_id,quiz_type' });

    if (upsertError) {
      console.error('Upsert failed:', upsertError);
    } else {
      console.log('Upsert succeeded!');
    }
  }
}

test();
