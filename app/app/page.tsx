import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SignOutButton from './sign-out-button';

export default async function AppHome() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .schema('core')
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .maybeSingle();

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="brand-mark"></span>ARC-EN-CIEL Affair
        </div>
        <h1>Salut {profile?.display_name ?? ''}.</h1>
        <p className="sub">
          Ton compte est prêt. Les modules (fil, rencontre, emploi, marketplace, agenda)
          arrivent ensuite, un par un.
        </p>
        <SignOutButton />
      </div>
    </div>
  );
}
