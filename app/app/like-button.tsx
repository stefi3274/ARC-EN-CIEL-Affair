'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function LikeButton(props: { postId: string; initialLiked: boolean; initialCount: number }) {
  const [liked, setLiked] = useState(props.initialLiked);
  const [count, setCount] = useState(props.initialCount);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    const supabase = createClient();
    const userResult = await supabase.auth.getUser();
    const user = userResult.data.user;
    if (!user) {
      setBusy(false);
      return;
    }

    if (liked) {
      setLiked(false);
      setCount((c) => Math.max(0, c - 1));

      const result = await supabase
        .schema('social')
        .from('likes')
        .delete()
        .eq('post_id', props.postId)
        .eq('user_id', user.id);

      if (result.error) {
        // echec silencieux impossible : on annule le changement visuel
        setLiked(true);
        setCount((c) => c + 1);
      }
    } else {
      setLiked(true);
      setCount((c) => c + 1);

      const result = await supabase
        .schema('social')
        .from('likes')
        .insert({ post_id: props.postId, user_id: user.id });

      if (result.error) {
        setLiked(false);
        setCount((c) => Math.max(0, c - 1));
      }
    }

    setBusy(false);
  }

  return (
    <button type="button" className={'post-action-btn' + (liked ? ' liked' : '')} onClick={toggle} disabled={busy}>
      {liked ? '♥' : '♡'} {count > 0 ? count : ''}
    </button>
  );
}
