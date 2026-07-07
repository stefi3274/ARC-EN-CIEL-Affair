'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { generateKeyPair, getPublicKey, savePublicKey, savePrivateKey } from '@/lib/crypto';
import { compressImage } from '@/lib/compress-image';

type Props = {
  bio: string;
  age: number | null;
  visible: boolean;
  photos: string[];
  talents: string;
  dreams: string;
  goals: string;
  hasProfile: boolean;
  onSaved: () => void;
};

export default function ProfilForm(props: Props) {
  const [bio, setBio] = useState(props.bio);
  const [age, setAge] = useState(props.age ? String(props.age) : '');
  const [visible, setVisible] = useState(props.visible);
  const [photos, setPhotos] = useState<string[]>(props.photos || []);
  const [talents, setTalents] = useState(props.talents);
  const [dreams, setDreams] = useState(props.dreams);
  const [goals, setGoals] = useState(props.goals);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [statusText, setStatusText] = useState('');
  const [statusPhoto, setStatusPhoto] = useState<string | null>(null);
  const [uploadingStatusPhoto, setUploadingStatusPhoto] = useState(false);
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
    const compressed = await compressImage(file);
    const uploadResult = await supabase.storage.from('dating-photos').upload(path, compressed);

    setUploading(false);

    if (uploadResult.error) {
      setError('Envoi de la photo impossible. Réessaie.');
      return;
    }

    setPhotos((prev) => [...prev, path]);
  }

  async function handleStatusPhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingStatusPhoto(true);

    const supabase = createClient();
    const userResult = await supabase.auth.getUser();
    const user = userResult.data.user;
    if (!user) {
      setUploadingStatusPhoto(false);
      return;
    }

    const path = user.id + '/status-' + Date.now() + '-' + file.name;
    const compressed = await compressImage(file);
    const uploadResult = await supabase.storage.from('dating-photos').upload(path, compressed);

    setUploadingStatusPhoto(false);

    if (uploadResult.error) return;

    setStatusPhoto(path);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const supabase = createClient();
    const userResult = await supabase.auth.getUser();
    const user = userResult.data.user;

    if (!user) {
      setError('Session expirée, reconnecte-toi.');
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
        talents: talents || null,
        dreams: dreams || null,
        goals: goals || null,
        public_key: publicKey,
      });

    setSaving(false);

    if (result.error) {
      setError('Enregistrement impossible. Réessaie.');
      return;
    }

    props.onSaved();
  }

  async function handlePostStatus() {
    if (!statusText.trim() && !statusPhoto) return;
    const supabase = createClient();
    const userResult = await supabase.auth.getUser();
    const user = userResult.data.user;
    if (!user) return;

    const result = await supabase
      .schema('dating')
      .from('statuses')
      .insert({
        user_id: user.id,
        content: statusText.trim() || '',
        media_url: statusPhoto,
      });

    if (result.error) {
      setError('Statut impossible a publier : ' + result.error.message);
      return;
    }

    setStatusText('');
    setStatusPhoto(null);
    setStatusSent(true);
    setTimeout(() => setStatusSent(false), 2500);
  }

  return (
    <div className="profil-form">
      <h1>Ton profil Rencontre</h1>
      <p className="sub">
        Tout est optionnel. Rien ici n'est visible dans les autres modules de l'app. Ces
        informations aident les autres à mieux te connaître avant de matcher.
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

        <label htmlFor="talents">Talents</label>
        <textarea
          id="talents"
          rows={2}
          value={talents}
          onChange={(e) => setTalents(e.target.value)}
          placeholder="Ce que tu sais bien faire (optionnel)"
        />

        <label htmlFor="dreams">Rêves</label>
        <textarea
          id="dreams"
          rows={2}
          value={dreams}
          onChange={(e) => setDreams(e.target.value)}
          placeholder="Ce dont tu rêves (optionnel)"
        />

        <label htmlFor="goals">Buts</label>
        <textarea
          id="goals"
          rows={2}
          value={goals}
          onChange={(e) => setGoals(e.target.value)}
          placeholder="Ce que tu cherches en ce moment (optionnel)"
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

        <div className="photo-row" style={{ marginBottom: 12 }}>
          {statusPhoto && <div className="photo-thumb" title={statusPhoto}></div>}
          <label className="photo-upload-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            {uploadingStatusPhoto ? '...' : '+ Photo'}
            <input type="file" accept="image/*" onChange={handleStatusPhotoUpload} style={{ display: 'none' }} />
          </label>
        </div>

        <button type="button" onClick={handlePostStatus} disabled={!statusText.trim() && !statusPhoto}>
          {statusSent ? 'Publié' : 'Publier le statut'}
        </button>
        {error && <p className="error-msg">{error}</p>}
      </div>
    </div>
  );
}
