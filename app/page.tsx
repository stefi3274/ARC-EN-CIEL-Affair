import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function Home() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .schema('core')
    .from('profiles')
    .select('id')
    .eq('id', user!.id)
    .maybeSingle();

  if (!profile) {
    redirect('/onboarding');
  }

  redirect('/app');
}
