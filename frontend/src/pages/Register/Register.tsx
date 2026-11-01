/*
 * Register page
 * Route: /register
 * Three method tabs: Google | GitHub | Manual
 * Google tab: Continue with Google button + note "OAuth not available in mock mode"
 * GitHub tab: Continue with GitHub button + same note
 * Manual tab:
 *   - AvatarPicker (default avatar 1)
 *   - Full Name (required)
 *   - Username (required, 3-20 chars, a-z 0-9 _, no @)
 *   - Email (required)
 *   - Password (PasswordField, autoComplete="new-password")
 *   - Confirm Password (PasswordField, autoComplete="new-password")
 *   - GitHub Username (optional)
 *   - Create Account button with loading state
 *   - Error display — clears on any field change and on re-submit
 * After success: navigate to /profile
 * Link: "Already have an account? Login" → /login
 */

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brand } from '@/components/Brand';
import { Button } from '@/components/Button';
import { FormField } from '@/components/FormField';
import { PasswordField } from '@/components/PasswordField';
import { AvatarPicker } from '@/components/Avatar';
import { DevMockBanner } from '@/components/DevMockBanner';
import { useAuth } from '@/context/AuthContext';
import { authService, IS_MOCK_MODE } from '@/services';
import styles from './Register.module.css';

type RegisterMethod = 'manual' | 'google' | 'github';
type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

// Valid username: 3-20 chars, letters/numbers/underscores only, no @
const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

export function Register() {
  const navigate = useNavigate();
  const { register, signInWithOAuth } = useAuth();

  const [activeTab, setActiveTab] = useState<RegisterMethod>('manual');

  // Form fields
  const [avatarId, setAvatarId] = useState(1);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [githubUsername, setGithubUsername] = useState('');

  // Status & validation
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null);

  // Clear general error as soon as the user edits any field
  function clearGeneralError() {
    if (generalError) setGeneralError(null);
  }

  // ── Username validation & debounced availability check ──────────────────────
  useEffect(() => {
    const trimmed = username.trim();

    if (!trimmed) {
      setUsernameStatus('idle');
      return;
    }
    if (trimmed.includes('@') || !USERNAME_RE.test(trimmed)) {
      setUsernameStatus('invalid');
      setErrors((prev) => ({
        ...prev,
        username: 'Usernames can only use letters, numbers and underscores (3 to 20 characters). The @ symbol is not allowed.',
      }));
      return;
    }

    // Format is valid — check availability
    setUsernameStatus('checking');
    setErrors((prev) => { const n = { ...prev }; delete n.username; return n; });

    const timer = setTimeout(async () => {
      try {
        const available = await authService.checkUsernameAvailable(trimmed);
        if (available) {
          setUsernameStatus('available');
          setErrors((prev) => { const n = { ...prev }; delete n.username; return n; });
        } else {
          setUsernameStatus('taken');
          setErrors((prev) => ({ ...prev, username: 'That username is already taken. Please choose another.' }));
        }
      } catch {
        setUsernameStatus('idle');
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [username]);

  // ── Confirm password live check ──────────────────────────────────────────────
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setConfirmPassword(val);
    clearGeneralError();
    if (val && password && val !== password) {
      setErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match.' }));
    } else {
      setErrors((prev) => { const n = { ...prev }; delete n.confirmPassword; return n; });
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    clearGeneralError();
    if (confirmPassword && val !== confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match.' }));
    } else if (confirmPassword && val === confirmPassword) {
      setErrors((prev) => { const n = { ...prev }; delete n.confirmPassword; return n; });
    }
  };

  // ── Form validation ──────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required.';
    }

    const trimmedUser = username.trim();
    if (!trimmedUser) {
      newErrors.username = 'Username is required.';
    } else if (trimmedUser.includes('@') || !USERNAME_RE.test(trimmedUser)) {
      newErrors.username =
        'Usernames can only use letters, numbers and underscores (3 to 20 characters). The @ symbol is not allowed.';
    } else if (usernameStatus === 'taken') {
      newErrors.username = 'That username is already taken. Please choose another.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirm your password.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Clear previous general error immediately on each submit attempt
    setGeneralError(null);

    if (!validate()) return;

    setIsLoading(true);
    try {
      await register({
        fullName: fullName.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
        githubUsername: githubUsername.trim() || undefined,
        avatarId,
      });
      navigate('/profile');
    } catch (err) {
      setGeneralError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    setGeneralError(null);
    setOauthLoading(provider);
    try {
      await signInWithOAuth(provider);
      navigate('/profile');
    } catch (err) {
      setGeneralError(err instanceof Error ? err.message : `Failed to sign in with ${provider}.`);
    } finally {
      setOauthLoading(null);
    }
  };

  return (
    <div className={styles.page}>
      <DevMockBanner />

      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.brandWrapper}>
            <Link to="/" aria-label="Go to home">
              <Brand size="lg" />
            </Link>
          </div>

          <h1 className={styles.heading}>Create Your Account</h1>
          <p className={styles.subheading}>
            Join mission control and start building collaborative rockets.
          </p>

          {/* ── Method Tabs ───────────────────────────────────────────── */}
          <div className={styles.tabs} role="tablist" aria-label="Registration method">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'manual'}
              className={[styles.tabButton, activeTab === 'manual' ? styles['tabButton--active'] : ''].join(' ')}
              onClick={() => setActiveTab('manual')}
            >
              Manual
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'google'}
              className={[styles.tabButton, activeTab === 'google' ? styles['tabButton--active'] : ''].join(' ')}
              onClick={() => setActiveTab('google')}
            >
              Google
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'github'}
              className={[styles.tabButton, activeTab === 'github' ? styles['tabButton--active'] : ''].join(' ')}
              onClick={() => setActiveTab('github')}
            >
              GitHub
            </button>
          </div>

          {/* ── General Error Banner ──────────────────────────────────── */}
          {generalError && (
            <div className={styles.errorAlert} role="alert">
              <span className={styles.errorIcon} aria-hidden="true">⚠️</span>
              <span>{generalError}</span>
            </div>
          )}

          {/* ── Google Tab ────────────────────────────────────────────── */}
          {activeTab === 'google' && (
            <div className={styles.oauthTabContent}>
              <button
                type="button"
                className={styles.oauthButton}
                onClick={() => handleOAuth('google')}
                disabled={oauthLoading !== null}
                aria-label="Continue with Google"
              >
                <GoogleIcon className={styles.oauthIcon} />
                <span>{oauthLoading === 'google' ? 'Connecting to Google…' : 'Continue with Google'}</span>
              </button>
              <p className={styles.oauthNote}>
                OAuth authentication is not available in mock mode. Please use the Manual tab or existing test accounts.
              </p>
            </div>
          )}

          {/* ── GitHub Tab ────────────────────────────────────────────── */}
          {activeTab === 'github' && (
            <div className={styles.oauthTabContent}>
              <button
                type="button"
                className={styles.oauthButton}
                onClick={() => handleOAuth('github')}
                disabled={oauthLoading !== null}
                aria-label="Continue with GitHub"
              >
                <GitHubIcon className={styles.oauthIcon} />
                <span>{oauthLoading === 'github' ? 'Connecting to GitHub…' : 'Continue with GitHub'}</span>
              </button>
              <p className={styles.oauthNote}>
                OAuth authentication is not available in mock mode. Please use the Manual tab or existing test accounts.
              </p>
            </div>
          )}

          {/* ── Manual Tab ────────────────────────────────────────────── */}
          {activeTab === 'manual' && (
            <form onSubmit={handleSubmit} className={styles.form} noValidate>
              {/* ── Avatar Picker ──────────────────────────────────────── */}
              <section className={styles.avatarSection} aria-labelledby="reg-avatar-label">
                <h2 id="reg-avatar-label" className={styles.avatarLabel}>Choose Your Avatar</h2>
                <AvatarPicker selected={avatarId} onChange={setAvatarId} />
              </section>

              <FormField
                id="reg-fullName"
                label="Full Name *"
                error={errors.fullName}
                inputProps={{
                  type: 'text',
                  value: fullName,
                  onChange: (e) => { setFullName(e.target.value); clearGeneralError(); },
                  placeholder: 'e.g. Nova Stellarson',
                  autoComplete: 'name',
                  required: true,
                  disabled: isLoading,
                }}
              />

              <div className={styles.usernameFieldWrapper}>
                <FormField
                  id="reg-username"
                  label="Username *"
                  error={errors.username}
                  hint="3–20 characters. Letters, numbers, underscores only."
                  inputProps={{
                    type: 'text',
                    value: username,
                    onChange: (e) => { setUsername(e.target.value); clearGeneralError(); },
                    placeholder: 'e.g. nova_lead',
                    // "off" stops Chrome from autofilling email into username field
                    autoComplete: 'off',
                    required: true,
                    disabled: isLoading,
                    spellCheck: false,
                  }}
                />

                {/* Inline availability indicator */}
                {username.trim().length >= 3 && USERNAME_RE.test(username.trim()) && (
                  <div className={styles.usernameIndicator}>
                    {usernameStatus === 'checking' && <span className={styles.statusChecking}>⋯ Checking…</span>}
                    {usernameStatus === 'available' && <span className={styles.statusAvailable}>✓ Available</span>}
                    {usernameStatus === 'taken' && <span className={styles.statusTaken}>✗ Taken</span>}
                  </div>
                )}
              </div>

              <FormField
                id="reg-email"
                label="Email Address *"
                error={errors.email}
                inputProps={{
                  type: 'email',
                  value: email,
                  onChange: (e) => { setEmail(e.target.value); clearGeneralError(); },
                  placeholder: 'e.g. nova@example.com',
                  autoComplete: 'email',
                  required: true,
                  disabled: isLoading,
                }}
              />

              <PasswordField
                id="reg-password"
                label="Password *"
                error={errors.password}
                value={password}
                onChange={handlePasswordChange}
                placeholder="At least 8 characters"
                autoComplete="new-password"
              />

              <PasswordField
                id="reg-confirmPassword"
                label="Confirm Password *"
                error={errors.confirmPassword}
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                placeholder="Repeat password"
                autoComplete="new-password"
              />

              <FormField
                id="reg-github"
                label="GitHub Username (Optional)"
                hint="Used for team repository contributions tracking"
                inputProps={{
                  type: 'text',
                  value: githubUsername,
                  onChange: (e) => { setGithubUsername(e.target.value); clearGeneralError(); },
                  placeholder: 'e.g. nova-stellarson',
                  autoComplete: 'off',
                  disabled: isLoading,
                }}
              />

              {/* Connect GitHub button (UI placeholder) */}
              <div className={styles.connectGitHubWrap}>
                <button
                  type="button"
                  className={styles.connectGitHubButton}
                  disabled
                  aria-disabled="true"
                  title="Coming later in a future milestone"
                >
                  <GitHubIcon className={styles.oauthIcon} />
                  <span>Connect GitHub</span>
                  <span className={styles.comingLaterBadge}>Coming Later</span>
                </button>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
                className={styles.submitButton}
              >
                Create Account
              </Button>

              {/* Mock-mode throwaway-password notice */}
              {IS_MOCK_MODE && (
                <p className={styles.mockNote}>
                  🧪 Mock mode: use a throwaway password. It is stored in
                  this browser only and never sent to any server.
                </p>
              )}
            </form>
          )}

          {/* ── Bottom Link ──────────────────────────────────────────── */}
          <div className={styles.bottomRow}>
            <p className={styles.bottomText}>
              Already have an account?{' '}
              <Link to="/login" className={styles.switchLink}>Login</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}
