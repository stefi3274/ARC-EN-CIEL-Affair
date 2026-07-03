import { formatDateTime } from '@/lib/format-date';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import TopBar from '@/components/top-bar';
import PostComposer from './post-composer';
import PostMenu from './post-menu';
import LikeButton from './like-button';
import CommentsSection from './comments-section';
import ShareButton from './share-button';

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

  const rows = posts ?? [];
  const postIds = rows.map((p) => p.id);
  const authorIds = Array.from(new Set(rows.map((p) => p.author_id)));

  let authors: Record<string, { display_name: string; avatar_url: string | null }> = {};
  if (authorIds.length > 0) {
    const { data: authorRows } = await supabase
      .schema('core')
      .from('profiles_public')
      .select('id, display_name, avatar_url')
      .in('id', authorIds);
    authors = Object.fromEntries((authorRows ?? []).map((a) => [a.id, a]));
  }

  let likeCounts: Record<string, number> = {};
  let likedByMe = new Set<string>();
  let commentCounts: Record<string, number> = {};

  if (postIds.length > 0) {
    const { data: likeRows } = await supabase
      .schema('social')
      .from('likes')
      .select('post_id, user_id')
      .in('post_id', postIds);

    (likeRows ?? []).forEach((l) => {
      likeCounts[l.post_id] = (likeCounts[l.post_id] ?? 0) + 1;
      if (l.user_id === user.id) likedByMe.add(l.post_id);
    });

    const { data: commentRows } = await supabase
      .schema('social')
      .from('comments')
      .select('post_id')
      .in('post_id', postIds);

    (commentRows ?? []).forEach((c) => {
      commentCounts[c.post_id] = (commentCounts[c.post_id] ?? 0) + 1;
    });
  }

  return (
    <div className="feed-shell">
      <TopBar active="fil" />

      <main className="feed-main">
        <div className="groups-link-row">
          <a href="/app/groupes">Voir les groupes →</a>
        </div>
        <PostComposer />

        <div className="post-list">
          {rows.length === 0 && (
            <p className="hint" style={{ textAlign: 'center', marginTop: 40 }}>
              Aucun post pour le moment. Sois le premier a écrire quelque chose.
            </p>
          )}

          {rows.map((post) => {
            const author = authors[post.author_id];
            return (
              <article key={post.id} className="post-card">
                <div className="post-header">
                  <a href={'/app/u/' + post.author_id}>
                    <div
                      className="post-avatar"
                      style={author?.avatar_url ? { backgroundImage: 'url(' + author.avatar_url + ')', backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
                    ></div>
                  </a>
                  <div>
                    <a href={'/app/u/' + post.author_id} className="post-author-link">
                      {author ? author.display_name : 'Un membre'}
                    </a>
                    <div className="post-date">{formatDateTime(post.created_at)}</div>
                  </div>
                  <PostMenu postId={post.id} content={post.content} mediaUrl={post.media_url} isOwner={post.author_id === user.id} />
                </div>

                {post.content && <p className="post-content">{post.content}</p>}
                {post.media_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.media_url} alt="" className="post-image" />
                )}

                <div className="post-actions">
                  <LikeButton
                    postId={post.id}
                    initialLiked={likedByMe.has(post.id)}
                    initialCount={likeCounts[post.id] ?? 0}
                  />
                  <CommentsSection postId={post.id} initialCount={commentCounts[post.id] ?? 0} />
                  <ShareButton content={post.content} />
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}
