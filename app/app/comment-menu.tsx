'use client';

import { useState } from 'react';
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

export default function CommentMenu(props: {
  commentId: string;
  content: string;
  isOwner: boolean;
  onUpdated: (newContent: string) => void;
  onDeleted: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState<'edit' | 'delete' | 'report' | null>(null);
  const [editText, setEditText] = useState(props.content);
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

    const result = await supabase
      .schema('social')
      .from('comments')
      .update({ content: editText.trim() })
      .eq('id', props.commentId);

    setBusy(false);

    if (result.error) {
      setError('Modification impossible : ' + result.error.message);
      return;
    }

    props.onUpdated(editText.trim());
    closeAll();
  }

  async function handleDelete() {
    setBusy(true);
    setError(null);
    const supabase = createClient();

    const result = await supabase
      .schema('social')
      .from('comments')
      .delete()
      .eq('id', props.commentId);

    setBusy(false);

    if (result.error) {
      setError('Suppression impossible : ' + result.error.message);
      return;
    }

    props.onDeleted();
    closeAll();
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
        target_type: 'comment',
        target_id: props.commentId,
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
    <span className="comment-menu-wrap">
      <button type="button" className="comment-menu-btn" onClick={() => setOpen((v) => !v)} aria-label="Options">
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
          <textarea rows={2} value={editText} onChange={(e) => setEditText(e.target.value)} />
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
          <p className="hint">Supprimer ce commentaire ?</p>
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
    </span>
  );
}
