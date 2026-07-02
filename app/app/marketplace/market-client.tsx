'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TabBar from '@/components/tab-bar';
import Browser from './browser';
import SellForm from './sell-form';
import MyListings from './my-listings';

type Props = {
  currentUserId: string;
  categories: any[];
  listings: any[];
  myListings: any[];
};

export default function MarketClient(props: Props) {
  const router = useRouter();
  const [tab, setTab] = useState('parcourir');

  return (
    <main className="market-main">
      <TabBar
        wrapperClass="market-tabs"
        active={tab}
        onChange={setTab}
        tabs={[
          { key: 'parcourir', label: 'Parcourir' },
          { key: 'vendre', label: 'Vendre' },
          { key: 'annonces', label: 'Mes annonces' },
        ]}
      />

      {tab === 'parcourir' && <Browser listings={props.listings} />}
      {tab === 'vendre' && (
        <SellForm
          categories={props.categories}
          onCreated={() => {
            router.refresh();
            setTab('annonces');
          }}
        />
      )}
      {tab === 'annonces' && <MyListings myListings={props.myListings} onChanged={() => router.refresh()} />}
    </main>
  );
}
