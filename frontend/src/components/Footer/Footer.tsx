/*
 * Footer/Footer.tsx — Site footer
 * Contains Terms, Contact, and small print.
 * Uses Courier Prime (body) + Alumni Sans (links).
 */

import { Link } from 'react-router-dom';
import { Brand } from '@/components/Brand';
import styles from './Footer.module.css';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={`${styles.inner} container`}>
        {/* Brand */}
        <div className={styles.brandCol}>
          <Brand size="sm" />
          <p className={styles.tagline}>
            Every great mission starts with a rocket.
          </p>
        </div>

        {/* Links */}
        <nav className={styles.linksCol} aria-label="Footer navigation">
          <ul className={styles.links} role="list">
            <li>
              <Link to="/terms" className={styles.link}>
                Terms of Use
              </Link>
            </li>
            <li>
              <Link to="/contact" className={styles.link}>
                Contact
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Bottom bar */}
      <div className={styles.bottom}>
        <span className={styles.copy}>
          © {year} ROCKSPIRE SOFY. A private collaboration platform.
        </span>
      </div>
    </footer>
  );
}
