import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import TopBar from '@/components/top-bar';
import AgendaClient from './agenda-client';

export default async function AgendaPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: coreProfile } = await supabase
    .schema('core')
    .from('profiles')
    .select('display_name, identity_verified, email_verified')
    .eq('id', user.id)
    .maybeSingle();

  if (!coreProfile) redirect('/onboarding');

  const { data: events } = await supabase
    .schema('events')
    .from('events')
    .select('id, organizer_id, title, description, location, cover_url, starts_at, ends_at')
    .order('starts_at', { ascending: true })
    .limit(30);

  const { data: myRsvps } = await supabase
    .schema('events')
    .from('rsvps')
    .select('event_id, status')
    .eq('user_id', user.id);

  const { data: pétitions } = await supabase
    .schema('events')
    .from('pétitions')
    .select('id, creator_id, title, description, goal_signatures, created_at')
    .order('created_at', { ascending: false })
    .limit(30);

  const petitionIds = (pétitions ?? []).map((p) => p.id);
  let signatureCounts: Record<string, number> = {};
  let mySignatures = new Set<string>();

  if (petitionIds.length > 0) {
    const { data: signatures } = await supabase
      .schema('events')
      .from('petition_signatures')
      .select('petition_id, user_id')
      .in('petition_id', petitionIds);

    (signatures ?? []).forEach((s) => {
      signatureCounts[s.petition_id] = (signatureCounts[s.petition_id] ?? 0) + 1;
      if (s.user_id === user.id) mySignatures.add(s.petition_id);
    });
  }

  const { data: classifieds } = await supabase
    .schema('events')
    .from('classifieds')
    .select('id, author_id, category, title, description, price, location, created_at')
    .order('created_at', { ascending: false })
    .limit(30);

  return (
    <div className="feed-shell">
      <TopBar active="agenda" />

      <AgendaClient
        currentUserId={user.id}
        canSignPetitions={!!(coreProfile.identity_verified || coreProfile.email_verified)}
        events={events ?? []}
        myRsvps={myRsvps ?? []}
        pétitions={pétitions ?? []}
        signatureCounts={signatureCounts}
        mySignedIds={Array.from(mySignatures)}
        classifieds={classifieds ?? []}
      />
    </div>
  );
}
