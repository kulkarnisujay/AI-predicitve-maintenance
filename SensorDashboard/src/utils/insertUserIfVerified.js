import { supabase } from '../supabase';

export async function insertUserIfVerified(user) {
  if (!user) return;

  const { data: profile, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile && user.email_confirmed_at) {
    const { error: insertError } = await supabase.from('users').insert([
      {
        id: user.id,
        email: user.email,
        created_at: new Date(),
      },
    ]);

    if (insertError) console.error('Insert error:', insertError);
    else console.log('User added to users table');
  }
}
