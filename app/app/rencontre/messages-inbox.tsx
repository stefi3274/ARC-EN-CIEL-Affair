'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getPrivateKey, decryptMessage } from '@/lib/crypto';

type MatchRow = {
  matchId: string;
  otherUserId: string;
  otherName: string;
  otherAvatar: string | null;
  preview: string;
  time: string | null;
};

export default function MessagesInbox(props: { currentUserId: string }) {
  const router = useRouter();
  const [rows, setRows] = useState<MatchRow[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const supabase = createClient();

      const { data: matches } = await supabase
        .schema('dating')
        .from('matches')
        .select('id, user_a, user_b, matched_at')
        .or('user_a.eq.' + props.currentUserId + ',user_b.eq.' + props.currentUserId)
        .order('matched_at', { ascending: false });

      if (!matches || matches.length === 0) {
        if (!cancelled) setRows([]);
        return;
      }

      const otherIds = matches.map((m) =>
        m.user_a === props.currentUserId ? m.user_b : m.user_a
      );

      const { data: profiles } = await supabase
        .schema('core')
        .from('profiles_public')
        .select('id, display_name, avatar_url')
        .in('id', otherIds);

      const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));
      const myPrivateKey = await getPrivateKey(props.currentUserId);

      const built: MatchRow[] = [];

      for (const match of matches) {
        const otherId = match.user_a === props.currentUserId ? match.user_b : match.user_a;
        const profile = profileMap[otherId];

        const { data: lastMessages } = await supabase
          .schema('dating')
          .from('messages')
          .select('ciphertext, created_at')
          .eq('match_id', match.id)
          .order('created_at', { ascending: false })
          .limit(1);

        let preview = 'Dites bonjour !';
        let time: string | null = null;

        if (lastMessages && lastMessages.length > 0) {
          time = lastMessages[0].created_at;
          if (myPrivateKey) {
            try {
              const { data: theirKey } = await supabase
                .schema('dating')
                .rpc('get_match_public_key', { other_user_id: otherId });
              if (theirKey) {
                preview = await decryptMessage(lastMessages[0].ciphertext, myPrivateKey, theirKey);
              } else {
                preview = 'Message chiffre';
              }
            } catch {
              preview = 'Message chiffre';
            }
          } else {
            preview = 'Message chiffre';
          }
        }

        built.push({
          matchId: match.id,
          otherUserId: otherId,
          otherName: profile?.display_name ?? 'Un membre',
          otherAvatar: profile?.avatar_url ?? null,
          preview,
          time,
        });
      }

      if (!cancelled) setRows(built);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [props.currentUserId]);

  if (rows === null) {
    return <p className="hint" style={{ textAlign: 'center', padding: '40px 0' }}>Chargement...</p>;
  }

  if (rows.length === 0) {
    return <p className="empty-state">Aucun match pour le moment. Continue a découvrir des profils.</p>;
  }

  return (
    <div className="messages-list">
      {rows.map((row) => (
        <button
          key={row.matchId}
          type="button"
          className="message-row"
          onClick={() => router.push('/app/rencontre/messages/' + row.matchId)}
        >
          <div
            className="message-avatar"
            style={row.otherAvatar ? { backgroundImage: 'url(' + row.otherAvatar + ')' } : undefined}
          ></div>
          <div className="message-row-info">
            <div className="message-row-name">{row.otherName}</div>
            <div className="message-row-preview">{row.preview}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
