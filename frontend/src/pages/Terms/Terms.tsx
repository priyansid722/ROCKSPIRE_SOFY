/* Terms.tsx — Placeholder Terms of Use page */
import { Link } from 'react-router-dom';
import { Brand } from '@/components/Brand';
import { Footer } from '@/components/Footer';
import styles from './Terms.module.css';

export function Terms() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/" aria-label="ROCKSPIRE SOFY home"><Brand size="md" /></Link>
      </header>
      <main className={`${styles.main} container container--narrow`}>
        <span className={styles.badge}>Placeholder — Content Coming Later</span>
        <h1 className={styles.title}>Terms of Use</h1>
        <p className={styles.text}>
          Full terms of use will be published here before ROCKSPIRE SOFY
          launches publicly. This page is a placeholder.
        </p>
        <p className={styles.text}>
          In the meantime: this is a private, invite-only platform. All data
          is private by default. Members may only access projects they belong
          to.
        </p>
        <Link to="/" className={styles.back}>← Back to home</Link>
      </main>
      <Footer />
    </div>
  );
}
