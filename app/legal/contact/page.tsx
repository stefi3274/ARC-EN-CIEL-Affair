export default function ContactPage() {
  return (
    <main className="legal-main">
      <a href="/" className="back-link">← Retour</a>
      <h1>Contact</h1>
      <p className="legal-updated">SteFi Services — Delmas, Port-au-Prince, Haïti</p>

      <p>
        Une question, un problème, une suggestion ? Écris-nous directement :
      </p>

      <div className="contact-cards">
        <a href="mailto:stefi3274@gmail.com" className="contact-card">
          <span className="contact-card-label">Email</span>
          <span className="contact-card-value">stefi3274@gmail.com</span>
        </a>
        <a href="https://wa.me/50936281876" target="_blank" rel="noopener noreferrer" className="contact-card">
          <span className="contact-card-label">WhatsApp</span>
          <span className="contact-card-value">+509 3628-1876</span>
        </a>
      </div>

      <p style={{ marginTop: 32 }}>
        Pour signaler un contenu précis (post, profil, annonce...), utilise plutôt le bouton
        "Signaler" directement sur le contenu concerné dans l'app — c'est traité plus vite par
        l'équipe de modération.
      </p>
    </main>
  );
}
