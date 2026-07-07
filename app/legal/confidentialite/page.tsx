export default function ConfidentialitePage() {
  return (
    <main className="legal-main">
      <a href="/" className="back-link">← Retour</a>
      <h1>Politique de confidentialité</h1>
      <p className="legal-updated">Dernière mise à jour : 7 juillet 2026</p>

      <h2>1. Qui traite tes données</h2>
      <p>
        SteFi Services, entreprise individuelle basée à Delmas, Port-au-Prince, Haïti, est
        responsable du traitement des données collectées sur ARC-EN-CIEL Affair.
      </p>

      <h2>2. Données que nous collectons</h2>
      <p>
        Email et méthode de connexion (Google ou lien magique), nom affiché, pronoms
        (optionnels), photos que tu choisis de téléverser, contenu que tu publies (posts,
        annonces, offres, événements). Les champs sensibles du profil Rencontre (orientation,
        localisation précise si utilisés) sont conçus pour rester chiffrés côté client quand
        c'est techniquement possible.
      </p>

      <h2>3. Messagerie et journal partagé</h2>
      <p>
        Les messages du module Rencontre sont chiffrés de bout en bout. Le serveur ne stocke
        que du texte chiffré, illisible sans la clé qui reste uniquement sur ton appareil. Le
        journal partagé, une fois un partenariat accepté, rend les entrées visibles aux deux
        membres concernés uniquement.
      </p>

      <h2>4. Hébergement</h2>
      <p>
        Les données sont hébergées chez Supabase (base de données et fichiers) et le site est
        servi via Vercel. Ces prestataires agissent comme sous-traitants techniques.
      </p>

      <h2>5. À quoi servent tes données</h2>
      <ul>
        <li>Faire fonctionner le service (connexion, affichage de ton profil et de ton contenu)</li>
        <li>Mise en relation dans le module Rencontre (découverte, matching)</li>
        <li>Modération et sécurité (traitement des signalements)</li>
      </ul>

      <h2>6. Tes droits</h2>
      <p>
        Tu peux consulter et modifier tes informations à tout moment depuis la page Profil.
        Tu peux supprimer ton compte et l'ensemble des données associées directement depuis
        cette même page (section "Zone dangereuse") ; cette suppression est immédiate et
        définitive. Pour toute autre demande relative à tes données, contacte-nous (voir
        section 9).
      </p>

      <h2>7. Cookies</h2>
      <p>
        Seuls des cookies nécessaires au fonctionnement (maintien de ta session de connexion)
        sont utilisés. Aucun cookie publicitaire ou de tracking tiers.
      </p>

      <h2>8. Mineurs</h2>
      <p>Le service n'est pas destiné aux personnes de moins de 18 ans.</p>

      <h2>9. Contact</h2>
      <p>
        SteFi Services — Delmas, Port-au-Prince, Haïti<br />
        Email : stefi3274@gmail.com<br />
        WhatsApp : +509 3628-1876
      </p>
    </main>
  );
}
