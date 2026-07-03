'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TabBar from '@/components/tab-bar';
import EventsPanel from './events-panel';
import PetitionsPanel from './pétitions-panel';
import ClassifiedsPanel from './classifieds-panel';

type Props = {
  currentUserId: string;
  canSignPetitions: boolean;
  events: any[];
  myRsvps: any[];
  pétitions: any[];
  signatureCounts: Record<string, number>;
  mySignedIds: string[];
  classifieds: any[];
};

export default function AgendaClient(props: Props) {
  const router = useRouter();
  const [tab, setTab] = useState('événements');
  const goingSet = new Set(props.myRsvps.filter((r) => r.status === 'going').map((r) => r.event_id));

  return (
    <main className="agenda-main">
      <TabBar
        wrapperClass="agenda-tabs"
        active={tab}
        onChange={setTab}
        tabs={[
          { key: 'événements', label: 'Événements' },
          { key: 'pétitions', label: 'Pétitions' },
          { key: 'annonces', label: 'Annonces' },
        ]}
      />

      {tab === 'événements' && (
        <EventsPanel events={props.events} goingSet={goingSet} onChanged={() => router.refresh()} />
      )}
      {tab === 'pétitions' && (
        <PetitionsPanel
          pétitions={props.pétitions}
          signatureCounts={props.signatureCounts}
          mySignedIds={new Set(props.mySignedIds)}
          canSign={props.canSignPetitions}
          onChanged={() => router.refresh()}
        />
      )}
      {tab === 'annonces' && (
        <ClassifiedsPanel classifieds={props.classifieds} onChanged={() => router.refresh()} />
      )}
    </main>
  );
}
