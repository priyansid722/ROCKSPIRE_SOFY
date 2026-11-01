/*
 * Profile Edit
 * Route: /profile/edit (protected)
 * - Navbar
 * - Heading: "Edit Profile"
 * - AvatarPicker (10 options)
 * - FormField: Full Name
 * - FormField: Username (readonly — username changes not supported yet, show note)
 * - FormField: Email (readonly — email changes need verification, show note)
 * - FormField textarea: Bio (max 240 chars, char counter)
 * - FormField: GitHub Username
 * - Save button with loading/success/error feedback
 * - Cancel button → navigate back to /profile WITHOUT saving
 * - DevMockBanner
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { AvatarPicker } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { FormField } from '@/components/FormField';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { DevMockBanner } from '@/components/DevMockBanner';
import { profileService } from '@/services';
import type { Profile } from '@/types';
import styles from './ProfileEdit.module.css';

const MAX_BIO_LENGTH = 240;

export function ProfileEdit() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Form states
  const [avatarId, setAvatarId] = useState(1);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [githubUsername, setGithubUsername] = useState('');

  // Initial reference for dirty checking
  const [initialData, setInitialData] = useState<{
    avatarId: number;
    fullName: string;
    bio: string;
    githubUsername: string;
  } | null>(null);

  // Submission state
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    let mounted = true;
    profileService
      .getMyProfile()
      .then((p: Profile) => {
        if (!mounted) return;
        setAvatarId(p.avatarId || 1);
        setFullName(p.fullName || '');
        setUsername(p.username || '');
        setEmail(p.email || '');
        setBio(p.bio || '');
        setGithubUsername(p.githubUsername || '');

        setInitialData({
          avatarId: p.avatarId || 1,
          fullName: p.fullName || '',
          bio: p.bio || '',
          githubUsername: p.githubUsername || '',
        });
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        setLoadError(err instanceof Error ? err.message : 'Failed to load profile.');
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const isDirty = Boolean(
    initialData &&
      (avatarId !== initialData.avatarId ||
        fullName !== initialData.fullName ||
        bio !== initialData.bio ||
        githubUsername !== initialData.githubUsername)
  );

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length <= MAX_BIO_LENGTH) {
      setBio(val);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      const confirmDiscard = window.confirm('Discard unsaved changes?');
      if (!confirmDiscard) return;
    }
    navigate('/profile');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(false);

    if (!fullName.trim()) {
      setSaveError('Full Name is required.');
      return;
    }

    setIsSaving(true);
    try {
      await profileService.updateMyProfile({
        avatarId,
        fullName: fullName.trim(),
        bio: bio.trim(),
        githubUsername: githubUsername.trim(),
      });

      setSaveSuccess(true);
      setTimeout(() => {
        navigate('/profile');
      }, 1200);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <DevMockBanner />
      <Navbar />

      <main className={styles.container}>
        {loading && <LoadingState message="Loading profile editor…" fullPage />}

        {!loading && loadError && (
          <ErrorState message={loadError} onRetry={() => window.location.reload()} />
        )}

        {!loading && !loadError && (
          <div className={styles.content}>
            <header className={styles.header}>
              <h1 className={styles.title}>Edit Profile</h1>
              <p className={styles.subtitle}>
                Customize your astronaut identity across all rockets.
              </p>
            </header>

            {saveSuccess && (
              <div className={styles.successToast} role="status">
                <span aria-hidden="true">✓</span> Profile saved! Returning to hangar…
              </div>
            )}

            {saveError && (
              <div className={styles.errorAlert} role="alert">
                <span aria-hidden="true">⚠️</span> {saveError}
              </div>
            )}

            <form onSubmit={handleSave} className={styles.form}>
              {/* ── Avatar Picker Section ──────────────────────────────── */}
              <section className={styles.avatarSection} aria-labelledby="avatar-label">
                <h2 id="avatar-label" className={styles.sectionLabel}>
                  Select Avatar
                </h2>
                <AvatarPicker selected={avatarId} onChange={(id) => setAvatarId(id)} />
              </section>

              {/* ── Full Name ─────────────────────────────────────────── */}
              <FormField
                id="edit-fullname"
                label="Full Name *"
                inputProps={{
                  type: 'text',
                  value: fullName,
                  onChange: (e) => setFullName(e.target.value),
                  required: true,
                  disabled: isSaving,
                }}
              />

              {/* ── Username (Readonly) ─────────────────────────────────── */}
              <div className={styles.readonlyField}>
                <FormField
                  id="edit-username"
                  label="Username"
                  hint="Username changes are not supported yet."
                  inputProps={{
                    type: 'text',
                    value: username,
                    readOnly: true,
                    disabled: true,
                  }}
                />
              </div>

              {/* ── Email (Readonly) ────────────────────────────────────── */}
              <div className={styles.readonlyField}>
                <FormField
                  id="edit-email"
                  label="Email Address"
                  hint="Email changes require identity verification."
                  inputProps={{
                    type: 'email',
                    value: email,
                    readOnly: true,
                    disabled: true,
                  }}
                />
              </div>

              {/* ── Bio with Character Counter ─────────────────────────── */}
              <div className={styles.bioWrapper}>
                <FormField
                  id="edit-bio"
                  label="Mission Bio"
                  as="textarea"
                  inputProps={{
                    value: bio,
                    onChange: handleBioChange,
                    rows: 4,
                    placeholder: 'Tell your crewmates about your role, background, or interests…',
                    disabled: isSaving,
                  }}
                />
                <div className={styles.bioCounter} aria-live="polite">
                  {bio.length} / {MAX_BIO_LENGTH}
                </div>
              </div>

              {/* ── GitHub Username ────────────────────────────────────── */}
              <FormField
                id="edit-github"
                label="GitHub Username"
                hint="Your public GitHub handle for contribution tracking"
                inputProps={{
                  type: 'text',
                  value: githubUsername,
                  onChange: (e) => setGithubUsername(e.target.value),
                  placeholder: 'e.g. nova-stellarson',
                  disabled: isSaving,
                }}
              />

              {/* ── Action Bar ─────────────────────────────────────────── */}
              <footer className={styles.actionBar}>
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSaving}
                  disabled={isSaving || !isDirty}
                >
                  Save Profile
                </Button>
              </footer>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
