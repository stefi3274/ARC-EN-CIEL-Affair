import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import TopBar from '@/components/top-bar';
import { formatDateTime } from '@/lib/format-date';
import JournalInviteButton from '../../journal-invite-button';

export default async function PublicProfilePage({ params }: { params: { userId: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  if (params.userId === user.id) {
    redirect('/app/profil');
  }

  const { data: profile } = await supabase
    .schema('core')
    .from('profiles_public')
    .select('id, display_name, avatar_url, pronouns, identity_verified')
    .eq('id', params.userId)
    .maybeSingle();

  if (!profile) notFound();

  const { data: posts } = await supabase
    .schema('social')
    .from('posts')
    .select('id, content, media_url, created_at')
    .eq('author_id', params.userId)
    .order('created_at', { ascending: false })
    .limit(20);

  return (
    <div className="feed-shell">
      <TopBar active="fil" />
      <main className="feed-main">
        <div className="public-profile-header">
          <div
            className="message-avatar"
            style={{
              width: 72, height: 72,
              ...(profile.avatar_url ? { backgroundImage: 'url(' + profile.avatar_url + ')' } : {}),
            }}
          ></div>
          <div>
            <h1 style={{ marginBottom: 4 }}>
              {profile.display_name}
              {profile.identity_verified && <span className="verified-badge"> ✓</span>}
            </h1>
            {profile.pronouns && <p className="hint">{profile.pronouns}</p>}
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <JournalInviteButton currentUserId={user.id} targetUserId={params.userId} />
        </div>

        <div className="post-list" style={{ marginTop: 24 }}>
          {(posts ?? []).length === 0 && <p className="empty-state">Aucun post publié.</p>}

          {(posts ?? []).map((post) => (
            <article key={post.id} className="post-card">
              <div className="post-date">{formatDateTime(post.created_at)}</div>
              {post.content && <p className="post-content">{post.content}</p>}
              {post.media_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.media_url} alt="" className="post-image" />
              )}
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
