import { useEffect, useRef, useState } from 'react';

/**
 * KamranMascot – uses the downloaded kamran-directions.webp + kamran-reactions.webp
 * sprite sheets directly, with our own pointer-tracking logic.
 * No external library dependency → no React version conflicts.
 *
 * Each sheet is a 3×3 grid (300% background-size).
 * Directions order: up-left, up, up-right, left, center, right, down-left, down, down-right
 * Reactions  order: blink, heart, sparkle, surprised, wink, bashful, sleepy, dizzy, delighted
 */

const DIRECTIONS = ['up-left', 'up', 'up-right', 'left', 'center', 'right', 'down-left', 'down', 'down-right'];
const REACTIONS  = ['blink', 'heart', 'sparkle', 'surprised', 'wink', 'bashful', 'sleepy', 'dizzy', 'delighted'];
const CLOCKWISE  = ['right', 'down-right', 'down', 'down-left', 'left', 'up-left', 'up', 'up-right'];
const SECTOR     = (Math.PI * 2) / CLOCKWISE.length;
const DEAD_ZONE  = 60;
const PAYOFFS    = ['heart', 'sparkle', 'delighted'];

function cellPos(index) {
  const x = (index % 3) * 50;
  const y = Math.floor(index / 3) * 50;
  return `${x}% ${y}%`;
}

export default function HeaderMascot() {
  const btnRef     = useRef(null);
  const [direction, setDirection] = useState('center');
  const [reaction,  setReaction]  = useState(null);
  const boopsRef   = useRef({ count: 0, at: 0 });
  const timersRef  = useRef([]);

  // ── pointer tracking ──────────────────────────────────────────────────────
  useEffect(() => {
    // Only run on devices with a fine pointer (mouse / trackpad)
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    let currentSector = -1;

    const aim = (px, py) => {
      const btn = btnRef.current;
      if (!btn) return;
      const box = btn.getBoundingClientRect();
      const dx  = px - (box.left + box.width  / 2);
      const dy  = py - (box.top  + box.height / 2);
      if (Math.hypot(dx, dy) < DEAD_ZONE) {
        currentSector = -1;
        setDirection('center');
        return;
      }
      const angle  = Math.atan2(dy, dx);
      const sector = (Math.round(angle / SECTOR) + CLOCKWISE.length) % CLOCKWISE.length;
      if (sector !== currentSector) {
        currentSector = sector;
        setDirection(CLOCKWISE[sector]);
      }
    };

    const onPointerMove = (e) => aim(e.clientX, e.clientY);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', onPointerMove);
  }, []);

  // ── click / boop ──────────────────────────────────────────────────────────
  const boop = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    const later = (ms, next) => {
      timersRef.current.push(setTimeout(() => setReaction(next), ms));
    };

    const now   = Date.now();
    const b     = boopsRef.current;
    b.count     = now - b.at < 1600 ? b.count + 1 : 1;
    b.at        = now;

    if (b.count >= 4) {
      b.count = 0;
      setReaction('dizzy');
      later(1100, null);
    } else {
      setReaction('blink');
      later(120, PAYOFFS[(b.count - 1) % PAYOFFS.length]);
      later(560, null);
    }
  };

  // cleanup timers on unmount
  useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

  const dirIdx = DIRECTIONS.indexOf(direction);
  const recIdx = reaction ? REACTIONS.indexOf(reaction) : -1;

  const sharedLayer = {
    position:           'absolute',
    inset:              0,
    backgroundSize:     '300% 300%',
    backgroundRepeat:   'no-repeat',
  };

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={boop}
      title="Boop me! 👆"
      aria-label="Boop the Kamran mascot"
      style={{
        position:    'relative',
        display:     'block',
        flexShrink:  0,
        width:       48,
        height:      48,
        padding:     0,
        border:      0,
        background:  'transparent',
        cursor:      'pointer',
        userSelect:  'none',
        transition:  'transform 0.15s ease',
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.12)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      {/* directions layer */}
      <span
        style={{
          ...sharedLayer,
          backgroundImage:    'url(/mascots/kamran-directions.webp)',
          backgroundPosition: cellPos(dirIdx >= 0 ? dirIdx : 4),
          opacity:            reaction ? 0 : 1,
          transition:         'opacity 0.05s',
        }}
      />
      {/* reactions layer */}
      <span
        style={{
          ...sharedLayer,
          backgroundImage:    'url(/mascots/kamran-reactions.webp)',
          backgroundPosition: cellPos(recIdx >= 0 ? recIdx : 0),
          opacity:            reaction ? 1 : 0,
          transition:         'opacity 0.05s',
        }}
      />
    </button>
  );
}
