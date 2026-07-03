import { formatDateTime } from '@/lib/format-date';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import TopBar from '@/components/top-bar';
import PostComposer from './post-composer';
import ReportButton from './report-button';

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

  if (!profile) redirect('/onboarding');

  const { data: posts } = await supabase
    .schema('social')
    .from('posts')
    .select('id, author_id, content, media_url, created_at')
    .order('created_at', { ascending: false })
    .limit(30);

  const authorIds = Array.from(new Set((posts ?? []).map((p) => p.author_id)));
  let authors: Record<string, { display_name: string; avatar_url: string | null }> = {};

  if (authorIds.length > 0) {
    const { data: authorRows } = await supabase
      .schema('core')
      .from('profiles_public')
      .select('id, display_name, avatar_url')
      .in('id', authorIds);

    authors = Object.fromEntries((authorRows ?? []).map((a) => [a.id, a]));
  }

  return (
    <div className="feed-shell">
      <TopBar active="fil" />

      <main className="feed-main">
        <PostComposer />

        <div className="post-list">
          {(posts ?? []).length === 0 && (
            <p className="hint" style={{ textAlign: 'center', marginTop: 40 }}>
              Aucun post pour le moment. Sois le premier a ecrire quelque chose.
            </p>
          )}

          {(posts ?? []).map((post) => {
            const author = authors[post.author_id];
            return (
              <article key={post.id} className="post-card">
                <div className="post-header">
                  <div
                    className="post-avatar"
                    style={author?.avatar_url ? { backgroundImage: 'url(' + author.avatar_url + ')', backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
                  ></div>
                  <div>
                    <div className="post-author">{author ? author.display_name : 'Un membre'}</div>
                    <div className="post-date">{formatDateTime(post.created_at)}</div>
                  </div>
                </div>
                {post.content && <p className="post-content">{post.content}</p>}
                {post.media_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.media_url} alt="" className="post-image" />
                )}
                <ReportButton targetType="post" targetId={post.id} />
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}
