import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import TopBar from '@/components/top-bar';
import MarketClient from './market-client';

export default async function MarketplacePage() {
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

  const { data: categories } = await supabase
    .schema('marketplace')
    .from('categories')
    .select('id, name, slug')
    .order('name');

  const { data: listings } = await supabase
    .schema('marketplace')
    .from('listings')
    .select('id, title, description, price, images, category_id, brand, origin, item_year, colors, condition, boosted, seller_id, created_at, categories(name)')
    .order('created_at', { ascending: false })
    .limit(40);

  const rows = listings ?? [];
  const listingIds = rows.map((l) => l.id);
  const sellerIds = Array.from(new Set(rows.map((l) => l.seller_id)));

  let sellerNames: Record<string, string> = {};
  if (sellerIds.length > 0) {
    const { data: sellers } = await supabase
      .schema('core')
      .from('profiles_public')
      .select('id, display_name')
      .in('id', sellerIds);
    sellerNames = Object.fromEntries((sellers ?? []).map((s) => [s.id, s.display_name]));
  }

  let variantsByListing: Record<string, any[]> = {};
  if (listingIds.length > 0) {
    const { data: variants } = await supabase
      .schema('marketplace')
      .from('listing_variants')
      .select('id, listing_id, size, color, stock, price_override')
      .in('listing_id', listingIds);

    (variants ?? []).forEach((v) => {
      if (!variantsByListing[v.listing_id]) variantsByListing[v.listing_id] = [];
      variantsByListing[v.listing_id].push(v);
    });
  }

  const enrichedListings = rows.map((l) => ({
    ...l,
    sellerName: sellerNames[l.seller_id] ?? 'Un membre',
    variants: variantsByListing[l.id] ?? [],
  }));

  const { data: myListingsRaw } = await supabase
    .schema('marketplace')
    .from('listings')
    .select('id, title, price, boosted, created_at')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false });

  const myListings = (myListingsRaw ?? []).map((l) => ({
    ...l,
    variants: variantsByListing[l.id] ?? [],
  }));

  return (
    <div className="feed-shell">
      <TopBar active="marketplace" />

      <MarketClient
        currentUserId={user.id}
        categories={categories ?? []}
        listings={enrichedListings}
        myListings={myListings}
      />
    </div>
  );
}
