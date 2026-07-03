'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ListingsBrowser(props: {
  listings: any[];
  appliedListingIds: Set<string>;
  hasCv: boolean;
  onNeedsCv: () => void;
}) {
  const [applying, setApplying] = useState<string | null>(null);
  const [applied, setApplied] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  async function apply(listingId: string) {
    if (!props.hasCv) {
      props.onNeedsCv();
      return;
    }
    setApplying(listingId);
    setError(null);
    const supabase = createClient();
    const userResult = await supabase.auth.getUser();
    const user = userResult.data.user;
    if (!user) {
      setApplying(null);
      return;
    }

    const result = await supabase
      .schema('jobs')
      .from('applications')
      .insert({ listing_id: listingId, applicant_id: user.id });

    setApplying(null);

    if (result.error) {
      setError('Candidature impossible : ' + result.error.message);
      return;
    }

    setApplied((prev) => new Set(prev).add(listingId));
  }

  if (props.listings.length === 0) {
    return <p className="empty-state">Aucune offre pour le moment.</p>;
  }

  return (
    <div>
      {error && <p className="error-msg">{error}</p>}
      {props.listings.map((listing) => {
        const hasApplied = props.appliedListingIds.has(listing.id) || applied.has(listing.id);
        return (
          <div key={listing.id} className="listing-card">
            <div className="listing-tags">
              {listing.companies?.inclusive_label && <span className="listing-tag">Label inclusif</span>}
              {listing.remote && <span className="listing-tag">Remote</span>}
              {listing.contract_type && <span className="listing-tag">{listing.contract_type}</span>}
            </div>
            <div className="listing-title">{listing.title}</div>
            <div className="listing-company">
              {listing.companies?.name ?? 'Entreprise'} {listing.location ? '- ' + listing.location : ''}
            </div>
            <p className="listing-desc">{listing.description}</p>
            <button
              type="button"
              className={hasApplied ? 'applied' : ''}
              disabled={hasApplied || applying === listing.id}
              onClick={() => apply(listing.id)}
            >
              {hasApplied ? 'Candidature envoyée' : applying === listing.id ? 'Envoi...' : 'Postuler'}
            </button>
          </div>
        );
      })}
    </div>
  );
}
