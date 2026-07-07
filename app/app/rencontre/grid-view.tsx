'use client';

type Profile = {
  userId: string;
  bio: string | null;
  age: number | null;
  photoUrl: string | null;
  statusText: string | null;
  statusPhotoUrl: string | null;
  talents: string | null;
  dreams: string | null;
  goals: string | null;
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
            style={{ backgroundImage: 'url(' + (p.statusPhotoUrl || p.photoUrl || '') + ')' }}
          >
            {(p.statusText || p.statusPhotoUrl) && <span className="status-dot"></span>}

            <div className="tile-info">
              <div className="tile-name">{p.age ? p.age + ' ans' : 'Profil'}</div>
              <div className="tile-bio">{p.bio || 'Pas de bio'}</div>
              {p.talents && <div className="tile-tag">Talent : {p.talents}</div>}
              {p.goals && <div className="tile-tag">Cherche : {p.goals}</div>}
            </div>
          </div>

          <div className="tile-actions">
            <button type="button" className="tile-btn-pass" onClick={() => props.onSwipe(p.userId, false)} aria-label="Passer">
              ✕
            </button>
            <button type="button" className="tile-btn-like" onClick={() => props.onSwipe(p.userId, true)} aria-label="Aimer">
              ♥
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
