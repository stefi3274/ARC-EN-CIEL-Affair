'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TabBar from '@/components/tab-bar';
import EventsPanel from './events-panel';
import PetitionsPanel from './petitions-panel';
import ClassifiedsPanel from './classifieds-panel';
import JournalPanel from './journal-panel';

type Props = {
  currentUserId: string;
  canSignPetitions: boolean;
  events: any[];
  myRsvps: any[];
  petitions: any[];
  signatureCounts: Record<string, number>;
  mySignedIds: string[];
  classifieds: any[];
};

export default function AgendaClient(props: Props) {
  const router = useRouter();
  const [tab, setTab] = useState('evenements');
  const goingSet = new Set(props.myRsvps.filter((r) => r.status === 'going').map((r) => r.event_id));

  return (
    <main className="agenda-main">
      <div className="agenda-pride-banner"></div>
      <TabBar
        wrapperClass="agenda-tabs"
        active={tab}
        onChange={setTab}
        tabs={[
          { key: 'evenements', label: 'Événements' },
          { key: 'petitions', label: 'Pétitions' },
          { key: 'annonces', label: 'Annonces' },
          { key: 'journal', label: 'Journal' },
        ]}
      />

      {tab === 'evenements' && (
        <EventsPanel events={props.events} goingSet={goingSet} onChanged={() => router.refresh()} />
      )}
      {tab === 'petitions' && (
        <PetitionsPanel
          petitions={props.petitions}
          signatureCounts={props.signatureCounts}
          mySignedIds={new Set(props.mySignedIds)}
          canSign={props.canSignPetitions}
          onChanged={() => router.refresh()}
        />
      )}
      {tab === 'annonces' && (
        <ClassifiedsPanel classifieds={props.classifieds} onChanged={() => router.refresh()} />
      )}
      {tab === 'journal' && <JournalPanel />}
    </main>
  );
}
