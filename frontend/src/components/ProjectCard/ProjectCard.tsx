/*
 * ProjectCard — summary card shown in the profile dashboard grid
 * Shows: rocket name, star badge (role), short description, status badge, last-worked-on.
 * Clicking navigates to /projects/:projectId.
 */
import { useNavigate } from 'react-router-dom';
import type { ProjectSummary } from '@/types';
import { StarBadge } from '@/components/StarBadge';
import { StatusBadge } from '@/components/StatusBadge';
import styles from './ProjectCard.module.css';

function formatRelative(iso: string): string {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const days = Math.floor(diffMs / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

interface ProjectCardProps {
  project: ProjectSummary;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const navigate = useNavigate();
  return (
    <article
      className={styles.card}
      onClick={() => navigate(`/projects/${project.projectId}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(`/projects/${project.projectId}`);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Open project ${project.name}`}
    >
      <header className={styles.header}>
        <span className={styles.name}>{project.name}</span>
        <StarBadge role={project.role} size={20} />
      </header>
      <p className={styles.description}>{project.description}</p>
      <footer className={styles.footer}>
        <StatusBadge status={project.status} />
        <span className={styles.meta}>Last worked on: {formatRelative(project.lastWorkedOn)}</span>
      </footer>
    </article>
  );
}
