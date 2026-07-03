'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function MyListings(props: { myListings: any[]; onChanged: () => void }) {
  const [requesting, setRequesting] = useState<string | null>(null);
  const [requested, setRequested] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  async function requestBoost(listingId: string) {
    setRequesting(listingId);
    setError(null);
    const supabase = createClient();
    const userResult = await supabase.auth.getUser();
    const user = userResult.data.user;
    if (!user) {
      setRequesting(null);
      return;
    }

    const result = await supabase
      .schema('marketplace')
      .from('boost_requests')
      .insert({ listing_id: listingId, requester_id: user.id });

    setRequesting(null);

    if (result.error) {
      setError('Demande impossible : ' + result.error.message);
      return;
    }

    setRequested((prev) => new Set(prev).add(listingId));
  }

  if (props.myListings.length === 0) {
    return <p className="empty-state">Tu n'as pas encore publie d'annonce.</p>;
  }

  return (
    <div>
      {error && <p className="error-msg">{error}</p>}
      {props.myListings.map((l) => (
        <div key={l.id} className="listing-card">
          <div className="listing-title">{l.title}</div>
          <div className="listing-company">{l.price ? l.price + ' $' : 'Prix a discuter'}</div>
          {l.variants.length > 0 && (
            <p className="listing-desc">{l.variants.length} variante(s) configuree(s)</p>
          )}
          {l.boosted ? (
            <span className="listing-tag" style={{ borderColor: 'var(--orange)', color: 'var(--orange)' }}>Deja en avant</span>
          ) : requested.has(l.id) ? (
            <button className="boost-btn" disabled>Demande envoyee</button>
          ) : (
            <button className="boost-btn" onClick={() => requestBoost(l.id)} disabled={requesting === l.id}>
              {requesting === l.id ? 'Envoi...' : 'Contacter - Mettre en avant'}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
