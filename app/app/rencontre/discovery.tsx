'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import TabBar from '@/components/tab-bar';
import PanelLoading from '@/components/panel-loading';

const GridView = dynamic(() => import('./grid-view'), { loading: () => <PanelLoading />, ssr: false });
const SwipeView = dynamic(() => import('./swipe-view'), { loading: () => <PanelLoading />, ssr: false });
const ProfilForm = dynamic(() => import('./profil-form'), { loading: () => <PanelLoading />, ssr: false });

type Profile = {
  userId: string;
  bio: string | null;
  age: number | null;
  publicKey: string | null;
  photoUrl: string | null;
  statusText: string | null;
  statusExpiresAt: string | null;
};

type Props = {
  currentUserId: string;
  initialProfiles: Profile[];
  hasDatingProfile: boolean;
  myBio: string;
  myAge: number | null;
  myVisible: boolean;
  myPhotos: string[];
};

export default function Discovery(props: Props) {
  const router = useRouter();
  const [view, setView] = useState(props.hasDatingProfile ? 'grid' : 'profil');
  const [profiles, setProfiles] = useState(props.initialProfiles);
  const [matchMessage, setMatchMessage] = useState<string | null>(null);

  async function handleSwipe(targetUserId: string, liked: boolean) {
    const supabase = createClient();

    await supabase
      .schema('dating')
      .from('swipes')
      .insert({ swiper_id: props.currentUserId, swiped_id: targetUserId, liked });

    if (liked) {
      const { data: match } = await supabase
        .schema('dating')
        .from('matches')
        .select('id')
        .or(
          'and(user_a.eq.' + props.currentUserId + ',user_b.eq.' + targetUserId + '),and(user_a.eq.' + targetUserId + ',user_b.eq.' + props.currentUserId + ')'
        )
        .maybeSingle();

      if (match) {
        setMatchMessage('Match ! Vous vous etes plu mutuellement.');
        setTimeout(() => setMatchMessage(null), 3000);
      }
    }

    setProfiles((prev) => prev.filter((p) => p.userId !== targetUserId));
  }

  if (view === 'profil') {
    return (
      <main className="rencontre-main">
        <ProfilForm
          bio={props.myBio}
          age={props.myAge}
          visible={props.myVisible}
          photos={props.myPhotos}
          hasProfile={props.hasDatingProfile}
          onSaved={() => {
            router.refresh();
            setView('grid');
          }}
        />
      </main>
    );
  }

  return (
    <main className="rencontre-main">
      <TabBar
        wrapperClass="view-toggle"
        active={view}
        onChange={setView}
        tabs={[
          { key: 'grid', label: 'Grille' },
          { key: 'swipe', label: 'Swipe' },
          { key: 'profil', label: 'Mon profil' },
        ]}
      />

      {matchMessage && (
        <p className="hint" style={{ textAlign: 'center', color: 'var(--rose)', marginBottom: 16 }}>
          {matchMessage}
        </p>
      )}

      {view === 'grid' ? (
        <GridView profiles={profiles} onSwipe={handleSwipe} />
      ) : (
        <SwipeView profiles={profiles} onSwipe={handleSwipe} />
      )}
    </main>
  );
}
