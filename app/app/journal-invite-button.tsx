'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function JournalInviteButton(props: { currentUserId: string; targetUserId: string }) {
  const [status, setStatus] = useState<'idle' | 'sent' | 'error'>('idle');
  const [sending, setSending] = useState(false);

  async function handleInvite() {
    setSending(true);
    const supabase = createClient();

    const userA = props.currentUserId < props.targetUserId ? props.currentUserId : props.targetUserId;
    const userB = props.currentUserId < props.targetUserId ? props.targetUserId : props.currentUserId;

    const result = await supabase
      .schema('journal')
      .from('partners')
      .insert({ user_a: userA, user_b: userB, initiated_by: props.currentUserId });

    setSending(false);
    setStatus(result.error ? 'error' : 'sent');
  }

  if (status === 'sent') {
    return <p className="hint">Invitation envoyée.</p>;
  }

  return (
    <div>
      <button type="button" onClick={handleInvite} disabled={sending} style={{ width: 'auto', padding: '10px 20px' }}>
        {sending ? 'Envoi...' : 'Proposer le journal partagé'}
      </button>
      {status === 'error' && <p className="hint" style={{ marginTop: 8 }}>Déjà proposé, ou en cours.</p>}
    </div>
  );
}
