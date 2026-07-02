import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import TopBar from '@/components/top-bar';
import EmploiClient from './emploi-client';

export default async function EmploiPage() {
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

  const { data: listings } = await supabase
    .schema('jobs')
    .from('listings')
    .select('id, title, description, location, remote, contract_type, created_at, company_id, companies(name, inclusive_label)')
    .order('created_at', { ascending: false })
    .limit(40);

  const { data: myCompany } = await supabase
    .schema('jobs')
    .from('companies')
    .select('id, name, description, inclusive_label')
    .eq('owner_id', user.id)
    .maybeSingle();

  const { data: myCv } = await supabase
    .schema('jobs')
    .from('cv')
    .select('user_id, file_url, headline, updated_at')
    .eq('user_id', user.id)
    .maybeSingle();

  const { data: myApplications } = await supabase
    .schema('jobs')
    .from('applications')
    .select('listing_id, status')
    .eq('applicant_id', user.id);

  let myListings: any[] = [];
  let applicationsReceived: any[] = [];

  if (myCompany) {
    const { data: ownListings } = await supabase
      .schema('jobs')
      .from('listings')
      .select('id, title, created_at')
      .eq('company_id', myCompany.id)
      .order('created_at', { ascending: false });

    myListings = ownListings ?? [];

    const listingIds = myListings.map((l) => l.id);

    if (listingIds.length > 0) {
      const { data: apps } = await supabase
        .schema('jobs')
        .from('applications')
        .select('id, listing_id, applicant_id, cover_letter, status, created_at')
        .in('listing_id', listingIds)
        .order('created_at', { ascending: false });

      const applicantIds = Array.from(new Set((apps ?? []).map((a) => a.applicant_id)));
      let applicantNames: Record<string, string> = {};

      if (applicantIds.length > 0) {
        const { data: profs } = await supabase
          .schema('core')
          .from('profiles_public')
          .select('id, display_name')
          .in('id', applicantIds);
        applicantNames = Object.fromEntries((profs ?? []).map((p) => [p.id, p.display_name]));
      }

      const { data: cvs } = await supabase
        .schema('jobs')
        .from('cv')
        .select('user_id, file_url')
        .in('user_id', applicantIds.length > 0 ? applicantIds : ['00000000-0000-0000-0000-000000000000']);

      const cvByUser = Object.fromEntries((cvs ?? []).map((c) => [c.user_id, c.file_url]));

      applicationsReceived = (apps ?? []).map((a) => ({
        ...a,
        applicantName: applicantNames[a.applicant_id] ?? 'Candidat',
        cvPath: cvByUser[a.applicant_id] ?? null,
      }));
    }
  }

  return (
    <div className="feed-shell">
      <TopBar active="emploi" />

      <EmploiClient
        currentUserId={user.id}
        listings={listings ?? []}
        myCompany={myCompany}
        myCv={myCv}
        myApplications={myApplications ?? []}
        myListings={myListings}
        applicationsReceived={applicationsReceived}
      />
    </div>
  );
}
