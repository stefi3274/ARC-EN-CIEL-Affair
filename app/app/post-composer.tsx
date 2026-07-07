'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { compressImage } from '@/lib/compress-image';

export default function PostComposer(props: { groupId?: string; onPosted?: () => void }) {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAvatar() {
      const supabase = createClient();
      const userResult = await supabase.auth.getUser();
      const user = userResult.data.user;
      if (!user) return;

      const { data } = await supabase
        .schema('core')
        .from('profiles_public')
        .select('avatar_url')
        .eq('id', user.id)
        .maybeSingle();

      setAvatarUrl(data?.avatar_url ?? null);
    }
    loadAvatar();
  }, []);

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
    const compressed = await compressImage(file);
    const uploadResult = await supabase.storage.from('posts').upload(path, compressed);

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
      setError('Session expirée, reconnecte-toi.');
      setLoading(false);
      return;
    }

    const result = await supabase
      .schema('social')
      .from('posts')
      .insert({ author_id: user.id, content: content.trim() || '', media_url: mediaUrl, group_id: props.groupId ?? null });

    setLoading(false);

    if (result.error) {
      setError('Publication impossible. Réessaie.');
      return;
    }

    setContent('');
    setMediaUrl(null);
    if (props.onPosted) props.onPosted();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="composer">
      <div className="composer-row">
        <div
          className="composer-avatar"
          style={avatarUrl ? { backgroundImage: 'url(' + avatarUrl + ')' } : undefined}
        ></div>
        <div className="composer-fields">
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

          <div className="composer-photo-row" style={{ marginBottom: 14 }}>
            <label className="camera-btn" aria-label="Ajouter une photo">
              {uploading ? '···' : '📸'}
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
            </label>
            {mediaUrl && <span className="hint" style={{ margin: 0 }}>Photo ajoutée</span>}
          </div>

          {error && <p className="error-msg">{error}</p>}
          <button type="submit" disabled={loading || (!content.trim() && !mediaUrl)}>
            {loading ? 'Publication...' : 'Publier'}
          </button>
        </div>
      </div>
    </form>
  );
}
