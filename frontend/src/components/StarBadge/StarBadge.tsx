/*
 * StarBadge — shows project role as a star
 * gold: team lead
 * silver: team member (forked repo)
 * glitter: solo project (glitter-pink, sparkle animation)
 *
 * ALWAYS has:
 *   - 1.5px black outline (SVG stroke)
 *   - Accessible text label/tooltip
 *   - Sparkle animation on glitter (disabled under prefers-reduced-motion)
 */
import type { ProjectRole } from '@/types';
import styles from './StarBadge.module.css';

const ROLE_LABELS: Record<ProjectRole, string> = {
  lead: 'Team lead',
  member: 'Team member',
  solo: 'Solo project',
};

const STAR_COLORS: Record<ProjectRole, string> = {
  lead: 'var(--star-gold)',
  member: 'var(--star-silver)',
  solo: 'var(--star-glitter)',
};

interface StarBadgeProps {
  role: ProjectRole;
  size?: number; // px, default 22
  showLabel?: boolean;
}

export function StarBadge({ role, size = 22, showLabel = false }: StarBadgeProps) {
  const label = ROLE_LABELS[role];
  return (
    <span className={[styles.wrapper, role === 'solo' ? styles['wrapper--glitter'] : ''].join(' ')} title={label}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={STAR_COLORS[role]}
        stroke="var(--color-black)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        aria-hidden="true"
        className={styles.star}
      >
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
      </svg>
      <span className="visually-hidden">{label}</span>
      {showLabel && <span className={styles.label}>{label}</span>}
    </span>
  );
}
