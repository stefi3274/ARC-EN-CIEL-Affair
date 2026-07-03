export default function ConfidentialitePage() {
  return (
    <main className="legal-main">
      <a href="/" className="back-link">← Retour</a>
      <h1>Politique de confidentialité</h1>
      <p className="legal-updated">Dernière mise à jour : à compléter</p>

      <div className="legal-disclaimer">
        Ce texte est un modèle de départ, pas un avis juridique. Fais-le relire par un
        professionnel avant un lancement public, notamment concernant tes obligations RGPD
        exactes selon ta situation et ta localisation.
      </div>

      <h2>1. Données que nous collectons</h2>
      <p>
        Email et méthode de connexion (Google ou lien magique), nom affiché, pronoms
        (optionnels), photos que tu choisis de téléverser, contenu que tu publies (posts,
        annonces, offres, événements). Les champs sensibles du profil Rencontre (orientation,
        localisation précise si utilisés) sont conçus pour rester chiffrés côté client quand
        c'est techniquement possible.
      </p>

      <h2>2. Messagerie</h2>
      <p>
        Les messages du module Rencontre sont chiffrés de bout en bout. Le serveur ne stocke
        que du texte chiffré, illisible sans la clé qui reste uniquement sur ton appareil.
      </p>

      <h2>3. Hébergement</h2>
      <p>
        Les données sont hébergées chez Supabase (base de données et fichiers) et le site est
        servi via Vercel. Ces prestataires agissent comme sous-traitants techniques.
      </p>

      <h2>4. À quoi servent tes données</h2>
      <ul>
        <li>Faire fonctionner le service (connexion, affichage de ton profil et de ton contenu)</li>
        <li>Mise en relation dans le module Rencontre (découverte, matching)</li>
        <li>Modération et sécurité (traitement des signalements)</li>
      </ul>

      <h2>5. Tes droits</h2>
      <p>
        Tu peux consulter et modifier tes informations à tout moment depuis la page Profil.
        Tu peux supprimer ton compte et l'ensemble des données associées directement depuis
        cette même page (section "Zone dangereuse") ; cette suppression est immédiate et
        définitive.
      </p>

      <h2>6. Cookies</h2>
      <p>
        Seuls des cookies nécessaires au fonctionnement (maintien de ta session de connexion)
        sont utilisés. Aucun cookie publicitaire ou de tracking tiers.
      </p>

      <h2>7. Mineurs</h2>
      <p>Le service n'est pas destiné aux personnes de moins de 18 ans.</p>

      <h2>8. Contact</h2>
      <p>
        Pour toute question relative à tes données : stefi3274@gmail.com — WhatsApp +509 36281876
      </p>
    </main>
  );
}
