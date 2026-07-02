'use client';

export default function Browser(props: { listings: any[] }) {
  if (props.listings.length === 0) {
    return <p className="empty-state">Aucune annonce pour le moment.</p>;
  }

  return (
    <div className="market-grid">
      {props.listings.map((l) => {
        const firstImage = Array.isArray(l.images) && l.images.length > 0 ? l.images[0] : null;
        return (
          <div key={l.id} className="market-card">
            <div className="market-photo" style={firstImage ? { backgroundImage: 'url(' + firstImage + ')' } : undefined}>
              {l.boosted && <span className="boosted-badge">En avant</span>}
            </div>
            <div className="market-info">
              <div className="market-title">{l.title}</div>
              <div className="market-price">{l.price ? l.price + ' $' : 'Prix à discuter'}</div>
              <div className="market-seller">{l.sellerName}</div>
              <div className="market-tags">
                {l.categories?.name && <span className="market-tag">{l.categories.name}</span>}
                {l.condition && <span className="market-tag">{l.condition}</span>}
                {l.variants.length > 0 && <span className="market-tag">{l.variants.length} variantes</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
