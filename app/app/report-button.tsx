'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const REASONS = [
  { value: 'harcelement', label: 'Harcelement' },
  { value: 'contenu_haineux', label: 'Contenu haineux' },
  { value: 'faux_profil', label: 'Faux profil' },
  { value: 'spam', label: 'Spam' },
  { value: 'contenu_inapproprie', label: 'Contenu inapproprie' },
  { value: 'usurpation', label: 'Usurpation' },
  { value: 'autre', label: 'Autre' },
];

export default function ReportButton(props: { targetType: string; targetId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('harcelement');
  const [details, setDetails] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setSending(true);
    setError(null);
    const supabase = createClient();
    const userResult = await supabase.auth.getUser();
    const user = userResult.data.user;
    if (!user) {
      setSending(false);
      return;
    }

    const result = await supabase
      .schema('moderation')
      .from('reports')
      .insert({
        reporter_id: user.id,
        target_type: props.targetType,
        target_id: props.targetId,
        reason,
        details: details || null,
      });

    setSending(false);

    if (result.error) {
      setError('Envoi impossible : ' + result.error.message);
      return;
    }

    setSent(true);
    setOpen(false);
    setTimeout(() => setSent(false), 3000);
  }

  if (sent) {
    return <p className="hint" style={{ marginTop: 10 }}>Signalement envoyé.</p>;
  }

  if (!open) {
    return (
      <button type="button" className="report-link" onClick={() => setOpen(true)}>
        Signaler
      </button>
    );
  }

  return (
    <div className="report-form">
      <select value={reason} onChange={(e) => setReason(e.target.value)}>
        {REASONS.map((r) => (
          <option key={r.value} value={r.value}>{r.label}</option>
        ))}
      </select>
      <textarea
        rows={2}
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        placeholder="Details (optionnel)"
      />
      {error && <p className="error-msg">{error}</p>}
      <div className="report-form-actions">
        <button type="button" onClick={() => setOpen(false)}>Annuler</button>
        <button type="button" onClick={handleSubmit} disabled={sending}>
          {sending ? 'Envoi...' : 'Envoyer le signalement'}
        </button>
      </div>
    </div>
  );
}
