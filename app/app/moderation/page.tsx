import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import TopBar from '@/components/top-bar';
import ModerationPanel from './moderation-panel';

export default async function ModerationPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .schema('core')
    .from('profiles')
    .select('display_name, is_moderator')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile) redirect('/onboarding');

  if (!profile.is_moderator) {
    return (
      <div className="feed-shell">
        <TopBar active="moderation" />
        <main className="moderation-main">
          <p className="empty-state">Cette page est réservée aux moderateurs.</p>
        </main>
      </div>
    );
  }

  const { data: reports } = await supabase
    .schema('moderation')
    .from('reports')
    .select('id, reporter_id, target_type, target_id, reason, details, status, created_at')
    .order('created_at', { ascending: false })
    .limit(100);

  const rows = reports ?? [];
  const reporterIds = Array.from(new Set(rows.map((r) => r.reporter_id)));
  let reporterNames: Record<string, string> = {};

  if (reporterIds.length > 0) {
    const { data: reporters } = await supabase
      .schema('core')
      .from('profiles_public')
      .select('id, display_name')
      .in('id', reporterIds);
    reporterNames = Object.fromEntries((reporters ?? []).map((r) => [r.id, r.display_name]));
  }

  const postIds = rows.filter((r) => r.target_type === 'post').map((r) => r.target_id);
  let postContents: Record<string, string> = {};

  if (postIds.length > 0) {
    const { data: postRows } = await supabase
      .schema('social')
      .from('posts')
      .select('id, content')
      .in('id', postIds);
    postContents = Object.fromEntries((postRows ?? []).map((p) => [p.id, p.content]));
  }

  const enrichedReports = rows.map((r) => ({
    ...r,
    reporterName: reporterNames[r.reporter_id] ?? 'Un membre',
    postContent: r.target_type === 'post' ? postContents[r.target_id] ?? null : null,
  }));

  return (
    <div className="feed-shell">
      <TopBar active="moderation" />
      <main className="moderation-main">
        <h1>Moderation</h1>
        <p className="sub">{enrichedReports.length} signalement(s)</p>
        <ModerationPanel reports={enrichedReports} />
      </main>
    </div>
  );
}
