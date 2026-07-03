'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Comment = {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
};

export default function CommentsSection(props: { postId: string; initialCount: number }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [text, setText] = useState('');
  const [count, setCount] = useState(props.initialCount);
  const [sending, setSending] = useState(false);

  async function loadComments() {
    setLoading(true);
    const supabase = createClient();

    const { data: rows } = await supabase
      .schema('social')
      .from('comments')
      .select('id, author_id, content, created_at')
      .eq('post_id', props.postId)
      .order('created_at', { ascending: true });

    const authorIds = Array.from(new Set((rows ?? []).map((r) => r.author_id)));
    let names: Record<string, string> = {};

    if (authorIds.length > 0) {
      const { data: profs } = await supabase
        .schema('core')
        .from('profiles_public')
        .select('id, display_name')
        .in('id', authorIds);
      names = Object.fromEntries((profs ?? []).map((p) => [p.id, p.display_name]));
    }

    setComments(
      (rows ?? []).map((r) => ({
        id: r.id,
        authorId: r.author_id,
        authorName: names[r.author_id] ?? 'Un membre',
        content: r.content,
      }))
    );
    setLoading(false);
  }

  function handleToggle() {
    const next = !open;
    setOpen(next);
    if (next && comments === null) loadComments();
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);

    const supabase = createClient();
    const userResult = await supabase.auth.getUser();
    const user = userResult.data.user;
    if (!user) {
      setSending(false);
      return;
    }

    const result = await supabase
      .schema('social')
      .from('comments')
      .insert({ post_id: props.postId, author_id: user.id, content: text.trim() })
      .select('id')
      .single();

    setSending(false);

    if (!result.error && result.data) {
      setComments((prev) => [
        ...(prev ?? []),
        { id: result.data.id, authorId: user.id, authorName: 'Toi', content: text.trim() },
      ]);
      setCount((c) => c + 1);
      setText('');
    }
  }

  return (
    <div>
      <button type="button" className="post-action-btn" onClick={handleToggle}>
        💬 {count > 0 ? count : ''}
      </button>

      {open && (
        <div className="comments-box">
          {loading && <p className="hint">Chargement...</p>}

          {comments?.map((c) => (
            <div key={c.id} className="comment-item">
              <a href={'/app/u/' + c.authorId} className="comment-author">{c.authorName}</a>
              <span className="comment-text">{c.content}</span>
            </div>
          ))}

          <form onSubmit={handleAdd} className="comment-form">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ecrire un commentaire..."
            />
            <button type="submit" disabled={sending || !text.trim()}>
              Envoyer
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
