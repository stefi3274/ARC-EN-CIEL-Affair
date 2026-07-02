'use client';

type Profile = {
  userId: string;
  bio: string | null;
  age: number | null;
  photoUrl: string | null;
  statusText: string | null;
};

export default function GridView(props: { profiles: Profile[]; onSwipe: (userId: string, liked: boolean) => void }) {
  if (props.profiles.length === 0) {
    return <p className="empty-state">Plus personne à découvrir pour le moment. Reviens plus tard.</p>;
  }

  return (
    <div className="profile-grid">
      {props.profiles.map((p) => (
        <div key={p.userId} className="profile-tile">
          <div
            className="tile-photo"
            style={p.photoUrl ? { backgroundImage: 'url(' + p.photoUrl + ')' } : undefined}
          >
            {p.statusText && <span className="status-dot"></span>}
          </div>
          <div className="tile-info">
            <div className="tile-name">{p.age ? p.age + ' ans' : 'Profil'}</div>
            <div className="tile-bio">{p.bio || 'Pas de bio'}</div>
          </div>
          <div style={{ display: 'flex', gap: 6, padding: '0 10px 10px' }}>
            <button
              type="button"
              onClick={() => props.onSwipe(p.userId, false)}
              style={{ flex: 1, padding: '8px', fontSize: '0.78rem', background: 'var(--ink)', color: 'var(--ivory-dim)', border: '1px solid var(--line)' }}
            >
              Passer
            </button>
            <button
              type="button"
              onClick={() => props.onSwipe(p.userId, true)}
              style={{ flex: 1, padding: '8px', fontSize: '0.78rem', background: 'var(--rose)', color: '#fff' }}
            >
              Aimer
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
