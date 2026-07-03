'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function PostComposer(props: { groupId?: string; onPosted?: () => void }) {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);

    const supabase = createClient();
    const userResult = await supabase.auth.getUser();
    const user = userResult.data.user;
    if (!user) {
      setUploading(false);
      return;
    }

    const path = user.id + '/' + Date.now() + '-' + file.name;
    const uploadResult = await supabase.storage.from('posts').upload(path, file);

    setUploading(false);

    if (uploadResult.error) {
      setError("Envoi de l'image impossible.");
      return;
    }

    const publicUrl = supabase.storage.from('posts').getPublicUrl(path).data.publicUrl;
    setMediaUrl(publicUrl);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() && !mediaUrl) return;
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const userResult = await supabase.auth.getUser();
    const user = userResult.data.user;

    if (!user) {
      setError('Session expiree, reconnecte-toi.');
      setLoading(false);
      return;
    }

    const result = await supabase
      .schema('social')
      .from('posts')
      .insert({ author_id: user.id, content: content.trim() || '', media_url: mediaUrl, group_id: props.groupId ?? null });

    setLoading(false);

    if (result.error) {
      setError('Publication impossible. Reessaie.');
      return;
    }

    setContent('');
    setMediaUrl(null);
    if (props.onPosted) props.onPosted();
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

      {mediaUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={mediaUrl} alt="" className="post-image" style={{ marginBottom: 14 }} />
      )}

      <div className="photo-row" style={{ marginBottom: 14 }}>
        <label className="photo-upload-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          {uploading ? '...' : mediaUrl ? 'Changer' : '+ Photo'}
          <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
        </label>
      </div>

      {error && <p className="error-msg">{error}</p>}
      <button type="submit" disabled={loading || (!content.trim() && !mediaUrl)}>
        {loading ? 'Publication...' : 'Publier'}
      </button>
    </form>
  );
}
