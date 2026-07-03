import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import TopBar from '@/components/top-bar';
import GroupesClient from './groupes-client';

export default async function GroupesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: coreProfile } = await supabase
    .schema('core')
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .maybeSingle();

  if (!coreProfile) redirect('/onboarding');

  const { data: groups } = await supabase
    .schema('social')
    .from('groups')
    .select('id, name, city, topic, created_at')
    .order('created_at', { ascending: false });

  const { data: myMemberships } = await supabase
    .schema('social')
    .from('group_members')
    .select('group_id')
    .eq('user_id', user.id);

  const myGroupIds = (myMemberships ?? []).map((m) => m.group_id);

  return (
    <div className="feed-shell">
      <TopBar active="fil" />
      <main className="groups-main">
        <h1>Groupes</h1>
        <p className="sub">Retrouve les gens par ville ou par interet.</p>
        <GroupesClient groups={groups ?? []} myGroupIds={myGroupIds} />
      </main>
    </div>
  );
}
