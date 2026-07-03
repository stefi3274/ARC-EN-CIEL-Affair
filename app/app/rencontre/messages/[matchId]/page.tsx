import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ConversationClient from './conversation-client';

export default async function ConversationPage({ params }: { params: { matchId: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: match } = await supabase
    .schema('dating')
    .from('matches')
    .select('id, user_a, user_b')
    .eq('id', params.matchId)
    .maybeSingle();

  if (!match) notFound();

  const otherUserId = match.user_a === user.id ? match.user_b : match.user_a;

  if (match.user_a !== user.id && match.user_b !== user.id) {
    redirect('/app/rencontre');
  }

  const { data: otherProfile } = await supabase
    .schema('core')
    .from('profiles_public')
    .select('display_name, avatar_url')
    .eq('id', otherUserId)
    .maybeSingle();

  return (
    <ConversationClient
      matchId={match.id}
      currentUserId={user.id}
      otherUserId={otherUserId}
      otherName={otherProfile?.display_name ?? 'Un membre'}
      otherAvatar={otherProfile?.avatar_url ?? null}
    />
  );
}
