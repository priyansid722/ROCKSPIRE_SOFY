/*
 * Profile Dashboard
 * Route: /profile (protected)
 * - Navbar
 * - Avatar + Full Name + Username + bio
 * - Edit Profile button (→ /profile/edit)
 * - New Project button (→ /projects/new)
 * - Star Legend: gold=Team lead, silver=Team member, glitter=Solo project
 * - Status filter tabs: All | Planning | Ongoing | Completed
 * - ProjectCard grid
 * - EmptyState if no projects in filtered set
 * - LoadingState while fetching
 * - ErrorState on failure
 * - DevMockBanner
 */

import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { StarBadge } from '@/components/StarBadge';
import { ProjectCard } from '@/components/ProjectCard';
import { EmptyState } from '@/components/EmptyState';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { DevMockBanner } from '@/components/DevMockBanner';
import { profileService, projectService } from '@/services';
import type { Profile as ProfileType, ProjectSummary, ProjectStatus } from '@/types';
import styles from './Profile.module.css';

type FilterTab = 'all' | ProjectStatus;

export function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTab>('all');

  const loadData = useCallback(() => {
    let mounted = true;
    Promise.all([profileService.getMyProfile(), projectService.listMyProjects()])
      .then(([profileData, projectData]) => {
        if (!mounted) return;
        setProfile(profileData);
        setProjects(projectData);
        setLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load profile.');
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    return loadData();
  }, [loadData]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    loadData();
  };

  const filteredProjects = projects.filter((p) => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  return (
    <div className={styles.page}>
      <DevMockBanner />
      <Navbar />

      {loading && <LoadingState message="Loading your rocket hangar…" fullPage />}

      {!loading && error && (
        <main className={styles.contentWrap}>
          <ErrorState message={error} onRetry={handleRetry} />
        </main>
      )}

      {!loading && !error && profile && (
        <main>
          {/* ── Profile Header ────────────────────────────────────────── */}
          <header className={styles.header}>
            <div className={styles.headerInner}>
              <div className={styles.userInfo}>
                <Avatar
                  avatarId={profile.avatarId}
                  username={profile.username}
                  size="lg"
                  className={styles.userAvatar}
                />
                <div className={styles.userDetails}>
                  <h1 className={styles.fullName}>{profile.fullName}</h1>
                  <p className={styles.username}>@{profile.username}</p>
                  {profile.bio && <p className={styles.bio}>{profile.bio}</p>}
                </div>
              </div>

              <div className={styles.actions}>
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => navigate('/profile/edit')}
                  aria-label="Edit your profile"
                >
                  Edit Profile
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate('/projects/new')}
                  aria-label="Launch a new rocket"
                >
                  New Rocket
                </Button>
              </div>
            </div>
          </header>

          {/* ── Main Content / Project Grid ───────────────────────────── */}
          <section className={styles.section} aria-label="Projects collection">
            <div className={styles.sectionHeader}>
              {/* Status Filter Tabs */}
              <div className={styles.tabs} role="tablist" aria-label="Filter rockets by status">
                {(['all', 'planning', 'ongoing', 'completed'] as const).map((tab) => {
                  const label =
                    tab === 'all'
                      ? `All (${projects.length})`
                      : tab.charAt(0).toUpperCase() + tab.slice(1);
                  return (
                    <button
                      key={tab}
                      type="button"
                      role="tab"
                      aria-selected={filter === tab}
                      className={[
                        styles.tabButton,
                        filter === tab ? styles['tabButton--active'] : '',
                      ].join(' ')}
                      onClick={() => setFilter(tab)}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Star Legend */}
              <div className={styles.legend} aria-label="Star badge role legend">
                <span className={styles.legendItem}>
                  <StarBadge role="lead" size={16} />
                  <span>Team lead</span>
                </span>
                <span className={styles.legendItem}>
                  <StarBadge role="member" size={16} />
                  <span>Team member</span>
                </span>
                <span className={styles.legendItem}>
                  <StarBadge role="solo" size={16} />
                  <span>Solo project</span>
                </span>
              </div>
            </div>

            {/* Project Grid / Empty State */}
            {filteredProjects.length === 0 ? (
              <div className={styles.emptyWrap}>
                <EmptyState
                  title={filter === 'all' ? 'No rockets yet' : `No ${filter} rockets`}
                  description={
                    filter === 'all'
                      ? 'No rockets yet. Launch your first one!'
                      : `You don't have any rockets in ${filter} status.`
                  }
                  action={
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => navigate('/projects/new')}
                    >
                      Launch a Rocket
                    </Button>
                  }
                />
              </div>
            ) : (
              <div className={styles.grid}>
                {filteredProjects.map((project) => (
                  <ProjectCard key={project.projectId} project={project} />
                ))}
              </div>
            )}
          </section>
        </main>
      )}
    </div>
  );
}
