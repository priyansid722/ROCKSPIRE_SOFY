/*
 * New Project page
 * Route: /projects/new (protected)
 * - Navbar
 * - Heading: "Launch a New Rocket"
 * - FormField: Project Name (required)
 * - FormField: Description (textarea, required)
 * - FormField: Project Lead Username (readonly, defaults to currentUser.username)
 * - Toggle: Solo / In Team (radio-style, affects star badge preview)
 * - FormField: Discord Server URL (optional)
 * - FormField: GitHub Repository URL (required, validated: must match github.com/owner/repo pattern)
 * - Status select: Planning | Ongoing | Completed (default: planning)
 * - Rocky.ai section:
 *   - RockyMascot (size sm)
 *   - "Analyse with Rocky.ai" toggle (disabled, visually clear)
 *   - "Coming Later" badge
 *   - Note: "Rocky.ai is not yet active. No AI analysis will be performed."
 * - Create Rocket button (loading state)
 * - Cancel button → /profile
 * - Error display
 * - DevMockBanner
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/Button';
import { FormField } from '@/components/FormField';
import { StarBadge } from '@/components/StarBadge';
import { RockyMascot } from '@/components/RockyMascot';
import { DevMockBanner } from '@/components/DevMockBanner';
import { useAuth } from '@/context/AuthContext';
import { projectService } from '@/services';
import type { ProjectStatus } from '@/types';
import styles from './NewProject.module.css';

const GITHUB_REPO_REGEX = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/;

export function NewProject() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [memberType, setMemberType] = useState<'solo' | 'team'>('solo');
  const [discordUrl, setDiscordUrl] = useState('');
  const [githubRepoUrl, setGithubRepoUrl] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('planning');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Project name is required.';
    }

    if (!description.trim()) {
      newErrors.description = 'Project description is required.';
    }

    if (!githubRepoUrl.trim()) {
      newErrors.githubRepoUrl = 'GitHub repository URL is required.';
    } else if (!GITHUB_REPO_REGEX.test(githubRepoUrl.trim())) {
      newErrors.githubRepoUrl =
        'Must be a valid GitHub repo URL (e.g. https://github.com/owner/repository).';
    }

    if (discordUrl.trim() && !discordUrl.trim().startsWith('https://')) {
      newErrors.discordUrl = 'Discord URL must start with https://';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validate()) return;

    setIsLoading(true);
    try {
      const project = await projectService.createProject({
        name: name.trim(),
        description: description.trim(),
        status,
        discordUrl: discordUrl.trim() || undefined,
        githubRepoUrl: githubRepoUrl.trim(),
        memberType,
        analyseWithRocky: false,
      });

      navigate(`/projects/${project.projectId}`);
    } catch (err: unknown) {
      setGeneralError(err instanceof Error ? err.message : 'Failed to create project.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <DevMockBanner />
      <Navbar />

      <main className={styles.container}>
        <div className={styles.content}>
          <header className={styles.header}>
            <h1 className={styles.title}>Launch a New Rocket</h1>
            <p className={styles.subtitle}>
              Assemble the blueprints, configure departments, and ready the launchpad.
            </p>
          </header>

          {generalError && (
            <div className={styles.errorAlert} role="alert">
              <span aria-hidden="true">⚠️</span> {generalError}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            {/* ── Project Name ─────────────────────────────────────────── */}
            <FormField
              id="proj-name"
              label="Rocket Name *"
              error={errors.name}
              inputProps={{
                type: 'text',
                value: name,
                onChange: (e) => setName(e.target.value),
                placeholder: 'e.g. Project Helios',
                required: true,
                disabled: isLoading,
              }}
            />

            {/* ── Description ──────────────────────────────────────────── */}
            <FormField
              id="proj-description"
              label="Mission Description *"
              as="textarea"
              error={errors.description}
              hint="Summarize the core payload, objective, and mission scope."
              inputProps={{
                value: description,
                onChange: (e) => setDescription(e.target.value),
                rows: 3,
                placeholder: 'A real-time telemetry observation cockpit for autonomous lunar landers…',
                required: true,
                disabled: isLoading,
              }}
            />

            {/* ── Project Lead (Readonly) ──────────────────────────────── */}
            <div className={styles.readonlyField}>
              <FormField
                id="proj-lead"
                label="Mission Commander (Project Lead)"
                hint="You will be registered as the primary lead for this rocket."
                inputProps={{
                  type: 'text',
                  value: currentUser ? `@${currentUser.username}` : 'Current User',
                  readOnly: true,
                  disabled: true,
                }}
              />
            </div>

            {/* ── Member Type Toggle (Solo / In Team) ──────────────────── */}
            <fieldset className={styles.memberTypeSection}>
              <legend className={styles.sectionLabel}>Mission Crew Structure *</legend>
              <div className={styles.crewToggleWrapper}>
                <div className={styles.toggleButtonGroup} role="radiogroup" aria-label="Crew structure">
                  <button
                    type="button"
                    role="radio"
                    aria-checked={memberType === 'solo'}
                    className={[
                      styles.toggleBtn,
                      memberType === 'solo' ? styles['toggleBtn--selected'] : '',
                    ].join(' ')}
                    onClick={() => setMemberType('solo')}
                  >
                    Solo Flight
                  </button>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={memberType === 'team'}
                    className={[
                      styles.toggleBtn,
                      memberType === 'team' ? styles['toggleBtn--selected'] : '',
                    ].join(' ')}
                    onClick={() => setMemberType('team')}
                  >
                    In Team
                  </button>
                </div>

                {/* Star Badge Preview */}
                <div className={styles.starPreview}>
                  <span className={styles.starPreviewLabel}>Star Preview:</span>
                  <StarBadge role={memberType === 'solo' ? 'solo' : 'lead'} size={24} showLabel />
                </div>
              </div>
            </fieldset>

            {/* ── GitHub Repo URL (Required) ──────────────────────────── */}
            <FormField
              id="proj-github"
              label="GitHub Repository URL *"
              error={errors.githubRepoUrl}
              hint="Required for department code tracing and commit contributions."
              inputProps={{
                type: 'url',
                value: githubRepoUrl,
                onChange: (e) => setGithubRepoUrl(e.target.value),
                placeholder: 'https://github.com/owner/repository',
                required: true,
                disabled: isLoading,
              }}
            />

            {/* ── Discord Server URL (Optional) ───────────────────────── */}
            <FormField
              id="proj-discord"
              label="Discord Server URL (Optional)"
              error={errors.discordUrl}
              hint="Invite link for your crew voice and comms channel."
              inputProps={{
                type: 'url',
                value: discordUrl,
                onChange: (e) => setDiscordUrl(e.target.value),
                placeholder: 'https://discord.gg/your-crew',
                disabled: isLoading,
              }}
            />

            {/* ── Status Select ────────────────────────────────────────── */}
            <div className={styles.statusField}>
              <label htmlFor="proj-status" className={styles.label}>
                Initial Flight Status
              </label>
              <select
                id="proj-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className={styles.select}
                disabled={isLoading}
              >
                <option value="planning">Planning — Blueprint & Department Assignment</option>
                <option value="ongoing">Ongoing — Active Development & Propulsion</option>
                <option value="completed">Completed — Flight Verified & Landed</option>
              </select>
            </div>

            {/* ── Rocky.ai Section ────────────────────────────────────── */}
            <section className={styles.rockyCard} aria-labelledby="rocky-title">
              <div className={styles.rockyInner}>
                <RockyMascot size="sm" className={styles.rockyMascot} />
                <div className={styles.rockyTextWrap}>
                  <div className={styles.rockyTitleRow}>
                    <h2 id="rocky-title" className={styles.rockyTitle}>
                      Analyse with Rocky.ai
                    </h2>
                    <span className={styles.comingLaterBadge}>Coming Later</span>
                  </div>
                  <p className={styles.rockyNote}>
                    Rocky.ai is not yet active. No AI analysis will be performed.
                  </p>
                </div>
                <div className={styles.toggleWrap}>
                  <input
                    type="checkbox"
                    id="rocky-toggle"
                    disabled
                    checked={false}
                    aria-disabled="true"
                    aria-label="Analyse with Rocky.ai (disabled)"
                    className={styles.rockyToggle}
                  />
                </div>
              </div>
            </section>

            {/* ── Action Buttons ──────────────────────────────────────── */}
            <footer className={styles.actions}>
              <Button
                type="button"
                variant="ghost"
                size="lg"
                onClick={() => navigate('/profile')}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
              >
                Launch Rocket
              </Button>
            </footer>
          </form>
        </div>
      </main>
    </div>
  );
}
