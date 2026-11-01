/*
 * StatusBadge — shows project status
 * Uses Alumni Sans font, small, uppercase.
 * planning: ecru bg, black text
 * ongoing: rose bg, black text
 * completed: pewter bg, black text
 */
import type { ProjectStatus } from '@/types';
import styles from './StatusBadge.module.css';

const STATUS_LABELS: Record<ProjectStatus, string> = {
  planning: 'Planning',
  ongoing: 'Ongoing',
  completed: 'Completed',
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span className={[styles.badge, styles[`badge--${status}`]].join(' ')}>
      {STATUS_LABELS[status]}
    </span>
  );
}
