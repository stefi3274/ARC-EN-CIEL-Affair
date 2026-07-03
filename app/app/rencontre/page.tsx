import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import TopBar from '@/components/top-bar';
import Discovery from './discovery';

type DiscoverRow = {
  user_id: string;
  bio: string | null;
  photos: string[] | null;
  age: number | null;
  public_key: string | null;
  status_text: string | null;
  status_media_url: string | null;
  status_expires_at: string | null;
  talents: string | null;
  dreams: string | null;
  goals: string | null;
};

export default async function RencontrePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: coreProfile } = await supabase
    .schema('core')
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .maybeSingle();

  if (!coreProfile) redirect('/onboarding');

  const { data: myDatingProfile } = await supabase
    .schema('dating')
    .from('profiles')
    .select('user_id, bio, photos, age, visible, public_key, talents, dreams, goals')
    .eq('user_id', user.id)
    .maybeSingle();

  const { data: discoverRows } = await supabase
    .schema('dating')
    .rpc('discover_profiles', { limit_count: 20 });

  const rows = (discoverRows ?? []) as DiscoverRow[];

  const profiles = await Promise.all(
    rows.map(async (row) => {
      let photoUrl: string | null = null;
      const firstPhoto = Array.isArray(row.photos) && row.photos.length > 0 ? row.photos[0] : null;

      if (firstPhoto) {
        const signed = await supabase.storage.from('dating-photos').createSignedUrl(firstPhoto, 300);
        photoUrl = signed.data?.signedUrl ?? null;
      }

      let statusPhotoUrl: string | null = null;
      if (row.status_media_url) {
        const signedStatus = await supabase.storage.from('dating-photos').createSignedUrl(row.status_media_url, 300);
        statusPhotoUrl = signedStatus.data?.signedUrl ?? null;
      }

      return {
        userId: row.user_id,
        bio: row.bio,
        age: row.age,
        publicKey: row.public_key,
        photoUrl,
        statusText: row.status_text,
        statusPhotoUrl,
        statusExpiresAt: row.status_expires_at,
        talents: row.talents,
        dreams: row.dreams,
        goals: row.goals,
      };
    })
  );

  return (
    <div className="feed-shell">
      <TopBar active="rencontre" />

      <Discovery
        currentUserId={user.id}
        initialProfiles={profiles}
        hasDatingProfile={!!myDatingProfile}
        myBio={myDatingProfile?.bio ?? ''}
        myAge={myDatingProfile?.age ?? null}
        myVisible={myDatingProfile?.visible ?? true}
        myPhotos={(myDatingProfile?.photos as string[]) ?? []}
        myTalents={myDatingProfile?.talents ?? ''}
        myDreams={myDatingProfile?.dreams ?? ''}
        myGoals={myDatingProfile?.goals ?? ''}
      />
    </div>
  );
}
