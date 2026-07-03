'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getPrivateKey, encryptMessage, decryptMessage } from '@/lib/crypto';

type Message = {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
};

export default function ConversationClient(props: {
  matchId: string;
  currentUserId: string;
  otherUserId: string;
  otherName: string;
  otherAvatar: string | null;
}) {
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [keyError, setKeyError] = useState(false);
  const myPrivateKeyRef = useRef<Uint8Array | null>(null);
  const theirPublicKeyRef = useRef<Uint8Array | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    async function load() {
      const myPrivateKey = await getPrivateKey(props.currentUserId);
      if (!myPrivateKey) {
        if (!cancelled) setKeyError(true);
        return;
      }
      myPrivateKeyRef.current = myPrivateKey;

      const { data: theirKey } = await supabase
        .schema('dating')
        .rpc('get_match_public_key', { other_user_id: props.otherUserId });

      if (!theirKey) {
        if (!cancelled) setKeyError(true);
        return;
      }
      theirPublicKeyRef.current = theirKey;

      const { data: rows } = await supabase
        .schema('dating')
        .from('messages')
        .select('id, sender_id, ciphertext, created_at')
        .eq('match_id', props.matchId)
        .order('created_at', { ascending: true });

      const decrypted = await Promise.all(
        (rows ?? []).map(async (row) => {
          let text = 'Message illisible';
          try {
            text = await decryptMessage(row.ciphertext, myPrivateKeyRef.current!, theirPublicKeyRef.current!);
          } catch {
            // reste "Message illisible"
          }
          return { id: row.id, senderId: row.sender_id, text, createdAt: row.created_at };
        })
      );

      if (!cancelled) setMessages(decrypted);
    }

    load();

    const channel = supabase
      .channel('match-' + props.matchId)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'dating', table: 'messages', filter: 'match_id=eq.' + props.matchId },
        async (payload) => {
          if (!myPrivateKeyRef.current || !theirPublicKeyRef.current) return;
          const row: any = payload.new;
          let text = 'Message illisible';
          try {
            text = await decryptMessage(row.ciphertext, myPrivateKeyRef.current, theirPublicKeyRef.current);
          } catch {
            // reste "Message illisible"
          }
          setMessages((prev) => [
            ...(prev ?? []),
            { id: row.id, senderId: row.sender_id, text, createdAt: row.created_at },
          ]);
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [props.matchId, props.currentUserId, props.otherUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !myPrivateKeyRef.current || !theirPublicKeyRef.current) return;
    setSending(true);

    const supabase = createClient();
    const ciphertext = await encryptMessage(input.trim(), myPrivateKeyRef.current, theirPublicKeyRef.current);

    await supabase
      .schema('dating')
      .from('messages')
      .insert({ match_id: props.matchId, sender_id: props.currentUserId, ciphertext });

    setInput('');
    setSending(false);
  }

  return (
    <div className="conversation-shell">
      <div className="conversation-header">
        <a href="/app/rencontre">←</a>
        <div
          className="message-avatar"
          style={props.otherAvatar ? { backgroundImage: 'url(' + props.otherAvatar + ')' } : undefined}
        ></div>
        <div className="conversation-header-name">{props.otherName}</div>
      </div>

      <div className="conversation-messages">
        {keyError && (
          <p className="hint" style={{ textAlign: 'center' }}>
            Impossible de dechiffrer cette conversation sur cet appareil. Reconnecte-toi depuis
            l'appareil ou tu as cree ton profil Rencontre.
          </p>
        )}

        {messages === null && !keyError && (
          <p className="hint" style={{ textAlign: 'center' }}>Chargement...</p>
        )}

        {messages && messages.length === 0 && (
          <p className="empty-state">Dites bonjour pour commencer la conversation.</p>
        )}

        {messages?.map((m) => (
          <div key={m.id} className={'bubble ' + (m.senderId === props.currentUserId ? 'bubble-mine' : 'bubble-theirs')}>
            {m.text}
            <span className="bubble-time">
              {new Date(m.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        <div ref={bottomRef}></div>
      </div>

      <form onSubmit={handleSend} className="conversation-composer">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ecris un message..."
          disabled={keyError}
        />
        <button type="submit" disabled={sending || !input.trim() || keyError}>
          Envoyer
        </button>
      </form>
    </div>
  );
}
