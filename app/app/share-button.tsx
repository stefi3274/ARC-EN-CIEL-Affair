'use client';

import { useState } from 'react';

export default function ShareButton(props: { content: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.origin + '/app';

    if (navigator.share) {
      try {
        await navigator.share({ title: 'ARC-EN-CIEL Affair', text: props.content, url });
      } catch {
        // annule par la personne, rien a faire
      }
      return;
    }

    await navigator.clipboard.writeText(props.content + ' — ' + url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button type="button" className="post-action-btn" onClick={handleShare}>
      {copied ? 'Copie !' : '↗ Partager'}
    </button>
  );
}
