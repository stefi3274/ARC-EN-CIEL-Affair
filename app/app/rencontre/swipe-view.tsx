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

export default function SwipeView(props: { profiles: Profile[]; onSwipe: (userId: string, liked: boolean) => void }) {
  const current = props.profiles[0];

  return (
    <div>
      <div className="swipe-stack">
        {current ? (
          <div className="swipe-card">
            <div
              className="swipe-photo"
              style={{ backgroundImage: 'url(' + (current.statusPhotoUrl || current.photoUrl || '') + ')' }}
            >
              {current.statusText && <span className="swipe-status">{current.statusText}</span>}
            </div>
            <div className="swipe-info">
              <div className="swipe-name">{current.age ? current.age + ' ans' : 'Profil'}</div>
              <p className="swipe-bio">{current.bio || 'Pas de bio'}</p>
              {current.talents && <p className="swipe-bio">Talent : {current.talents}</p>}
              {current.dreams && <p className="swipe-bio">Reve : {current.dreams}</p>}
              {current.goals && <p className="swipe-bio">Cherche : {current.goals}</p>}
            </div>
          </div>
        ) : (
          <p className="empty-state">Plus de profils pour l'instant.</p>
        )}
      </div>
      <div className="swipe-actions">
        <button type="button" className="btn-pass" onClick={() => current && props.onSwipe(current.userId, false)}>
          ✕
        </button>
        <button type="button" className="btn-like" onClick={() => current && props.onSwipe(current.userId, true)}>
          ♥
        </button>
      </div>
    </div>
  );
}
