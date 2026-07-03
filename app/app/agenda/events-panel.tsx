'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatDateTime } from '@/lib/format-date';

export default function EventsPanel(props: { events: any[]; goingSet: Set<string>; onChanged: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [saving, setSaving] = useState(false);
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
      setError('Session expiree, reconnecte-toi.');
      setSaving(false);
      return;
    }

    const result = await supabase
      .schema('events')
      .from('events')
      .insert({
        organizer_id: user.id,
        title,
        description: description || null,
        location: location || null,
        starts_at: startsAt,
      });

    setSaving(false);

    if (result.error) {
      setError('Publication impossible : ' + result.error.message);
      return;
    }

    setShowForm(false);
    setTitle('');
    setDescription('');
    setLocation('');
    setStartsAt('');
    props.onChanged();
  }

  async function handleJoin(eventId: string) {
    setJoining(eventId);
    const supabase = createClient();
    const userResult = await supabase.auth.getUser();
    const user = userResult.data.user;
    if (!user) {
      setJoining(null);
      return;
    }

    await supabase
      .schema('events')
      .from('rsvps')
      .upsert({ event_id: eventId, user_id: user.id, status: 'going' });

    setJoining(null);
    props.onChanged();
  }

  return (
    <div>
      <button type="button" onClick={() => setShowForm((v) => !v)} style={{ marginBottom: 20 }}>
        {showForm ? 'Annuler' : '+ Creer un evenement'}
      </button>

      {showForm && (
        <form onSubmit={handleCreate} className="cv-box">
          <label htmlFor="evTitle">Titre</label>
          <input id="evTitle" type="text" required value={title} onChange={(e) => setTitle(e.target.value)} style={{ marginBottom: 16 }} />

          <label htmlFor="evDesc">Description</label>
          <textarea id="evDesc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} style={{ marginBottom: 16 }} />

          <label htmlFor="evLocation">Lieu</label>
          <input id="evLocation" type="text" value={location} onChange={(e) => setLocation(e.target.value)} style={{ marginBottom: 16 }} />

          <label htmlFor="evDate">Date et heure</label>
          <input id="evDate" type="datetime-local" required value={startsAt} onChange={(e) => setStartsAt(e.target.value)} style={{ marginBottom: 16 }} />

          {error && <p className="error-msg">{error}</p>}
          <button type="submit" disabled={saving || !title || !startsAt}>
            {saving ? 'Creation...' : "Publier l'evenement"}
          </button>
        </form>
      )}

      {props.events.length === 0 && <p className="empty-state">Aucun evenement pour le moment.</p>}

      {props.events.map((ev) => {
        const isGoing = props.goingSet.has(ev.id);
        return (
          <div key={ev.id} className="event-card">
            <div className="event-cover" style={ev.cover_url ? { backgroundImage: 'url(' + ev.cover_url + ')' } : undefined}></div>
            <div className="event-date">{formatDateTime(ev.starts_at)}</div>
            <div className="event-title">{ev.title}</div>
            {ev.location && <div className="event-location">{ev.location}</div>}
            <button
              type="button"
              className={isGoing ? 'applied' : ''}
              disabled={isGoing || joining === ev.id}
              onClick={() => handleJoin(ev.id)}
            >
              {isGoing ? 'Tu y vas' : joining === ev.id ? 'Envoi...' : 'Je participe'}
            </button>
          </div>
        );
      })}
    </div>
  );
}
