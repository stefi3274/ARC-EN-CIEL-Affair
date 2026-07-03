'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ClassifiedsPanel(props: { classifieds: any[]; onChanged: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [saving, setSaving] = useState(false);
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
      .from('classifieds')
      .insert({
        author_id: user.id,
        category: category || null,
        title,
        description: description || null,
        price: price ? parseFloat(price) : null,
        location: location || null,
      });

    setSaving(false);

    if (result.error) {
      setError('Publication impossible : ' + result.error.message);
      return;
    }

    setShowForm(false);
    setTitle('');
    setDescription('');
    setPrice('');
    setLocation('');
    setCategory('');
    props.onChanged();
  }

  return (
    <div>
      <button type="button" onClick={() => setShowForm((v) => !v)} style={{ marginBottom: 20 }}>
        {showForm ? 'Annuler' : '+ Publier une annonce'}
      </button>

      {showForm && (
        <form onSubmit={handleCreate} className="cv-box">
          <label htmlFor="clCategory">Categorie</label>
          <input id="clCategory" type="text" placeholder="Logement, covoiturage..." value={category} onChange={(e) => setCategory(e.target.value)} style={{ marginBottom: 16 }} />

          <label htmlFor="clTitle">Titre</label>
          <input id="clTitle" type="text" required value={title} onChange={(e) => setTitle(e.target.value)} style={{ marginBottom: 16 }} />

          <label htmlFor="clDesc">Description</label>
          <textarea id="clDesc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} style={{ marginBottom: 16 }} />

          <label htmlFor="clPrice">Prix (optionnel)</label>
          <input id="clPrice" type="text" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} style={{ marginBottom: 16 }} />

          <label htmlFor="clLocation">Lieu</label>
          <input id="clLocation" type="text" value={location} onChange={(e) => setLocation(e.target.value)} style={{ marginBottom: 16 }} />

          {error && <p className="error-msg">{error}</p>}
          <button type="submit" disabled={saving || !title}>
            {saving ? 'Publication...' : 'Publier'}
          </button>
        </form>
      )}

      {props.classifieds.length === 0 && <p className="empty-state">Aucune annonce pour le moment.</p>}

      {props.classifieds.map((cl) => (
        <div key={cl.id} className="classified-card">
          {cl.category && <span className="market-tag">{cl.category}</span>}
          <div className="event-title" style={{ marginTop: 8 }}>{cl.title}</div>
          {cl.price !== null && <div className="classified-price">{cl.price} $</div>}
          <p className="listing-desc">{cl.description}</p>
          {cl.location && <div className="market-seller">{cl.location}</div>}
        </div>
      ))}
    </div>
  );
}
