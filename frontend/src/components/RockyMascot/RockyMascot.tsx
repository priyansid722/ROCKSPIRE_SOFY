/*
 * RockyMascot/RockyMascot.tsx — Rocky, the Rockspire AI assistant
 *
 * This is the Rocky.ai character mascot. It is NOT the brand logo.
 * Do NOT use this in the Navbar or ROCKSPIRE/SOFY brand lockup.
 *
 * Placement:
 *   - "Analyse with Rocky.ai" section on New Project page
 *   - Rocky.ai teaser section on the Landing page
 *   - Empty-state / help areas where a friendly guide makes sense
 *
 * The Rocky.ai feature is NOT yet built. Always keep the
 * "Coming later" label next to Rocky when adjacent to AI features.
 *
 * Props:
 *   size: "xs" | "sm" | "md" | "lg" | "xl"
 *   animate: boolean  — gentle floating animation (respects prefers-reduced-motion)
 *   className: string
 */

import rockySrc from '@/assets/rocky-ai.png';
import styles from './RockyMascot.module.css';

interface RockyMascotProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
  className?: string;
}

export function RockyMascot({
  size = 'md',
  animate = false,
  className,
}: RockyMascotProps) {
  return (
    <img
      src={rockySrc}
      alt="Rocky, the Rockspire AI assistant"
      className={[
        styles.rocky,
        styles[`rocky--${size}`],
        animate ? styles['rocky--floating'] : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      draggable={false}
    />
  );
}
