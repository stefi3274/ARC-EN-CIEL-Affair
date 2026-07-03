'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const REASONS = [
  { value: 'harcelement', label: 'Harcèlement' },
  { value: 'contenu_haineux', label: 'Contenu haineux' },
  { value: 'faux_profil', label: 'Faux profil' },
  { value: 'spam', label: 'Spam' },
  { value: 'contenu_inapproprie', label: 'Contenu inapproprié' },
  { value: 'usurpation', label: 'Usurpation' },
  { value: 'autre', label: 'Autre' },
];

export default function PostMenu(props: { postId: string; content: string; mediaUrl: string | null; isOwner: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState<'edit' | 'delete' | 'report' | null>(null);
  const [editText, setEditText] = useState(props.content);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [reason, setReason] = useState('harcelement');
  const [details, setDetails] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function closeAll() {
    setOpen(false);
    setPanel(null);
    setError(null);
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(props.content);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      closeAll();
    }, 1200);
  }

  async function handleSaveEdit() {
    if (!editText.trim()) return;
    setBusy(true);
    setError(null);
    const supabase = createClient();

    const updates: { content: string; media_url?: null } = { content: editText.trim() };
    if (removePhoto) updates.media_url = null;

    const result = await supabase
      .schema('social')
      .from('posts')
      .update(updates)
      .eq('id', props.postId);

    setBusy(false);

    if (result.error) {
      setError('Modification impossible : ' + result.error.message);
      return;
    }

    closeAll();
    router.refresh();
  }

  async function handleDelete() {
    setBusy(true);
    setError(null);
    const supabase = createClient();

    const result = await supabase
      .schema('social')
      .from('posts')
      .delete()
      .eq('id', props.postId);

    setBusy(false);

    if (result.error) {
      setError('Suppression impossible : ' + result.error.message);
      return;
    }

    closeAll();
    router.refresh();
  }

  async function handleReport() {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const userResult = await supabase.auth.getUser();
    const user = userResult.data.user;
    if (!user) {
      setBusy(false);
      return;
    }

    const result = await supabase
      .schema('moderation')
      .from('reports')
      .insert({
        reporter_id: user.id,
        target_type: 'post',
        target_id: props.postId,
        reason,
        details: details || null,
      });

    setBusy(false);

    if (result.error) {
      setError('Envoi impossible : ' + result.error.message);
      return;
    }

    setSent(true);
    setPanel(null);
    setTimeout(() => {
      setSent(false);
      closeAll();
    }, 2000);
  }

  return (
    <div className="post-menu-wrap">
      <button type="button" className="post-menu-btn" onClick={() => setOpen((v) => !v)} aria-label="Options">
        ⋯
      </button>

      {open && panel === null && (
        <div className="post-menu-dropdown">
          <button type="button" onClick={handleCopy}>{copied ? 'Copié !' : 'Copier'}</button>
          {props.isOwner && <button type="button" onClick={() => setPanel('edit')}>Modifier</button>}
          {props.isOwner && <button type="button" onClick={() => setPanel('delete')}>Supprimer</button>}
          {!props.isOwner && <button type="button" onClick={() => setPanel('report')}>Signaler</button>}
        </div>
      )}

      {open && panel === 'edit' && (
        <div className="post-menu-dropdown post-menu-panel">
          <textarea rows={3} value={editText} onChange={(e) => setEditText(e.target.value)} />

          {props.mediaUrl && !removePhoto && (
            <div className="post-menu-photo-row">
              <div className="photo-thumb" style={{ backgroundImage: 'url(' + props.mediaUrl + ')' }}></div>
              <button type="button" onClick={() => setRemovePhoto(true)}>Retirer la photo</button>
            </div>
          )}
          {removePhoto && <p className="hint">La photo sera retirée à l'enregistrement.</p>}

          {error && <p className="error-msg">{error}</p>}
          <div className="report-form-actions">
            <button type="button" onClick={closeAll}>Annuler</button>
            <button type="button" onClick={handleSaveEdit} disabled={busy || !editText.trim()}>
              {busy ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>
      )}

      {open && panel === 'delete' && (
        <div className="post-menu-dropdown post-menu-panel">
          <p className="hint">Supprimer ce post définitivement ?</p>
          {error && <p className="error-msg">{error}</p>}
          <div className="report-form-actions">
            <button type="button" onClick={closeAll}>Annuler</button>
            <button type="button" onClick={handleDelete} disabled={busy}>
              {busy ? 'Suppression...' : 'Supprimer'}
            </button>
          </div>
        </div>
      )}

      {open && panel === 'report' && (
        <div className="post-menu-dropdown post-menu-panel">
          {sent ? (
            <p className="hint">Signalement envoyé.</p>
          ) : (
            <>
              <select value={reason} onChange={(e) => setReason(e.target.value)}>
                {REASONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              <textarea rows={2} value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Détails (optionnel)" />
              {error && <p className="error-msg">{error}</p>}
              <div className="report-form-actions">
                <button type="button" onClick={closeAll}>Annuler</button>
                <button type="button" onClick={handleReport} disabled={busy}>
                  {busy ? 'Envoi...' : 'Envoyer'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
