'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import TabBar from '@/components/tab-bar';
import PanelLoading from '@/components/panel-loading';

const ListingsBrowser = dynamic(() => import('./listings-browser'), { loading: () => <PanelLoading />, ssr: false });
const CvManager = dynamic(() => import('./cv-manager'), { loading: () => <PanelLoading />, ssr: false });
const RecruteurPanel = dynamic(() => import('./recruteur-panel'), { loading: () => <PanelLoading />, ssr: false });

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
