/* Contact.tsx — Placeholder Contact page */
import { Link } from 'react-router-dom';
import { Brand } from '@/components/Brand';
import { Footer } from '@/components/Footer';
import styles from './Contact.module.css';

export function Contact() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/" aria-label="ROCKSPIRE SOFY home"><Brand size="md" /></Link>
      </header>
      <main className={`${styles.main} container container--narrow`}>
        <span className={styles.badge}>Placeholder — Content Coming Later</span>
        <h1 className={styles.title}>Contact</h1>
        <p className={styles.text}>
          A contact form and support details will be available here once
          ROCKSPIRE SOFY launches. This page is a placeholder.
        </p>
        <p className={styles.text}>
          For now, please reach out via the Discord link in your project
          workspace, or through your team lead.
        </p>
        <Link to="/" className={styles.back}>← Back to home</Link>
      </main>
      <Footer />
    </div>
  );
}
