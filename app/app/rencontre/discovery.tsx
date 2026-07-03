'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import TabBar from '@/components/tab-bar';
import GridView from './grid-view';
import SwipeView from './swipe-view';
import ProfilForm from './profil-form';

type Profile = {
  userId: string;
  bio: string | null;
  age: number | null;
  publicKey: string | null;
  photoUrl: string | null;
  statusText: string | null;
  statusPhotoUrl: string | null;
  statusExpiresAt: string | null;
  talents: string | null;
  dreams: string | null;
  goals: string | null;
};

type Props = {
  currentUserId: string;
  initialProfiles: Profile[];
  hasDatingProfile: boolean;
  myBio: string;
  myAge: number | null;
  myVisible: boolean;
  myPhotos: string[];
  myTalents: string;
  myDreams: string;
  myGoals: string;
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
          talents={props.myTalents}
          dreams={props.myDreams}
          goals={props.myGoals}
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
