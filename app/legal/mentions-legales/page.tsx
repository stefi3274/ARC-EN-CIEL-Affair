export default function MentionsLegalesPage() {
  return (
    <main className="legal-main">
      <a href="/" className="back-link">← Retour</a>
      <h1>Mentions légales</h1>

      <div className="legal-disclaimer">
        Champs à compléter avant mise en ligne publique — ces informations sont généralement
        obligatoires selon la juridiction. Fais confirmer par un professionnel si besoin.
      </div>

      <h2>Éditeur du site</h2>
      <p>
        Nom / raison sociale : SteFi Services<br />
        Statut : à compléter (particulier, entreprise individuelle, société...)<br />
        Adresse : à compléter<br />
        Email de contact : stefi3274@gmail.com<br />
        WhatsApp : +509 36281876
      </p>

      <h2>Directeur de publication</h2>
      <p>SteFi Services</p>

      <h2>Hébergement</h2>
      <p>
        Hébergement de l'application : Vercel Inc.<br />
        Hébergement de la base de données et des fichiers : Supabase Inc.
      </p>

      <h2>Contact</h2>
      <p>
        Email : stefi3274@gmail.com<br />
        WhatsApp : +509 36281876
      </p>
    </main>
  );
}
