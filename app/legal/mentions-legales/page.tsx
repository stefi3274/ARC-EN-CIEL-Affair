export default function MentionsLegalesPage() {
  return (
    <main className="legal-main">
      <a href="/" className="back-link">← Retour</a>
      <h1>Mentions legales</h1>

      <div className="legal-disclaimer">
        Champs a completer avant mise en ligne publique — ces informations sont generalement
        obligatoires selon la juridiction. Fais confirmer par un professionnel si besoin.
      </div>

      <h2>Editeur du site</h2>
      <p>
        Nom / raison sociale : SteFi Services<br />
        Statut : a completer (particulier, entreprise individuelle, societe...)<br />
        Adresse : a completer<br />
        Email de contact : stefi3274@gmail.com<br />
        WhatsApp : +509 36281876
      </p>

      <h2>Directeur de publication</h2>
      <p>SteFi Services</p>

      <h2>Hebergement</h2>
      <p>
        Hebergement de l'application : Vercel Inc.<br />
        Hebergement de la base de donnees et des fichiers : Supabase Inc.
      </p>

      <h2>Contact</h2>
      <p>
        Email : stefi3274@gmail.com<br />
        WhatsApp : +509 36281876
      </p>
    </main>
  );
}
