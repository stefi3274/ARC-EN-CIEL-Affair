'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function PostComposer() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const userResult = await supabase.auth.getUser();
    const user = userResult.data.user;

    if (!user) {
      setError("Session expirée, reconnecte-toi.");
      setLoading(false);
      return;
    }

    const result = await supabase
      .schema('social')
      .from('posts')
      .insert({ author_id: user.id, content: content.trim() });

    setLoading(false);

    if (result.error) {
      setError("Publication impossible. Réessaie.");
      return;
    }

    setContent('');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="composer">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Quoi de neuf ?"
        rows={3}
      />
      {error && <p className="error-msg">{error}</p>}
      <button type="submit" disabled={loading || !content.trim()}>
        {loading ? 'Publication...' : 'Publiér'}
      </button>
    </form>
  );
}
