'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type NotifItem = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link_type: string | null;
  link_id: string | null;
  read: boolean;
  created_at: string;
};

function linkFor(item: NotifItem): string | null {
  if (item.link_type === 'match') return '/app/rencontre/messages/' + item.link_id;
  if (item.link_type === 'application') return '/app/emploi';
  return null;
}

export default function NotificationsBell() {
  const router = useRouter();
  const [items, setItems] = useState<NotifItem[]>([]);
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function init() {
      const userResult = await supabase.auth.getUser();
      const user = userResult.data.user;
      if (!user) return;
      setUserId(user.id);

      const { data } = await supabase
        .schema('notifications')
        .from('items')
        .select('id, type, title, body, link_type, link_id, read, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30);

      setItems(data ?? []);

      channel = supabase
        .channel('notifications-' + user.id)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'notifications', table: 'items', filter: 'user_id=eq.' + user.id },
          (payload) => {
            setItems((prev) => [payload.new as NotifItem, ...prev]);
          }
        )
        .subscribe();
    }

    init();
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const unreadCount = items.filter((i) => !i.read).length;

  async function handleOpen() {
    setOpen((v) => !v);
  }

  async function handleClickItem(item: NotifItem) {
    if (!item.read) {
      const supabase = createClient();
      await supabase.schema('notifications').from('items').update({ read: true }).eq('id', item.id);
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, read: true } : i)));
    }
    const dest = linkFor(item);
    setOpen(false);
    if (dest) router.push(dest);
  }

  if (!userId) return null;

  return (
    <div className="notif-wrap">
      <button type="button" className="notif-bell" onClick={handleOpen} aria-label="Notifications">
        🔔
        {unreadCount > 0 && <span className="notif-count">{unreadCount}</span>}
      </button>

      {open && (
        <div className="notif-panel">
          {items.length === 0 && <p className="hint" style={{ padding: 16 }}>Aucune notification.</p>}
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={'notif-item' + (item.read ? '' : ' unread')}
              onClick={() => handleClickItem(item)}
            >
              <div className="notif-item-title">{item.title}</div>
              {item.body && <div className="notif-item-body">{item.body}</div>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
