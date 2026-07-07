import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function Home() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .schema('core')
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    redirect(profile ? '/app' : '/onboarding');
  }

  return (
    <div className="landing-shell">
      <nav className="landing-nav">
        <div className="auth-brand">
          <span className="brand-mark"></span>
          <span className="brand-word">ARC-EN-CIEL</span>
          <span className="brand-word brand-word-sub">Affair</span>
        </div>
        <a href="/login" className="landing-nav-cta">Entrer</a>
      </nav>

      <section className="landing-hero">
        <span className="eyebrow">Une seule adresse, toute ta vie</span>
        <h1 className="landing-title">
          Ici, tu n'as <em>rien</em>
          <br />à expliquer.
          <span className="landing-signature">
            <svg viewBox="0 0 400 14" preserveAspectRatio="none">
              <path d="M2,10 C 80,2 160,14 240,6 S 360,2 398,8" fill="none" stroke="url(#landingGrad)" strokeWidth="2.5" strokeLinecap="round" />
              <defs>
                <linearGradient id="landingGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ff5f6d" />
                  <stop offset="30%" stopColor="#ffb347" />
                  <stop offset="55%" stopColor="#3ec97a" />
                  <stop offset="78%" stopColor="#3ea9ff" />
                  <stop offset="100%" stopColor="#a06bff" />
                </linearGradient>
              </defs>
            </svg>
          </span>
        </h1>
        <p className="landing-sub">
          Réseau, rencontres, emploi, marché et mobilisation — un seul espace pensé pour la
          communauté. Discret par défaut. Chiffré de bout en bout.
        </p>
        <a href="/login" className="landing-cta-primary">Rejoindre</a>
      </section>

      <div className="landing-marquee-wrap">
        <div className="landing-marquee">
          <span>Fil</span><span>Rencontre</span><span>Emploi</span><span>Marketplace</span><span>Agenda</span>
          <span>Fil</span><span>Rencontre</span><span>Emploi</span><span>Marketplace</span><span>Agenda</span>
        </div>
      </div>

      <section className="landing-modules">
        <div className="landing-module-tile landing-module-fil">
          <span className="landing-module-name">Fil</span>
          <p>Des espaces qui te ressemblent.</p>
        </div>
        <div className="landing-module-tile landing-module-rencontre">
          <span className="landing-module-name">Rencontre</span>
          <p>Sans te mettre en danger.</p>
        </div>
        <div className="landing-module-tile landing-module-emploi">
          <span className="landing-module-name">Emploi</span>
          <p>Travailler sans te cacher.</p>
        </div>
        <div className="landing-module-tile landing-module-market">
          <span className="landing-module-name">Marketplace</span>
          <p>Un marché à ton image.</p>
        </div>
        <div className="landing-module-tile landing-module-agenda">
          <span className="landing-module-name">Agenda</span>
          <p>Se rassembler, agir.</p>
        </div>
      </section>

      <footer className="landing-footer">
        <span>© 2026 ARC-EN-CIEL Affair</span>
        <div>
          <a href="/legal/cgu">CGU</a>
          {' · '}
          <a href="/legal/confidentialite">Confidentialité</a>
          {' · '}
          <a href="/legal/mentions-legales">Mentions légales</a>
          {' · '}
          <a href="/legal/contact">Contact</a>
        </div>
      </footer>
    </div>
  );
}
