'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Entry = {
  id: string;
  content: string;
  sharedWithPartner: boolean;
  createdAt: string;
  isMine: boolean;
};

type PartnerRow = {
  id: string;
  otherId: string;
  otherName: string;
  status: string;
  initiatedByMe: boolean;
};

// Numero de semaine ISO (la semaine commence le lundi)
function getISOWeek(date: Date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export default function JournalPanel() {
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [partners, setPartners] = useState<PartnerRow[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyPartnerId, setBusyPartnerId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const supabase = createClient();
    const userResult = await supabase.auth.getUser();
    const user = userResult.data.user;
    if (!user) {
      setLoading(false);
      return;
    }
    setCurrentUserId(user.id);

    const { data: prompts } = await supabase.schema('journal').from('prompts').select('question');
    if (prompts && prompts.length > 0) {
      const now = new Date();
      const week = getISOWeek(now);
      const weekIndex = week % prompts.length;
      const chosenQuestion = prompts[weekIndex].question;
      setPrompt(chosenQuestion);

      // Filet de securite : si la tache planifiee cote serveur (pg_cron) n'est
      // pas disponible sur ce plan Supabase, on cree quand meme la
      // notification de rappel des l'ouverture du journal cette semaine-la,
      // une seule fois (on verifie qu'une notification pour cette question
      // precise n'existe pas deja pour cet utilisateur).
      const { data: existingNotif } = await supabase
        .schema('notifications')
        .from('items')
        .select('id')
        .eq('user_id', user.id)
        .eq('type', 'journal_prompt')
        .eq('body', chosenQuestion)
        .maybeSingle();

      if (!existingNotif) {
        await supabase.schema('notifications').from('items').insert({
          user_id: user.id,
          type: 'journal_prompt',
          title: 'Question de la semaine',
          body: chosenQuestion,
        });
      }
    }

    const { data: partnerRows } = await supabase
      .schema('journal')
      .from('partners')
      .select('id, user_a, user_b, status, initiated_by')
      .or('user_a.eq.' + user.id + ',user_b.eq.' + user.id);

    const otherIds = (partnerRows ?? []).map((p) => (p.user_a === user.id ? p.user_b : p.user_a));
    let names: Record<string, string> = {};

    if (otherIds.length > 0) {
      const { data: profs } = await supabase
        .schema('core')
        .from('profiles_public')
        .select('id, display_name')
        .in('id', otherIds);
      names = Object.fromEntries((profs ?? []).map((p) => [p.id, p.display_name]));
    }

    const builtPartners: PartnerRow[] = (partnerRows ?? []).map((p) => {
      const otherId = p.user_a === user.id ? p.user_b : p.user_a;
      return {
        id: p.id,
        otherId,
        otherName: names[otherId] ?? 'Un membre',
        status: p.status,
        initiatedByMe: p.initiated_by === user.id,
      };
    });
    setPartners(builtPartners);

    const acceptedPartner = builtPartners.find((p) => p.status === 'accepted');

    const { data: myEntries } = await supabase
      .schema('journal')
      .from('entries')
      .select('id, content, shared_with_partner, created_at')
      .eq('author_id', user.id)
      .order('created_at', { ascending: false });

    let partnerEntries: any[] = [];
    if (acceptedPartner) {
      const { data } = await supabase
        .schema('journal')
        .from('entries')
        .select('id, content, shared_with_partner, created_at')
        .eq('author_id', acceptedPartner.otherId)
        .eq('shared_with_partner', true)
        .order('created_at', { ascending: false });
      partnerEntries = data ?? [];
    }

    const merged: Entry[] = [
      ...(myEntries ?? []).map((e) => ({
        id: e.id,
        content: e.content,
        sharedWithPartner: e.shared_with_partner,
        createdAt: e.created_at,
        isMine: true,
      })),
      ...partnerEntries.map((e) => ({
        id: e.id,
        content: e.content,
        sharedWithPartner: true,
        createdAt: e.created_at,
        isMine: false,
      })),
    ].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

    setEntries(merged);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || !currentUserId) return;
    setSaving(true);
    setError(null);

    const supabase = createClient();
    const result = await supabase
      .schema('journal')
      .from('entries')
      .insert({ author_id: currentUserId, content: content.trim(), shared_with_partner: true });

    setSaving(false);

    if (result.error) {
      setError('Enregistrement impossible : ' + result.error.message);
      return;
    }

    setContent('');
    load();
  }

  async function respondInvite(partnerId: string, status: 'accepted' | 'declined') {
    setBusyPartnerId(partnerId);
    const supabase = createClient();
    await supabase.schema('journal').from('partners').update({ status }).eq('id', partnerId);
    setBusyPartnerId(null);
    load();
  }

  if (loading) {
    return <p className="hint" style={{ textAlign: 'center', padding: '40px 0' }}>Chargement...</p>;
  }

  const acceptedPartner = partners.find((p) => p.status === 'accepted');
  const pendingReceived = partners.filter((p) => p.status === 'pending' && !p.initiatedByMe);
  const pendingSent = partners.filter((p) => p.status === 'pending' && p.initiatedByMe);

  return (
    <div>
      {pendingReceived.length > 0 && (
        <div className="cv-box" style={{ borderColor: 'var(--violet)' }}>
          <h1 style={{ fontSize: '1.05rem' }}>Invitation au journal partagé</h1>
          {pendingReceived.map((p) => (
            <div key={p.id} className="applicant-row">
              <span>{p.otherName} te propose un journal partagé</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" onClick={() => respondInvite(p.id, 'declined')} disabled={busyPartnerId === p.id}>
                  Refuser
                </button>
                <button type="button" onClick={() => respondInvite(p.id, 'accepted')} disabled={busyPartnerId === p.id}>
                  Accepter
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {pendingSent.length > 0 && !acceptedPartner && (
        <p className="hint" style={{ marginBottom: 20 }}>
          En attente de réponse de {pendingSent[0].otherName}.
        </p>
      )}

      {!acceptedPartner && pendingReceived.length === 0 && pendingSent.length === 0 && (
        <p className="hint" style={{ marginBottom: 20 }}>
          Aucun partenaire pour l'instant. Depuis le profil de quelqu'un (via le Fil), propose-lui
          le journal partagé.
        </p>
      )}

      {acceptedPartner && (
        <p className="hint" style={{ marginBottom: 20 }}>
          Journal partagé actif avec <strong>{acceptedPartner.otherName}</strong>.
        </p>
      )}

      {prompt && (
        <div className="journal-prompt">
          <span className="journal-prompt-label">Question de la semaine</span>
          <p>{prompt}</p>
        </div>
      )}

      <form onSubmit={handleSave} className="cv-box">
        <textarea
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Écris ce que tu ressens aujourd'hui..."
          style={{ marginBottom: 14 }}
        />

        {acceptedPartner ? (
          <p className="hint" style={{ marginBottom: 14 }}>
            Ce journal est partagé avec {acceptedPartner.otherName} — vous lisez et écrivez tous
            les deux ici.
          </p>
        ) : (
          <p className="hint" style={{ marginBottom: 14 }}>
            Ce journal est secret. Toi seul·e le vois, tant que personne n'a accepté ton
            invitation.
          </p>
        )}

        {error && <p className="error-msg">{error}</p>}
        <button type="submit" disabled={saving || !content.trim()}>
          {saving ? 'Enregistrement...' : 'Enregistrer dans le journal'}
        </button>
      </form>

      <div className="journal-entries">
        {entries.length === 0 && <p className="empty-state">Aucune entrée pour le moment.</p>}
        {entries.map((entry) => (
          <div key={entry.id} className={'journal-entry' + (entry.isMine ? '' : ' journal-entry-partner')}>
            <p>{entry.content}</p>
            <div className="journal-entry-meta">
              <span>{entry.isMine ? 'Toi' : acceptedPartner?.otherName}</span>
              <span>{new Date(entry.createdAt).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
