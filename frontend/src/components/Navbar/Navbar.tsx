/*
 * Navbar/Navbar.tsx — Top navigation bar
 *
 * Left: Brand (ROCKSPIRE SOFY logo image)
 * Center: nav links (shown when logged in)
 * Right: Profile icon (→ /login when logged out, → /profile when logged in)
 *
 * The logo uses the real rockspire-logo.png with image-rendering: pixelated.
 */

import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Brand } from '@/components/Brand';
import { useAuth } from '@/context/AuthContext';
import { Avatar } from '@/components/Avatar';
import styles from './Navbar.module.css';

export function Navbar() {
  const { currentUser, session } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const isLoggedIn = Boolean(session);

  return (
    <header className={styles.navbar} role="banner">
      <nav
        className={`${styles.inner} container`}
        aria-label="Main navigation"
      >
        {/* ── Brand / Logo ──────────────────────────────────────────── */}
        <Link
          to={isLoggedIn ? '/profile' : '/'}
          className={styles.brandLink}
          aria-label="ROCKSPIRE SOFY — go to home"
        >
          {/* Real pixel-art logo — pixelated rendering preserved */}
          <Brand size="sm" />
        </Link>

        {/* ── Desktop links ──────────────────────────────────────────── */}
        {isLoggedIn && (
          <ul className={styles.navLinks} role="list">
            <li>
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles['navLink--active'] : ''}`
                }
              >
                My Rockets
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/projects/new"
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles['navLink--active'] : ''}`
                }
              >
                New Rocket
              </NavLink>
            </li>
          </ul>
        )}

        {/* ── Right: profile icon ─────────────────────────────────────── */}
        <div className={styles.actions}>
          {isLoggedIn && currentUser ? (
            <button
              className={styles.profileBtn}
              onClick={() => navigate('/profile')}
              aria-label={`Profile menu for ${currentUser.username}`}
            >
              <Avatar
                avatarId={currentUser.avatarId}
                username={currentUser.username}
                size="sm"
              />
            </button>
          ) : (
            <Link to="/login" className={styles.loginLink}>
              Login
            </Link>
          )}

          {/* ── Mobile hamburger ──────────────────────────────────── */}
          {isLoggedIn && (
            <button
              className={styles.hamburger}
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              <span className={styles.hamburgerBar} />
              <span className={styles.hamburgerBar} />
              <span className={styles.hamburgerBar} />
            </button>
          )}
        </div>
      </nav>

      {/* ── Mobile dropdown ────────────────────────────────────────────── */}
      {menuOpen && isLoggedIn && (
        <div className={styles.mobileMenu} role="navigation" aria-label="Mobile navigation">
          <Link
            to="/profile"
            className={styles.mobileLink}
            onClick={() => setMenuOpen(false)}
          >
            My Rockets
          </Link>
          <Link
            to="/projects/new"
            className={styles.mobileLink}
            onClick={() => setMenuOpen(false)}
          >
            New Rocket
          </Link>
        </div>
      )}
    </header>
  );
}
