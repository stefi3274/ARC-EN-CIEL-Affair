'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function CvManager(props: { myCv: any; onSaved: () => void }) {
  const [uploading, setUploading] = useState(false);
  const [headline, setHeadline] = useState(props.myCv?.headline ?? '');
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);

    const supabase = createClient();
    const userResult = await supabase.auth.getUser();
    const user = userResult.data.user;
    if (!user) {
      setUploading(false);
      return;
    }

    const path = user.id + '/cv.pdf';
    const uploadResult = await supabase.storage.from('cv').upload(path, file, { upsert: true });

    if (uploadResult.error) {
      setUploading(false);
      setError('Envoi impossible. Verifie que le fichier est un PDF.');
      return;
    }

    const result = await supabase
      .schema('jobs')
      .from('cv')
      .upsert({ user_id: user.id, file_url: path, headline: headline || null });

    setUploading(false);

    if (result.error) {
      setError('Enregistrement impossible.');
      return;
    }

    props.onSaved();
  }

  return (
    <div className="cv-box">
      {props.myCv ? (
        <p className="cv-status">CV deja enregistre. Tu peux le remplacer ci-dessous.</p>
      ) : (
        <p className="cv-status">Aucun CV enregistre pour l instant.</p>
      )}

      <label htmlFor="headline">Titre / poste recherche (optionnel)</label>
      <input
        id="headline"
        type="text"
        value={headline}
        onChange={(e) => setHeadline(e.target.value)}
        placeholder="Ex: Developpeuse frontend"
        style={{ marginBottom: 16 }}
      />

      <label className="photo-upload-btn" style={{ width: 'auto', padding: '10px 20px', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
        {uploading ? 'Envoi...' : 'Choisir un PDF'}
        <input type="file" accept="application/pdf" onChange={handleUpload} style={{ display: 'none' }} />
      </label>

      {error && <p className="error-msg" style={{ marginTop: 12 }}>{error}</p>}
    </div>
  );
}
