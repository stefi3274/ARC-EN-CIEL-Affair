'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TabBar from '@/components/tab-bar';
import ListingsBrowser from './listings-browser';
import CvManager from './cv-manager';
import RecruteurPanel from './recruteur-panel';

type Props = {
  currentUserId: string;
  listings: any[];
  myCompany: any;
  myCv: any;
  myApplications: any[];
  myListings: any[];
  applicationsReceived: any[];
};

export default function EmploiClient(props: Props) {
  const router = useRouter();
  const [tab, setTab] = useState('offres');

  const appliedListingIds = new Set(props.myApplications.map((a) => a.listing_id));

  return (
    <main className="emploi-main">
      <TabBar
        wrapperClass="emploi-tabs"
        active={tab}
        onChange={setTab}
        tabs={[
          { key: 'offres', label: 'Offres' },
          { key: 'cv', label: 'Mon CV' },
          { key: 'recruteur', label: 'Recruteur' },
        ]}
      />

      {tab === 'offres' && (
        <ListingsBrowser
          listings={props.listings}
          appliedListingIds={appliedListingIds}
          hasCv={!!props.myCv}
          onNeedsCv={() => setTab('cv')}
        />
      )}

      {tab === 'cv' && <CvManager myCv={props.myCv} onSaved={() => router.refresh()} />}

      {tab === 'recruteur' && (
        <RecruteurPanel
          myCompany={props.myCompany}
          myListings={props.myListings}
          applicationsReceived={props.applicationsReceived}
          onChanged={() => router.refresh()}
        />
      )}
    </main>
  );
}
