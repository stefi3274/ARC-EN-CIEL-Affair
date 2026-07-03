'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function PetitionsPanel(props: {
  petitions: any[];
  signatureCounts: Record<string, number>;
  mySignedIds: Set<string>;
  canSign: boolean;
  onChanged: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState('1000');
  const [saving, setSaving] = useState(false);
  const [signing, setSigning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
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

    const result = await supabase
      .schema('events')
      .from('petitions')
      .insert({
        creator_id: user.id,
        title,
        description: description || null,
        goal_signatures: goal ? parseInt(goal, 10) : 1000,
      });

    setSaving(false);

    if (result.error) {
      setError('Publication impossible : ' + result.error.message);
      return;
    }

    setShowForm(false);
    setTitle('');
    setDescription('');
    props.onChanged();
  }

  async function handleSign(petitionId: string) {
    if (!props.canSign) return;
    setSigning(petitionId);
    const supabase = createClient();
    const userResult = await supabase.auth.getUser();
    const user = userResult.data.user;
    if (!user) {
      setSigning(null);
      return;
    }

    await supabase
      .schema('events')
      .from('petition_signatures')
      .insert({ petition_id: petitionId, user_id: user.id });

    setSigning(null);
    props.onChanged();
  }

  return (
    <div>
      <button type="button" onClick={() => setShowForm((v) => !v)} style={{ marginBottom: 20 }}>
        {showForm ? 'Annuler' : '+ Lancer une pétition'}
      </button>

      {!props.canSign && (
        <p className="hint" style={{ marginBottom: 20 }}>
          Confirme ton email pour pouvoir signer des pétitions.
        </p>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="cv-box">
          <label htmlFor="petTitle">Titre</label>
          <input id="petTitle" type="text" required value={title} onChange={(e) => setTitle(e.target.value)} style={{ marginBottom: 16 }} />

          <label htmlFor="petDesc">Description</label>
          <textarea id="petDesc" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} style={{ marginBottom: 16 }} />

          <label htmlFor="petGoal">Objectif de signatures</label>
          <input id="petGoal" type="text" inputMode="numeric" value={goal} onChange={(e) => setGoal(e.target.value.replace(/[^0-9]/g, ''))} style={{ marginBottom: 16 }} />

          {error && <p className="error-msg">{error}</p>}
          <button type="submit" disabled={saving || !title}>
            {saving ? 'Création...' : 'Publier la pétition'}
          </button>
        </form>
      )}

      {props.petitions.length === 0 && <p className="empty-state">Aucune pétition pour le moment.</p>}

      {props.petitions.map((pet) => {
        const count = props.signatureCounts[pet.id] ?? 0;
        const percent = Math.min(100, Math.round((count / (pet.goal_signatures || 1)) * 100));
        const alreadySigned = props.mySignedIds.has(pet.id);

        return (
          <div key={pet.id} className="event-card">
            <div className="event-title">{pet.title}</div>
            <p className="listing-desc">{pet.description}</p>
            <div className="petition-progress">
              <div className="petition-progress-fill" style={{ width: percent + '%' }}></div>
            </div>
            <div className="petition-count">{count} / {pet.goal_signatures} signatures</div>
            <button
              type="button"
              className={alreadySigned ? 'applied' : ''}
              disabled={alreadySigned || !props.canSign || signing === pet.id}
              onClick={() => handleSign(pet.id)}
              style={{ marginTop: 12 }}
            >
              {alreadySigned ? 'Déjà signé' : signing === pet.id ? 'Envoi...' : 'Signer'}
            </button>
          </div>
        );
      })}
    </div>
  );
}
