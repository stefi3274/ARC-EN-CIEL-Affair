'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { generateKeyPair, savePrivateKey, savePublicKey } from '@/lib/crypto';

export default function OnboardingPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [pronounsVisible, setPronounsVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError('Session expirée, reconnecte-toi.');
      setLoading(false);
      return;
    }

    // Identité minimale (core.profiles) — la table publique dénormalisée
    // se synchronise automatiquement via le trigger déjà posé côté base.
    const { error: profileError } = await supabase
      .schema('core')
      .from('profiles')
      .upsert({
        id: user.id,
        display_name: displayName,
        pronouns: pronouns || null,
        pronouns_visible: pronounsVisible,
      });

    if (profileError) {
      setError("Impossible de créer le profil. Réessaie dans un instant.");
      setLoading(false);
      return;
    }

    // Paire de clés E2E — générée une seule fois, ici. La clé privée ne quitte
    // jamais cet appareil (IndexedDB), la clé publique sera utilisée plus tard
    // si l'utilisateur active le module Rencontre.
    const { publicKey, privateKey } = await generateKeyPair();
    await savePrivateKey(user.id, privateKey);
    await savePublicKey(user.id, publicKey);

    setLoading(false);
    router.push('/');
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="brand-mark"></span>ARC-EN-CIEL Affair
        </div>
        <h1>Créer ton profil</h1>
        <p className="sub">
          Le strict nécessaire pour commencer. Tu pourras tout ajuster ensuite, module par module.
        </p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="displayName">Nom affiché</label>
          <input
            id="displayName"
            type="text"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Comment on t'appelle"
          />

          <label htmlFor="pronouns">Pronoms (optionnel)</label>
          <input
            id="pronouns"
            type="text"
            value={pronouns}
            onChange={(e) => setPronouns(e.target.value)}
            placeholder="iel, elle, il…"
          />

          <div className="checkbox-row">
            <input
              id="pronounsVisible"
              type="checkbox"
              checked={pronounsVisible}
              onChange={(e) => setPronounsVisible(e.target.checked)}
            />
            <label htmlFor="pronounsVisible" style={{ margin: 0, textTransform: 'none', letterSpacing: 0 }}>
              Rendre mes pronoms visibles publiquement
            </label>
          </div>

          {error && <p className="error-msg">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Création…' : 'Continuer'}
          </button>
        </form>
      </div>
    </div>
  );
}
