'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/format-date';

export default function RecruteurPanel(props: {
  myCompany: any;
  myListings: any[];
  applicationsReceived: any[];
  onChanged: () => void;
}) {
  const [companyName, setCompanyName] = useState('');
  const [companyDesc, setCompanyDesc] = useState('');
  const [creatingCompany, setCreatingCompany] = useState(false);

  const [listingTitle, setListingTitle] = useState('');
  const [listingDesc, setListingDesc] = useState('');
  const [listingLocation, setListingLocation] = useState('');
  const [listingRemote, setListingRemote] = useState(false);
  const [listingContract, setListingContract] = useState('');
  const [creatingListing, setCreatingListing] = useState(false);
  const [companyError, setCompanyError] = useState<string | null>(null);
  const [listingError, setListingError] = useState<string | null>(null);

  async function createCompany(e: React.FormEvent) {
    e.preventDefault();
    setCreatingCompany(true);
    setCompanyError(null);
    const supabase = createClient();
    const userResult = await supabase.auth.getUser();
    const user = userResult.data.user;
    if (!user) {
      setCreatingCompany(false);
      return;
    }

    const result = await supabase
      .schema('jobs')
      .from('companies')
      .insert({ owner_id: user.id, name: companyName, description: companyDesc || null });

    setCreatingCompany(false);

    if (result.error) {
      setCompanyError('Création impossible : ' + result.error.message);
      return;
    }

    props.onChanged();
  }

  async function createListing(e: React.FormEvent) {
    e.preventDefault();
    if (!props.myCompany) return;
    setCreatingListing(true);
    setListingError(null);
    const supabase = createClient();

    const result = await supabase
      .schema('jobs')
      .from('listings')
      .insert({
        company_id: props.myCompany.id,
        title: listingTitle,
        description: listingDesc || null,
        location: listingLocation || null,
        remote: listingRemote,
        contract_type: listingContract || null,
      });

    setCreatingListing(false);

    if (result.error) {
      setListingError('Publication impossible : ' + result.error.message);
      return;
    }

    setListingTitle('');
    setListingDesc('');
    setListingLocation('');
    setListingContract('');
    setListingRemote(false);
    props.onChanged();
  }

  async function viewCv(applicantId: string, cvPath: string) {
    const supabase = createClient();
    const result = await supabase.functions.invoke('get-cv-url', {
      body: { applicantId, cvPath },
    });

    if (result.data?.signedUrl) {
      window.open(result.data.signedUrl, '_blank');
    }
  }

  if (!props.myCompany) {
    return (
      <div className="cv-box">
        <h1>Créer ton entreprise</h1>
        <p className="sub">Nécessaire pour publier des offres.</p>
        <form onSubmit={createCompany}>
          <label htmlFor="companyName">Nom de l'entreprise</label>
          <input
            id="companyName"
            type="text"
            required
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            style={{ marginBottom: 16 }}
          />
          <label htmlFor="companyDesc">Description (optionnel)</label>
          <textarea
            id="companyDesc"
            rows={3}
            value={companyDesc}
            onChange={(e) => setCompanyDesc(e.target.value)}
            style={{ marginBottom: 16 }}
          />
          {companyError && <p className="error-msg">{companyError}</p>}
          <button type="submit" disabled={creatingCompany || !companyName}>
            {creatingCompany ? 'Création...' : "Créer l'entreprise"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="cv-box">
        <h1>{props.myCompany.name}</h1>
        <p className="sub">Publier une nouvelle offre</p>
        <form onSubmit={createListing}>
          <label htmlFor="listingTitle">Titre du poste</label>
          <input
            id="listingTitle"
            type="text"
            required
            value={listingTitle}
            onChange={(e) => setListingTitle(e.target.value)}
            style={{ marginBottom: 16 }}
          />
          <label htmlFor="listingDesc">Description</label>
          <textarea
            id="listingDesc"
            rows={3}
            value={listingDesc}
            onChange={(e) => setListingDesc(e.target.value)}
            style={{ marginBottom: 16 }}
          />
          <label htmlFor="listingLocation">Lieu</label>
          <input
            id="listingLocation"
            type="text"
            value={listingLocation}
            onChange={(e) => setListingLocation(e.target.value)}
            style={{ marginBottom: 16 }}
          />
          <label htmlFor="listingContract">Type de contrat</label>
          <input
            id="listingContract"
            type="text"
            placeholder="CDI, freelance..."
            value={listingContract}
            onChange={(e) => setListingContract(e.target.value)}
            style={{ marginBottom: 16 }}
          />
          <div className="toggle-row">
            <span>Remote</span>
            <input type="checkbox" checked={listingRemote} onChange={(e) => setListingRemote(e.target.checked)} />
          </div>
          {listingError && <p className="error-msg">{listingError}</p>}
          <button type="submit" disabled={creatingListing || !listingTitle}>
            {creatingListing ? 'Publication...' : "Publier l'offre"}
          </button>
        </form>
      </div>

      <div className="cv-box">
        <h1>Candidatures reçues</h1>
        {props.applicationsReceived.length === 0 && (
          <p className="hint">Aucune candidature pour le moment.</p>
        )}
        {props.applicationsReceived.map((app: any) => (
          <div key={app.id} className="applicant-row">
            <div>
              <div style={{ fontSize: '0.9rem' }}>{app.applicantName}</div>
              <div className="post-date">{formatDate(app.created_at)}</div>
            </div>
            {app.cvPath ? (
              <button type="button" onClick={() => viewCv(app.applicant_id, app.cvPath)}>
                Voir le CV
              </button>
            ) : (
              <span className="hint">Pas de CV</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
