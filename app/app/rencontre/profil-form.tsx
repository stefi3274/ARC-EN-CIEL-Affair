'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { generateKeyPair, getPublicKey, savePublicKey, savePrivateKey } from '@/lib/crypto';

type Props = {
  bio: string;
  age: number | null;
  visible: boolean;
  photos: string[];
  hasProfile: boolean;
  onSaved: () => void;
};

export default function ProfilForm(props: Props) {
  const [bio, setBio] = useState(props.bio);
  const [age, setAge] = useState(props.age ? String(props.age) : '');
  const [visible, setVisible] = useState(props.visible);
  const [photos, setPhotos] = useState<string[]>(props.photos || []);
  const [statusText, setStatusText] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusSent, setStatusSent] = useState(false);

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
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
    const uploadResult = await supabase.storage.from('dating-photos').upload(path, file);

    setUploading(false);

    if (uploadResult.error) {
      setError("Envoi de la photo impossible. Réessaie.");
      return;
    }

    setPhotos((prev) => [...prev, path]);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const supabase = createClient();
    const userResult = await supabase.auth.getUser();
    const user = userResult.data.user;

    if (!user) {
      setError("Session expirée, reconnecte-toi.");
      setSaving(false);
      return;
    }

    let publicKey = await getPublicKey(user.id);

    if (!publicKey) {
      const pair = await generateKeyPair();
      await savePublicKey(user.id, pair.publicKey);
      await savePrivateKey(user.id, pair.privateKey);
      publicKey = pair.publicKey;
    }

    const result = await supabase
      .schema('dating')
      .from('profiles')
      .upsert({
        user_id: user.id,
        bio: bio || null,
        age: age ? parseInt(age, 10) : null,
        visible,
        photos,
        public_key: publicKey,
      });

    setSaving(false);

    if (result.error) {
      setError("Enregistrement impossible. Réessaie.");
      return;
    }

    props.onSaved();
  }

  async function handlePostStatus() {
    if (!statusText.trim()) return;
    const supabase = createClient();
    const userResult = await supabase.auth.getUser();
    const user = userResult.data.user;
    if (!user) return;

    await supabase
      .schema('dating')
      .from('statuses')
      .insert({ user_id: user.id, content: statusText.trim() });

    setStatusText('');
    setStatusSent(true);
    setTimeout(() => setStatusSent(false), 2500);
  }

  return (
    <div className="profil-form">
      <h1>Ton profil Rencontre</h1>
      <p className="sub">
        Tout est optionnel. Rien ici n'est visible dans les autres modules de l'app.
      </p>

      <form onSubmit={handleSave}>
        <label htmlFor="bio">Bio</label>
        <textarea
          id="bio"
          rows={4}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Parle un peu de toi (optionnel)"
        />

        <label htmlFor="age">Age (optionnel)</label>
        <input
          id="age"
          type="text"
          inputMode="numeric"
          value={age}
          onChange={(e) => setAge(e.target.value.replace(/[^0-9]/g, ''))}
          placeholder="Ex: 27"
          style={{ marginBottom: 20 }}
        />

        <label>Photos</label>
        <div className="photo-row">
          {photos.map((path) => (
            <div key={path} className="photo-thumb" title={path}></div>
          ))}
          <label className="photo-upload-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            {uploading ? '...' : '+'}
            <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
          </label>
        </div>

        <div className="toggle-row">
          <span>Visible dans la découverte</span>
          <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} />
        </div>

        {error && <p className="error-msg">{error}</p>}
        <button type="submit" disabled={saving}>
          {saving ? 'Enregistrement...' : 'Enregistrer le profil'}
        </button>
      </form>

      <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--line)' }}>
        <label htmlFor="status">Statut du moment (visible 24h)</label>
        <input
          id="status"
          type="text"
          value={statusText}
          onChange={(e) => setStatusText(e.target.value)}
          placeholder="Ex: dispo ce soir pour un café"
          style={{ marginBottom: 12 }}
        />
        <button type="button" onClick={handlePostStatus} disabled={!statusText.trim()}>
          {statusSent ? 'Publié' : 'Publiér le statut'}
        </button>
      </div>
    </div>
  );
}
