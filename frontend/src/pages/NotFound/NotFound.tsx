/*
 * NotFound.tsx — 404 page
 * Shown for any route that doesn't match.
 */

import { Link } from 'react-router-dom';
import { Brand } from '@/components/Brand';
import { Button } from '@/components/Button';
import { Footer } from '@/components/Footer';
import styles from './NotFound.module.css';

export function NotFound() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/" aria-label="ROCKSPIRE SOFY — go home">
          <Brand size="md" />
        </Link>
      </header>

      <main className={styles.main}>
        {/* SVG rocket pointing wrong way — playful 404 illustration */}
        <div className={styles.illustration} aria-hidden="true">
          <svg viewBox="0 0 120 160" fill="none" className={styles.rocketSVG}>
            {/* Rocket rotated 45deg — lost in space */}
            <g transform="rotate(45, 60, 80)">
              <rect x="46" y="30" width="28" height="72" rx="14" fill="var(--color-pewter)" stroke="var(--color-black)" strokeWidth="2"/>
              <polygon points="46,44 30,68 46,60" fill="var(--color-ecru)" stroke="var(--color-black)" strokeWidth="1.5"/>
              <polygon points="74,44 90,68 74,60" fill="var(--color-ecru)" stroke="var(--color-black)" strokeWidth="1.5"/>
              <rect x="51" y="102" width="18" height="16" rx="4" fill="var(--color-rose)" stroke="var(--color-black)" strokeWidth="1.5"/>
              {/* Window */}
              <circle cx="60" cy="65" r="7" fill="var(--color-cream)" stroke="var(--color-black)" strokeWidth="1.5"/>
            </g>
            {/* Stars */}
            <circle cx="20" cy="20" r="2" fill="var(--color-ecru)"/>
            <circle cx="100" cy="15" r="1.5" fill="var(--color-ecru)"/>
            <circle cx="110" cy="60" r="2" fill="var(--color-ecru)"/>
            <circle cx="10" cy="130" r="1.5" fill="var(--color-ecru)"/>
            <circle cx="105" cy="140" r="2" fill="var(--color-ecru)"/>
          </svg>
        </div>

        <p className={styles.code}>404</p>
        <h1 className={styles.title}>Lost in Space</h1>
        <p className={styles.text}>
          This rocket went off course. The page you're looking for doesn't
          exist — or you don't have access to it.
        </p>
        <div className={styles.actions}>
          <Button onClick={() => window.history.back()} variant="ghost">
            ← Go Back
          </Button>
          <Link to="/">
            <Button>Return to Base</Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
