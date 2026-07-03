'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function GroupesClient(props: { groups: any[]; myGroupIds: string[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [topic, setTopic] = useState('');
  const [saving, setSaving] = useState(false);
  const [joined, setJoined] = useState(new Set(props.myGroupIds));
  const [joining, setJoining] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const userResult = await supabase.auth.getUser();
    const user = userResult.data.user;
    if (!user) {
      setSaving(false);
      return;
    }

    const result = await supabase
      .schema('social')
      .from('groups')
      .insert({ name, city: city || null, topic: topic || null, created_by: user.id })
      .select('id')
      .single();

    if (result.error) {
      setSaving(false);
      setError('Creation impossible : ' + result.error.message);
      return;
    }

    if (result.data) {
      await supabase.schema('social').from('group_members').insert({ group_id: result.data.id, user_id: user.id });
    }

    setSaving(false);
    setShowForm(false);
    setName('');
    setCity('');
    setTopic('');
    router.refresh();
  }

  async function handleJoin(groupId: string) {
    setJoining(groupId);
    setError(null);
    const supabase = createClient();
    const userResult = await supabase.auth.getUser();
    const user = userResult.data.user;
    if (!user) {
      setJoining(null);
      return;
    }

    const result = await supabase.schema('social').from('group_members').insert({ group_id: groupId, user_id: user.id });

    setJoining(null);

    if (result.error) {
      setError('Adhesion impossible : ' + result.error.message);
      return;
    }

    setJoined((prev) => new Set(prev).add(groupId));
  }

  return (
    <div>
      <button type="button" onClick={() => setShowForm((v) => !v)} style={{ marginBottom: 20 }}>
        {showForm ? 'Annuler' : '+ Creer un groupe'}
      </button>

      {showForm && (
        <form onSubmit={handleCreate} className="cv-box">
          <label htmlFor="groupName">Nom du groupe</label>
          <input id="groupName" type="text" required value={name} onChange={(e) => setName(e.target.value)} style={{ marginBottom: 16 }} />

          <label htmlFor="groupCity">Ville (optionnel)</label>
          <input id="groupCity" type="text" value={city} onChange={(e) => setCity(e.target.value)} style={{ marginBottom: 16 }} />

          <label htmlFor="groupTopic">Sujet (optionnel)</label>
          <input id="groupTopic" type="text" value={topic} onChange={(e) => setTopic(e.target.value)} style={{ marginBottom: 16 }} />

          <button type="submit" disabled={saving || !name}>
            {saving ? 'Creation...' : 'Creer le groupe'}
          </button>
        </form>
      )}

      {error && <p className="error-msg">{error}</p>}

      {props.groups.length === 0 && <p className="empty-state">Aucun groupe pour le moment.</p>}

      {props.groups.map((g) => {
        const isMember = joined.has(g.id);
        return (
          <div key={g.id} className="group-card">
            <div className="group-name">{g.name}</div>
            <div className="group-meta">
              {[g.city, g.topic].filter(Boolean).join(' · ') || 'Groupe general'}
            </div>
            {isMember ? (
              <a href={'/app/groupes/' + g.id}>
                <button type="button">Voir le groupe</button>
              </a>
            ) : (
              <button type="button" onClick={() => handleJoin(g.id)} disabled={joining === g.id}>
                {joining === g.id ? 'Adhesion...' : 'Rejoindre'}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
