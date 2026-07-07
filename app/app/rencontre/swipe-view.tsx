'use client';

import { useRef, useState } from 'react';

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

const SWIPE_THRESHOLD = 110;

export default function SwipeView(props: { profiles: Profile[]; onSwipe: (userId: string, liked: boolean) => void }) {
  const current = props.profiles[0];
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [exiting, setExiting] = useState<'like' | 'pass' | null>(null);
  const startX = useRef(0);

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!current || exiting) return;
    setDragging(true);
    startX.current = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    setDragX(e.clientX - startX.current);
  }

  function handlePointerUp() {
    if (!dragging) return;
    setDragging(false);
    if (dragX > SWIPE_THRESHOLD) {
      triggerExit('like');
    } else if (dragX < -SWIPE_THRESHOLD) {
      triggerExit('pass');
    } else {
      setDragX(0);
    }
  }

  function triggerExit(direction: 'like' | 'pass') {
    if (!current) return;
    setExiting(direction);
    setTimeout(() => {
      props.onSwipe(current.userId, direction === 'like');
      setExiting(null);
      setDragX(0);
    }, 220);
  }

  const rotation = dragX / 18;
  const likeOpacity = exiting === 'like' ? 1 : Math.min(Math.max(dragX / SWIPE_THRESHOLD, 0), 1);
  const passOpacity = exiting === 'pass' ? 1 : Math.min(Math.max(-dragX / SWIPE_THRESHOLD, 0), 1);

  const transform =
    exiting === 'like'
      ? 'translate(160%, -15%) rotate(28deg)'
      : exiting === 'pass'
      ? 'translate(-160%, -15%) rotate(-28deg)'
      : 'translate(' + dragX + 'px, 0) rotate(' + rotation + 'deg)';

  return (
    <div>
      <div className="swipe-stack">
        {current ? (
          <div
            className="swipe-card"
            style={{
              transform,
              transition: dragging ? 'none' : 'transform .25s ease',
              cursor: dragging ? 'grabbing' : 'grab',
              touchAction: 'none',
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <div
              className="swipe-photo"
              style={{ backgroundImage: 'url(' + (current.statusPhotoUrl || current.photoUrl || '') + ')' }}
            >
              {current.statusText && <span className="swipe-status">{current.statusText}</span>}
              <span className="swipe-stamp swipe-stamp-like" style={{ opacity: likeOpacity }}>Aime</span>
              <span className="swipe-stamp swipe-stamp-pass" style={{ opacity: passOpacity }}>Passe</span>
            </div>
            <div className="swipe-info">
              <div className="swipe-name">{current.age ? current.age + ' ans' : 'Profil'}</div>
              <p className="swipe-bio">{current.bio || 'Pas de bio'}</p>
              {current.talents && <p className="swipe-bio">Talent : {current.talents}</p>}
              {current.dreams && <p className="swipe-bio">Rêve : {current.dreams}</p>}
              {current.goals && <p className="swipe-bio">Cherche : {current.goals}</p>}
            </div>
          </div>
        ) : (
          <p className="empty-state">Plus de profils pour l'instant.</p>
        )}
      </div>

      {current && <p className="swipe-hint">Glisse la carte à droite ou à gauche — ou utilise les boutons</p>}

      <div className="swipe-actions">
        <button type="button" className="btn-pass" onClick={() => triggerExit('pass')} disabled={!current}>
          ✕
        </button>
        <button type="button" className="btn-like" onClick={() => triggerExit('like')} disabled={!current}>
          ♥
        </button>
      </div>
    </div>
  );
}
