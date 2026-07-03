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
        Nom / raison sociale : a completer<br />
        Statut (particulier, entreprise individuelle, societe...) : a completer<br />
        Adresse : a completer<br />
        Email de contact : a completer
      </p>

      <h2>Directeur de publication</h2>
      <p>A completer</p>

      <h2>Hebergement</h2>
      <p>
        Hebergement de l'application : Vercel Inc.<br />
        Hebergement de la base de donnees et des fichiers : Supabase Inc.
      </p>

      <h2>Contact</h2>
      <p>Pour toute question : a completer (adresse email de contact).</p>
    </main>
  );
}
