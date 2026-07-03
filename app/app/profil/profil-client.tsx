'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const ACCENT_OPTIONS = [
  { key: 'gold', label: 'Dore', color: '#C99A5B' },
  { key: 'rose', label: 'Rose', color: '#C17B8D' },
  { key: 'green', label: 'Vert', color: '#5FA779' },
  { key: 'orange', label: 'Orange', color: '#D99A5B' },
  { key: 'violet', label: 'Violet', color: '#9A7BC1' },
  { key: 'blue', label: 'Bleu', color: '#6C93B8' },
];

export default function ProfilClient(props: {
  displayName: string;
  pronouns: string;
  pronounsVisible: boolean;
  avatarUrl: string | null;
  themeAccent: string;
  themeFont: string;
  themeMode: string;
}) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(props.displayName);
  const [pronouns, setPronouns] = useState(props.pronouns);
  const [pronounsVisible, setPronounsVisible] = useState(props.pronounsVisible);
  const [avatarUrl, setAvatarUrl] = useState(props.avatarUrl);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [accent, setAccent] = useState(props.themeAccent);
  const [font, setFont] = useState(props.themeFont);
  const [mode, setMode] = useState(props.themeMode);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [signingOut, setSigningOut] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);

    const supabase = createClient();
    const userResult = await supabase.auth.getUser();
    const user = userResult.data.user;
    if (!user) {
      setUploadingAvatar(false);
      return;
    }

    const path = user.id + '/avatar-' + Date.now() + '.jpg';
    const uploadResult = await supabase.storage.from('avatars').upload(path, file, { upsert: true });

    setUploadingAvatar(false);

    if (uploadResult.error) return;

    const publicUrl = supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl;
    setAvatarUrl(publicUrl);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    const supabase = createClient();
    const userResult = await supabase.auth.getUser();
    const user = userResult.data.user;
    if (!user) {
      setSaving(false);
      return;
    }

    await supabase
      .schema('core')
      .from('profiles')
      .update({
        display_name: displayName,
        pronouns: pronouns || null,
        pronouns_visible: pronounsVisible,
        avatar_url: avatarUrl,
        theme_accent: accent,
        theme_font: font,
        theme_mode: mode,
      })
      .eq('id', user.id);

    setSaving(false);
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2500);
  }

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    setDeleteError(null);

    const supabase = createClient();
    const result = await supabase.functions.invoke('delete-account', { body: {} });

    if (result.error) {
      setDeleting(false);
      setDeleteError('Suppression impossible. Reessaie ou contacte le support.');
      return;
    }

    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <div>
      <form onSubmit={handleSave}>
        <h1>Ton profil</h1>
        <p className="sub">Ton identite et l'apparence de l'app, rien qu'a toi.</p>

        <div className="photo-row" style={{ marginBottom: 24 }}>
          <div
            className="photo-thumb"
            style={{
              width: 84, height: 84,
              backgroundImage: avatarUrl ? 'url(' + avatarUrl + ')' : undefined,
            }}
          ></div>
          <label className="photo-upload-btn" style={{ width: 84, height: 84, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            {uploadingAvatar ? '...' : avatarUrl ? 'Changer' : '+ Photo'}
            <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
          </label>
        </div>

        <label htmlFor="displayName">Nom affiche</label>
        <input
          id="displayName"
          type="text"
          required
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          style={{ marginBottom: 16 }}
        />

        <label htmlFor="pronouns">Pronoms (optionnel)</label>
        <input
          id="pronouns"
          type="text"
          value={pronouns}
          onChange={(e) => setPronouns(e.target.value)}
          style={{ marginBottom: 16 }}
        />

        <div className="checkbox-row">
          <input
            id="pronounsVisible"
            type="checkbox"
            checked={pronounsVisible}
            onChange={(e) => setPronounsVisible(e.target.checked)}
          />
          <label htmlFor="pronounsVisible" style={{ margin: 0, textTransform: 'none', letterSpacing: 0 }}>
            Rendre mes pronoms visibles publiquement
          </label>
        </div>

        <div style={{ marginTop: 20, paddingTop: 24, borderTop: '1px solid var(--line)' }}>
          <label>Couleur d'accent</label>
          <div className="accent-swatches">
            {ACCENT_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                className={'swatch' + (accent === opt.key ? ' active' : '')}
                style={{ background: opt.color }}
                onClick={() => setAccent(opt.key)}
                aria-label={opt.label}
              />
            ))}
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <label>Police</label>
          <div className="font-toggle">
            <button type="button" className={font === 'editorial' ? 'active' : ''} onClick={() => setFont('editorial')}>
              <span style={{ fontFamily: 'Fraunces, serif' }}>Editorial</span>
            </button>
            <button type="button" className={font === 'modern' ? 'active' : ''} onClick={() => setFont('modern')}>
              <span style={{ fontFamily: 'Inter, sans-serif' }}>Moderne</span>
            </button>
          </div>
        </div>

        <div style={{ marginTop: 24, marginBottom: 20 }}>
          <label>Apparence</label>
          <div className="mode-toggle">
            <button type="button" className={mode === 'dark' ? 'active' : ''} onClick={() => setMode('dark')}>
              Sombre
            </button>
            <button type="button" className={mode === 'light' ? 'active' : ''} onClick={() => setMode('light')}>
              Clair
            </button>
          </div>
        </div>

        <button type="submit" disabled={saving}>
          {saved ? 'Enregistre' : saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </form>

      <div className="signout-row">
        <button type="button" onClick={handleSignOut} disabled={signingOut}>
          {signingOut ? 'Deconnexion...' : 'Se deconnecter'}
        </button>
      </div>

      <div className="danger-zone">
        <h1 style={{ fontSize: '1.1rem' }}>Zone dangereuse</h1>
        <p>
          Supprimer ton compte efface definitivement ton profil, tes messages, tes publications et
          tes candidatures. Cette action est irreversible.
        </p>

        {!confirmingDelete ? (
          <button type="button" onClick={() => setConfirmingDelete(true)}>
            Supprimer mon compte
          </button>
        ) : (
          <div>
            <p style={{ color: 'var(--error)', fontWeight: 500 }}>
              Es-tu sur ? Cette action ne peut pas etre annulee.
            </p>
            {deleteError && <p className="error-msg">{deleteError}</p>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => setConfirmingDelete(false)} disabled={deleting}>
                Annuler
              </button>
              <button type="button" onClick={handleDeleteAccount} disabled={deleting}>
                {deleting ? 'Suppression...' : 'Oui, supprimer definitivement'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
