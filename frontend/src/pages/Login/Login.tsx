/*
 * Login page
 * Route: /login
 * - Brand logo (real rockspire-logo.png via Brand component)
 * - Welcome heading
 * - "Continue with Google" button (placeholder — logs warning in mock mode)
 * - "Continue with GitHub" button (placeholder — logs warning in mock mode)
 * - Divider line with "or"
 * - Email + Password (PasswordField) with visibility toggle
 * - "Forgot Password" link (placeholder, /login for now)
 * - Login button with loading state
 * - "Don't have an account? Create one" link → /register
 * - Error display
 * - After success: navigate to ?return= or /profile
 * Uses: Brand, Button, FormField, PasswordField, useAuth, useNavigate
 */

import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Brand } from '@/components/Brand';
import { Button } from '@/components/Button';
import { FormField } from '@/components/FormField';
import { PasswordField } from '@/components/PasswordField';
import { DevMockBanner } from '@/components/DevMockBanner';
import { useAuth } from '@/context/AuthContext';
import styles from './Login.module.css';

export function Login() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, signInWithOAuth } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null);

  const returnUrl = searchParams.get('return') || '/profile';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      await login(email.trim(), password);
      navigate(returnUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    setError(null);
    setOauthLoading(provider);
    try {
      await signInWithOAuth(provider);
      navigate(returnUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to sign in with ${provider}.`);
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

          <h1 className={styles.heading}>Welcome Back</h1>
          <p className={styles.subheading}>
            Enter your coordinates to access mission control.
          </p>

          {/* ── OAuth Buttons ─────────────────────────────────────────── */}
          <div className={styles.oauthSection}>
            <button
              type="button"
              className={styles.oauthButton}
              onClick={() => handleOAuth('google')}
              disabled={isLoading || oauthLoading !== null}
              aria-label="Continue with Google"
            >
              <GoogleIcon className={styles.oauthIcon} />
              <span>
                {oauthLoading === 'google' ? 'Connecting to Google…' : 'Continue with Google'}
              </span>
            </button>

            <button
              type="button"
              className={styles.oauthButton}
              onClick={() => handleOAuth('github')}
              disabled={isLoading || oauthLoading !== null}
              aria-label="Continue with GitHub"
            >
              <GitHubIcon className={styles.oauthIcon} />
              <span>
                {oauthLoading === 'github' ? 'Connecting to GitHub…' : 'Continue with GitHub'}
              </span>
            </button>
          </div>

          {/* ── Divider ──────────────────────────────────────────────── */}
          <div className={styles.divider} role="separator" aria-label="or">
            <span className={styles.dividerText}>or</span>
          </div>

          {/* ── Error Banner ─────────────────────────────────────────── */}
          {error && (
            <div className={styles.errorAlert} role="alert">
              <span className={styles.errorIcon} aria-hidden="true">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* ── Email & Password Form ─────────────────────────────────── */}
          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <FormField
              id="login-email"
              label="Email Address"
              inputProps={{
                type: 'email',
                value: email,
                onChange: (e) => { setEmail(e.target.value); setError(null); },
                placeholder: 'e.g. nova@mockrockspire.dev',
                autoComplete: 'email',
                required: true,
                disabled: isLoading,
              }}
            />

            <PasswordField
              id="login-password"
              label="Password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null); }}
              placeholder="••••••••••••"
              autoComplete="current-password"
            />

            <div className={styles.forgotRow}>
              <Link to="/login" className={styles.forgotLink}>
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              className={styles.submitButton}
            >
              Log In
            </Button>
          </form>

          {/* ── Bottom Link ──────────────────────────────────────────── */}
          <div className={styles.bottomRow}>
            <p className={styles.bottomText}>
              Don&apos;t have an account?{' '}
              <Link to="/register" className={styles.switchLink}>
                Create one
              </Link>
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
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}
