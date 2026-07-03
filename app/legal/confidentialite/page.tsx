export default function ConfidentialitePage() {
  return (
    <main className="legal-main">
      <a href="/" className="back-link">← Retour</a>
      <h1>Politique de confidentialite</h1>
      <p className="legal-updated">Derniere mise a jour : a completer</p>

      <div className="legal-disclaimer">
        Ce texte est un modele de depart, pas un avis juridique. Fais-le relire par un
        professionnel avant un lancement public, notamment concernant tes obligations RGPD
        exactes selon ta situation et ta localisation.
      </div>

      <h2>1. Donnees que nous collectons</h2>
      <p>
        Email et methode de connexion (Google ou lien magique), nom affiche, pronoms
        (optionnels), photos que tu choisis de televerser, contenu que tu publies (posts,
        annonces, offres, evenements). Les champs sensibles du profil Rencontre (orientation,
        localisation precise si utilises) sont concus pour rester chiffres cote client quand
        c'est techniquement possible.
      </p>

      <h2>2. Messagerie</h2>
      <p>
        Les messages du module Rencontre sont chiffres de bout en bout. Le serveur ne stocke
        que du texte chiffre, illisible sans la cle qui reste uniquement sur ton appareil.
      </p>

      <h2>3. Hebergement</h2>
      <p>
        Les donnees sont hebergees chez Supabase (base de donnees et fichiers) et le site est
        servi via Vercel. Ces prestataires agissent comme sous-traitants techniques.
      </p>

      <h2>4. A quoi servent tes donnees</h2>
      <ul>
        <li>Faire fonctionner le service (connexion, affichage de ton profil et de ton contenu)</li>
        <li>Mise en relation dans le module Rencontre (decouverte, matching)</li>
        <li>Moderation et securite (traitement des signalements)</li>
      </ul>

      <h2>5. Tes droits</h2>
      <p>
        Tu peux consulter et modifier tes informations a tout moment depuis la page Profil.
        Tu peux supprimer ton compte et l'ensemble des donnees associees directement depuis
        cette meme page (section "Zone dangereuse") ; cette suppression est immediate et
        definitive.
      </p>

      <h2>6. Cookies</h2>
      <p>
        Seuls des cookies necessaires au fonctionnement (maintien de ta session de connexion)
        sont utilises. Aucun cookie publicitaire ou de tracking tiers.
      </p>

      <h2>7. Mineurs</h2>
      <p>Le service n'est pas destine aux personnes de moins de 18 ans.</p>

      <h2>8. Contact</h2>
      <p>
        Pour toute question relative a tes donnees : stefi3274@gmail.com — WhatsApp +509 36281876
      </p>
    </main>
  );
}
