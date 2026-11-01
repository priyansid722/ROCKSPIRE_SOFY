/*
 * RocketIllustration/RocketIllustration.tsx
 *
 * A self-contained SVG rocket illustration using only the five palette colours:
 *   cream  #FDFBD4 | rose  #DEA193 | black #000000 | ecru  #E0CD95 | pewter #909EAE
 *
 * Parts visible from top to bottom:
 *   Nose Cone → Payload (round windows) → Avionics Band →
 *   Body (panel lines + rivets) → Fins (×2) → Engine Nozzle + Flame
 *
 * Technical-diagram style: 2px black outlines, thin dashed construction lines.
 * Callout labels (Courier Prime) for Nose Cone, Payload, Avionics, Engine.
 * Labels are hidden on screens < 480px via the .callout class.
 *
 * Animation (scroll-triggered): the rocket gently floats up.
 * prefers-reduced-motion: disables all animation.
 *
 * Props:
 *   size:  'sm' | 'md' | 'lg'   (controls SVG height: 200 | 320 | 480)
 *   animated: boolean             (whether to apply float animation, default true)
 *   className?: string
 */

import styles from './RocketIllustration.module.css';

interface RocketIllustrationProps {
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

export function RocketIllustration({
  size = 'md',
  animated = true,
  className,
}: RocketIllustrationProps) {
  const heights = { sm: 200, md: 320, lg: 480 };
  const h = heights[size];

  return (
    <div
      className={[
        styles.wrapper,
        animated ? styles['wrapper--animated'] : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label="Technical diagram of a rocket"
      role="img"
    >
      {/* ── The SVG viewBox is fixed at 160×320 — we scale it via CSS ── */}
      <svg
        viewBox="0 0 160 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.svg}
        style={{ height: h, width: 'auto' }}
        aria-hidden="true"
      >
        {/* ── Construction / centre-line (dashed) ────────────────────── */}
        <line
          x1="80" y1="10" x2="80" y2="300"
          stroke="#000000" strokeWidth="0.5"
          strokeDasharray="4 4" opacity="0.25"
        />
        {/* horizontal construction lines */}
        <line x1="20" y1="72"  x2="140" y2="72"  stroke="#000000" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.2"/>
        <line x1="20" y1="110" x2="140" y2="110" stroke="#000000" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.2"/>
        <line x1="20" y1="132" x2="140" y2="132" stroke="#000000" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.2"/>
        <line x1="20" y1="228" x2="140" y2="228" stroke="#000000" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.2"/>

        {/* ════════════════════════════════════════════
            NOSE CONE  (y 10–72)
            ════════════════════════════════════════════ */}
        {/* Main cone shape */}
        <path
          d="M80 10 L114 72 L46 72 Z"
          fill="#E0CD95"
          stroke="#000000"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Inner highlight */}
        <path
          d="M80 28 L108 70 L52 70 Z"
          fill="#FDFBD4"
          opacity="0.45"
        />
        {/* Tip rivet */}
        <circle cx="80" cy="12" r="2.5" fill="#000000"/>

        {/* ════════════════════════════════════════════
            PAYLOAD  (y 72–110)  — two round windows
            ════════════════════════════════════════════ */}
        <rect x="46" y="72" width="68" height="38" rx="0"
          fill="#E0CD95" stroke="#000000" strokeWidth="2"/>
        {/* Panel seam */}
        <line x1="46" y1="91" x2="114" y2="91" stroke="#000000" strokeWidth="0.75"/>
        {/* Windows */}
        <circle cx="66" cy="91" r="10" fill="#FDFBD4" stroke="#000000" strokeWidth="1.5"/>
        <circle cx="66" cy="91" r="6"  fill="#DEA193" opacity="0.6"/>
        <circle cx="94" cy="91" r="10" fill="#FDFBD4" stroke="#000000" strokeWidth="1.5"/>
        <circle cx="94" cy="91" r="6"  fill="#DEA193" opacity="0.6"/>
        {/* Window glare */}
        <circle cx="62" cy="87" r="2.5" fill="#FDFBD4" opacity="0.7"/>
        <circle cx="90" cy="87" r="2.5" fill="#FDFBD4" opacity="0.7"/>

        {/* ════════════════════════════════════════════
            AVIONICS BAND  (y 110–132)
            ════════════════════════════════════════════ */}
        <rect x="46" y="110" width="68" height="22" rx="0"
          fill="#909EAE" stroke="#000000" strokeWidth="2"/>
        {/* Circuit-board detail lines */}
        <line x1="54" y1="117" x2="72" y2="117" stroke="#FDFBD4" strokeWidth="0.8" opacity="0.7"/>
        <line x1="76" y1="117" x2="88" y2="117" stroke="#FDFBD4" strokeWidth="0.8" opacity="0.7"/>
        <line x1="92" y1="117" x2="106" y2="117" stroke="#FDFBD4" strokeWidth="0.8" opacity="0.7"/>
        <line x1="54" y1="125" x2="106" y2="125" stroke="#FDFBD4" strokeWidth="0.8" opacity="0.4"/>
        {/* Indicator dots */}
        <circle cx="60" cy="121" r="2" fill="#DEA193"/>
        <circle cx="69" cy="121" r="2" fill="#FDFBD4" opacity="0.8"/>
        <circle cx="78" cy="121" r="2" fill="#DEA193"/>
        <circle cx="87" cy="121" r="2" fill="#FDFBD4" opacity="0.8"/>
        <circle cx="96" cy="121" r="2" fill="#DEA193"/>
        <circle cx="105" cy="121" r="2" fill="#FDFBD4" opacity="0.8"/>

        {/* ════════════════════════════════════════════
            BODY  (y 132–228)  — panel lines + rivets
            ════════════════════════════════════════════ */}
        <rect x="46" y="132" width="68" height="96" rx="0"
          fill="#FDFBD4" stroke="#000000" strokeWidth="2"/>
        {/* Vertical panel lines */}
        <line x1="63" y1="132" x2="63" y2="228" stroke="#000000" strokeWidth="0.75" opacity="0.35"/>
        <line x1="80" y1="132" x2="80" y2="228" stroke="#000000" strokeWidth="0.75" opacity="0.35"/>
        <line x1="97" y1="132" x2="97" y2="228" stroke="#000000" strokeWidth="0.75" opacity="0.35"/>
        {/* Horizontal panel seams */}
        <line x1="46" y1="162" x2="114" y2="162" stroke="#000000" strokeWidth="0.75" opacity="0.35"/>
        <line x1="46" y1="196" x2="114" y2="196" stroke="#000000" strokeWidth="0.75" opacity="0.35"/>
        {/* Rivets — corners of each panel */}
        {[148, 177, 211].map((y) =>
          [52, 108].map((x) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="2" fill="#000000" opacity="0.4"/>
          ))
        )}
        {/* Fuel gauge window on body */}
        <rect x="70" y="152" width="20" height="36" rx="4"
          fill="#E0CD95" stroke="#000000" strokeWidth="1.5"/>
        <rect x="73" y="170" width="14" height="15" rx="2"
          fill="#DEA193" opacity="0.75"/>

        {/* ════════════════════════════════════════════
            FINS  (left and right, y 196–248)
            ════════════════════════════════════════════ */}
        {/* Left fin */}
        <path
          d="M46 196 L20 248 L46 228 Z"
          fill="#E0CD95" stroke="#000000" strokeWidth="2" strokeLinejoin="round"
        />
        {/* Right fin */}
        <path
          d="M114 196 L140 248 L114 228 Z"
          fill="#E0CD95" stroke="#000000" strokeWidth="2" strokeLinejoin="round"
        />

        {/* ════════════════════════════════════════════
            ENGINE NOZZLE  (y 228–256)
            ════════════════════════════════════════════ */}
        {/* Nozzle skirt */}
        <path
          d="M54 228 L42 256 L118 256 L106 228 Z"
          fill="#909EAE" stroke="#000000" strokeWidth="2" strokeLinejoin="round"
        />
        {/* Nozzle interior */}
        <ellipse cx="80" cy="255" rx="18" ry="5"
          fill="#000000" opacity="0.55"/>

        {/* ════════════════════════════════════════════
            FLAME  (y 256–305)
            ════════════════════════════════════════════ */}
        {/* Outer flame — ecru */}
        <path
          d="M62 256 Q70 295 80 305 Q90 295 98 256 Z"
          fill="#E0CD95" opacity="0.85"
        />
        {/* Inner flame — rose */}
        <path
          d="M68 256 Q75 285 80 298 Q85 285 92 256 Z"
          fill="#DEA193" opacity="0.9"
        />
        {/* Core — cream */}
        <path
          d="M73 256 Q78 278 80 288 Q82 278 87 256 Z"
          fill="#FDFBD4" opacity="0.95"
        />

        {/* ════════════════════════════════════════════
            CALLOUT LEADERS  (horizontal tick lines)
            ════════════════════════════════════════════ */}
        {/* Nose Cone leader */}
        <line x1="114" y1="40"  x2="130" y2="40"  stroke="#000000" strokeWidth="0.75" opacity="0.5"/>
        {/* Payload leader */}
        <line x1="114" y1="91"  x2="130" y2="91"  stroke="#000000" strokeWidth="0.75" opacity="0.5"/>
        {/* Avionics leader */}
        <line x1="114" y1="121" x2="130" y2="121" stroke="#000000" strokeWidth="0.75" opacity="0.5"/>
        {/* Engine leader */}
        <line x1="114" y1="240" x2="130" y2="240" stroke="#000000" strokeWidth="0.75" opacity="0.5"/>
      </svg>

      {/* ── Callout labels (hidden on phones < 480px) ────────────────── */}
      <div className={styles.callouts} aria-hidden="true">
        <span className={styles.callout} style={{ top: '12.5%' }}>
          NOSE CONE: docs &amp; vision
        </span>
        <span className={styles.callout} style={{ top: '28.4%' }}>
          PAYLOAD: core features
        </span>
        <span className={styles.callout} style={{ top: '37.8%' }}>
          AVIONICS: logic &amp; integrations
        </span>
        <span className={styles.callout} style={{ top: '75%' }}>
          ENGINE: backend
        </span>
      </div>
    </div>
  );
}
