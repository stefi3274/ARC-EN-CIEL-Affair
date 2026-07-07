'use client';

import { useEffect, useState } from 'react';

const MESSAGE = "Rejoins-moi sur ARC-EN-CIEL Affair — le réseau LGBTQ+ qui réunit rencontre, emploi, marketplace et communauté, en toute discrétion.";

export default function InviteButton() {
  const [origin, setOrigin] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const fullMessage = MESSAGE + ' ' + origin;
  const encodedUrl = encodeURIComponent(origin);
  const encodedMessage = encodeURIComponent(fullMessage);

  async function copyLink() {
    await navigator.clipboard.writeText(fullMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div>
      <div className="invite-grid">
        <a
          className="invite-tile"
          href={'https://wa.me/?text=' + encodedMessage}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="invite-icon invite-icon-whatsapp">W</span>
          WhatsApp
        </a>

        <a
          className="invite-tile"
          href={'https://www.facebook.com/sharer/sharer.php?u=' + encodedUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="invite-icon invite-icon-facebook">f</span>
          Facebook
        </a>

        <a
          className="invite-tile"
          href={'https://twitter.com/intent/tweet?text=' + encodedMessage}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="invite-icon invite-icon-x">X</span>
          X
        </a>

        <button type="button" className="invite-tile" onClick={copyLink}>
          <span className="invite-icon invite-icon-instagram">IG</span>
          Instagram
        </button>
      </div>

      <button type="button" className="invite-copy-btn" onClick={copyLink}>
        {copied ? 'Lien copié !' : 'Copier le lien d\u2019invitation'}
      </button>

      {copied && (
        <p className="hint" style={{ marginTop: 8 }}>
          Colle-le où tu veux — y compris dans une Story ou un DM Instagram.
        </p>
      )}
    </div>
  );
}
