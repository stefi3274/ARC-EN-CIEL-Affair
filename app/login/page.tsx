'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleGoogleSignIn() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);
    if (error) {
      setError("Impossible d'envoyer le lien. Vérifie l'adresse et réessaie.");
      return;
    }
    setSent(true);
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="brand-mark"></span>ARC-EN-CIEL Affair
        </div>

        {sent ? (
          <div className="success-box">
            Un lien de connexion a été envoyé à <strong>{email}</strong>.
            Ouvre-le depuis ce même appareil pour continuer.
          </div>
        ) : (
          <>
            <h1>Entrer</h1>
            <p className="sub">Rejoins la communauté en un clic.</p>

            <button type="button" onClick={handleGoogleSignIn} style={{ marginBottom: 28 }}>
              Continuer avec Google
            </button>

            <p className="hint" style={{ margin: '0 0 20px' }}>ou par email</p>

            <form onSubmit={handleSubmit}>
              <label htmlFor="email">Adresse email</label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="toi@exemple.com"
              />
              {error && <p className="error-msg">{error}</p>}
              <button type="submit" disabled={loading}>
                {loading ? 'Envoi en cours…' : 'Recevoir le lien'}
              </button>
            </form>
            <p className="hint">Aucune donnée n'est partagée entre les modules de l'app.</p>
            <p className="hint" style={{ marginTop: 10 }}>
              <a href="/legal/cgu" style={{ color: 'inherit' }}>CGU</a>
              {' · '}
              <a href="/legal/confidentialite" style={{ color: 'inherit' }}>Confidentialité</a>
              {' · '}
              <a href="/legal/mentions-legales" style={{ color: 'inherit' }}>Mentions légales</a>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
