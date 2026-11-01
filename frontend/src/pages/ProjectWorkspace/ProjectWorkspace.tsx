/*
 * ProjectWorkspace/ProjectWorkspace.tsx — The rocket laboratory
 *
 * Route: /projects/:projectId (protected)
 *
 * Shows a full project view with:
 * - Project header (name, description, status, star, links)
 * - Interactive SVG rocket diagram with 9 selectable departments
 * - Department side panel (opens on click)
 * - Lead vs member view (enforced by mock service)
 * - Invite panel placeholder
 *
 * All task data is labelled "SAMPLE DATA" until Milestone 4.
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/Button';
import { StatusBadge } from '@/components/StatusBadge';
import { StarBadge } from '@/components/StarBadge';
import { Avatar } from '@/components/Avatar';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { DevMockBanner } from '@/components/DevMockBanner';
import { projectService } from '@/services';
import { useAuth } from '@/context/AuthContext';
import type { Project, Department, DepartmentId, DepartmentStatus } from '@/types';
import styles from './ProjectWorkspace.module.css';

/* ── Department status labels and colors ───────────────────────────── */
const STATUS_LABEL: Record<DepartmentStatus, string> = {
  'not-assessed':     '○ Not Assessed',
  'needs-attention':  '⚠ Needs Attention',
  'in-progress':      '↻ In Progress',
  'verified-complete': '✓ Verified Complete',
};

const STATUS_CLASS: Record<DepartmentStatus, string> = {
  'not-assessed':      styles['dept-status--not-assessed'],
  'needs-attention':   styles['dept-status--needs-attention'],
  'in-progress':       styles['dept-status--in-progress'],
  'verified-complete': styles['dept-status--verified-complete'],
};

export function ProjectWorkspace() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [selectedDept, setSelectedDept] = useState<DepartmentId | null>(null);

  /* ── Load project ──────────────────────────────────────────────── */
  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    projectService
      .getProject(projectId)
      .then((p) => {
        if (!p) setNotFound(true);
        else setProject(p);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [projectId]);

  const isLead = project?.leadId === currentUser?.userId;
  const activeDept = selectedDept
    ? project?.departments.find((d) => d.id === selectedDept) ?? null
    : null;

  /* ── Not-found / No-access ─────────────────────────────────────── */
  if (!loading && notFound) {
    return (
      <div className={styles.page}>
        <DevMockBanner />
        <Navbar />
        <main className={`${styles.main} container`}>
          <div className={styles.notFound}>
            <span className={styles.notFoundIcon} aria-hidden="true">🔭</span>
            <h1 className={styles.notFoundTitle}>Rocket Not Found</h1>
            <p className={styles.notFoundText}>
              This project doesn't exist, or you don't have access to it.
              Only project members can view a workspace.
            </p>
            <Button onClick={() => navigate('/profile')}>Back to Profile</Button>
          </div>
        </main>
      </div>
    );
  }

  if (loading) return <LoadingState fullPage message="Loading rocket workspace…" />;
  if (error)  return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  if (!project) return null;

  return (
    <div className={styles.page}>
      <DevMockBanner />
      <Navbar />

      <main className={styles.main}>
        {/* ── Project Header ───────────────────────────────────────── */}
        <header className={styles.projectHeader}>
          <div className={`${styles.headerInner} container`}>
            <div className={styles.headerTop}>
              <button
                className={styles.backBtn}
                onClick={() => navigate('/profile')}
                aria-label="Back to Profile"
              >
                ← Back
              </button>
            </div>

            <div className={styles.headerMain}>
              <div className={styles.headerTitle}>
                <h1 className={styles.projectName}>{project.name}</h1>
                <StarBadge role={project.role} size={28} showLabel />
              </div>
              <p className={styles.projectDescription}>{project.description}</p>

              <div className={styles.headerMeta}>
                <StatusBadge status={project.status} />
                {project.discordUrl && (
                  <a
                    href={project.discordUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.metaLink}
                    aria-label="Discord server"
                  >
                    💬 Discord
                  </a>
                )}
                <a
                  href={project.githubRepoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.metaLink}
                  aria-label="GitHub repository"
                >
                  🐙 GitHub
                </a>
              </div>
            </div>

            <div className={styles.headerActions}>
              {isLead && (
                <Button variant="secondary" size="sm">
                  Edit Project
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* ── Members strip ───────────────────────────────────────── */}
        <section className={styles.membersStrip} aria-label="Project members">
          <div className="container">
            <div className={styles.membersRow}>
              <span className={styles.membersLabel}>
                {isLead ? 'All Members' : 'Your Department'}
              </span>
              <div className={styles.membersList}>
                {project.members.map((m) => (
                  <div key={m.userId} className={styles.memberChip} title={`@${m.username}`}>
                    <Avatar avatarId={m.avatarId} username={m.username} size="sm" />
                    <span className={styles.memberUsername}>@{m.username}</span>
                  </div>
                ))}
              </div>
              {isLead && (
                <span className={styles.invitePlaceholder} aria-label="Invite panel — coming in Milestone 5">
                  🔗 Invite Links (Milestone 5)
                </span>
              )}
            </div>
          </div>
        </section>

        {/* ── Main workspace: rocket + panel ──────────────────────── */}
        <div className={`${styles.workspace} container`}>
          {/* Rocket diagram */}
          <section
            className={styles.rocketSection}
            aria-label="Interactive rocket diagram — click a department to open it"
          >
            <h2 className={styles.rocketHeading}>Select a Department</h2>
            <p className={styles.rocketSub}>
              Click any section of the rocket to open its department panel.
            </p>
            <RocketDiagram
              departments={project.departments}
              selected={selectedDept}
              onSelect={setSelectedDept}
            />
          </section>

          {/* Department side panel */}
          <aside
            className={`${styles.sidePanel} ${activeDept ? styles['sidePanel--open'] : ''}`}
            aria-label={activeDept ? `${activeDept.displayName} department panel` : 'Department panel'}
          >
            {activeDept ? (
              <DeptPanel
                dept={activeDept}
                isLead={isLead}
                onClose={() => setSelectedDept(null)}
              />
            ) : (
              <div className={styles.panelEmpty}>
                <span className={styles.panelEmptyIcon} aria-hidden="true">🚀</span>
                <p className={styles.panelEmptyText}>
                  Select a department from the rocket to see its details.
                </p>
              </div>
            )}
          </aside>
        </div>

        {/* Lead-only: Invite panel placeholder */}
        {isLead && (
          <section className={`${styles.inviteSection} container`} aria-label="Invite management (placeholder)">
            <div className={styles.inviteCard}>
              <span className={styles.placeholderBadge}>Milestone 5 — Not Yet Built</span>
              <h3 className={styles.inviteTitle}>Invite & Access Management</h3>
              <p className={styles.inviteText}>
                Per-department invite links, join request approval, member
                management, and debarment controls will be available here in
                Milestone 5. Only the team lead sees this panel.
              </p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

/* ── Department side panel ─────────────────────────────────────────── */
function DeptPanel({
  dept,
  isLead,
  onClose,
}: {
  dept: Department;
  isLead: boolean;
  onClose: () => void;
}) {
  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <span className={styles.panelEmoji} aria-hidden="true">{dept.emoji}</span>
        <div>
          <h3 className={styles.panelTitle}>{dept.displayName}</h3>
          <span
            className={`${styles.deptStatus} ${STATUS_CLASS[dept.status]}`}
          >
            {STATUS_LABEL[dept.status]}
          </span>
        </div>
        <button
          className={styles.panelClose}
          onClick={onClose}
          aria-label="Close department panel"
        >
          ✕
        </button>
      </div>

      <p className={styles.panelPurpose}>{dept.purpose}</p>

      {/* Tasks */}
      <div className={styles.panelSection}>
        <div className={styles.sampleDataBadge} aria-label="Sample data">
          SAMPLE DATA — placeholder until Milestone 4
        </div>
        <h4 className={styles.panelSubheading}>Tasks</h4>
        {dept.tasks.length === 0 ? (
          <p className={styles.noTasks}>No tasks yet. Add some when the real data layer is ready.</p>
        ) : (
          <ul className={styles.taskList} role="list">
            {dept.tasks.map((t) => (
              <li key={t.taskId} className={`${styles.taskItem} ${t.done ? styles['taskItem--done'] : ''}`}>
                <span
                  className={styles.taskCheck}
                  aria-label={t.done ? 'Done' : 'Not done'}
                >
                  {t.done ? '✓' : '○'}
                </span>
                <span className={styles.taskTitle}>{t.title}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Members in this dept */}
      {dept.members.length > 0 && (
        <div className={styles.panelSection}>
          <h4 className={styles.panelSubheading}>
            {isLead ? 'Members in this department' : 'Your teammates'}
          </h4>
          <div className={styles.deptMembers}>
            {dept.members.map((m) => (
              <div key={m.userId} className={styles.deptMember}>
                <Avatar avatarId={m.avatarId} username={m.username} size="sm" />
                <span className={styles.deptMemberName}>@{m.username}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Rocket Diagram SVG ────────────────────────────────────────────── */
function RocketDiagram({
  departments,
  selected,
  onSelect,
}: {
  departments: Department[];
  selected: DepartmentId | null;
  onSelect: (id: DepartmentId) => void;
}) {
  // Map department IDs to vertical positions in the rocket SVG
  const deptLayout: { id: DepartmentId; label: string; emoji: string; y: number; height: number }[] = [
    { id: 'nose-cone',     label: 'Nose Cone',     emoji: '🔭', y: 0,    height: 80  },
    { id: 'payload',       label: 'Payload',       emoji: '📦', y: 80,   height: 60  },
    { id: 'avionics',      label: 'Avionics',      emoji: '⚡', y: 140,  height: 60  },
    { id: 'structure',     label: 'Structure',     emoji: '🏗️', y: 200,  height: 60  },
    { id: 'engine',        label: 'Engine',        emoji: '🔥', y: 260,  height: 60  },
    { id: 'navigation',    label: 'Navigation',    emoji: '🧭', y: 320,  height: 50  },
    { id: 'stabilization', label: 'Stabilization', emoji: '🛡️', y: 370,  height: 50  },
    { id: 'fuel-system',   label: 'Fuel System',   emoji: '⛽', y: 420,  height: 50  },
    { id: 'launch-system', label: 'Launch System', emoji: '🚀', y: 470,  height: 70  },
  ];

  const getStatusColor = (id: DepartmentId): string => {
    const dept = departments.find((d) => d.id === id);
    if (!dept) return 'var(--color-pewter)';
    switch (dept.status) {
      case 'verified-complete': return '#4CAF50';
      case 'in-progress':       return 'var(--color-rose)';
      case 'needs-attention':   return '#F5A623';
      case 'not-assessed':      return 'var(--color-pewter)';
      default: return 'var(--color-pewter)';
    }
  };

  return (
    <div className={styles.rocketDiagramWrap}>
      <svg
        viewBox="0 0 220 580"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.rocketSVG}
        role="img"
        aria-label="Rocket department diagram"
      >
        {deptLayout.map(({ id, label, emoji, y, height }) => {
          const isSelected = selected === id;
          const fillColor = getStatusColor(id);
          // Rocket body widths vary by section (wider in middle)
          const isWing = id === 'launch-system';
          const bodyX = isWing ? 30 : 50;
          const bodyW = isWing ? 160 : 120;

          return (
            <g
              key={id}
              role="button"
              tabIndex={0}
              aria-label={`${label} department — ${departments.find((d) => d.id === id)?.status ?? 'not assessed'}`}
              aria-pressed={isSelected}
              onClick={() => onSelect(id)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(id); }}
              style={{ cursor: 'pointer' }}
            >
              {/* Section background */}
              <rect
                x={bodyX}
                y={y + 2}
                width={bodyW}
                height={height - 4}
                fill={fillColor}
                opacity={isSelected ? 1 : 0.7}
                stroke="var(--color-black)"
                strokeWidth={isSelected ? 3 : 1.5}
                rx="4"
              />
              {/* Hover highlight */}
              {isSelected && (
                <rect
                  x={bodyX - 2}
                  y={y}
                  width={bodyW + 4}
                  height={height}
                  fill="none"
                  stroke="var(--color-black)"
                  strokeWidth="3"
                  rx="6"
                />
              )}
              {/* Label */}
              <text
                x="110"
                y={y + height / 2 + 5}
                textAnchor="middle"
                fontSize="11"
                fontFamily="'Alumni Sans', sans-serif"
                fontWeight="600"
                fill="var(--color-black)"
              >
                {emoji} {label}
              </text>
            </g>
          );
        })}

        {/* Nose cone at top */}
        <polygon
          points="110,4 50,80 170,80"
          fill="var(--color-ecru)"
          stroke="var(--color-black)"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Flame / exhaust at bottom */}
        <ellipse
          cx="110"
          cy="548"
          rx="25"
          ry="18"
          fill="var(--color-rose)"
          opacity="0.8"
          stroke="var(--color-black)"
          strokeWidth="1.5"
        />
        <ellipse
          cx="110"
          cy="562"
          rx="14"
          ry="10"
          fill="var(--color-ecru)"
          opacity="0.9"
        />
      </svg>

      {/* Status legend */}
      <div className={styles.rocketLegend} role="list" aria-label="Department status legend">
        {[
          { label: 'Verified Complete', color: '#4CAF50' },
          { label: 'In Progress',       color: 'var(--color-rose)' },
          { label: 'Needs Attention',   color: '#F5A623' },
          { label: 'Not Assessed',      color: 'var(--color-pewter)' },
        ].map(({ label, color }) => (
          <div key={label} className={styles.legendItem} role="listitem">
            <span
              className={styles.legendDot}
              style={{ backgroundColor: color }}
              aria-hidden="true"
            />
            <span className={styles.legendLabel}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
