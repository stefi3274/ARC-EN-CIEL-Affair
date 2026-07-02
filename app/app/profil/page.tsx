import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import TopBar from '@/components/top-bar';
import ProfilClient from './profil-client';

export default async function ProfilPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .schema('core')
    .from('profiles')
    .select('display_name, pronouns, pronouns_visible, theme_accent, theme_font, theme_mode')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile) redirect('/onboarding');

  return (
    <div className="feed-shell">
      <TopBar active="profil" />
      <main className="feed-main">
        <ProfilClient
          displayName={profile.display_name}
          pronouns={profile.pronouns ?? ''}
          pronounsVisible={profile.pronouns_visible}
          themeAccent={profile.theme_accent ?? 'gold'}
          themeFont={profile.theme_font ?? 'editorial'}
          themeMode={profile.theme_mode ?? 'dark'}
        />
      </main>
    </div>
  );
}
