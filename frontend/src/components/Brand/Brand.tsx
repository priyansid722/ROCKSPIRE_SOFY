/*
 * Brand/Brand.tsx — ROCKSPIRE SOFY brand lockup
 *
 * Shows the real pixel-art logo image + the ROCKSPIRE wordmark (Aboreto)
 * + "SOFY" (Alumni Sans) beside it.
 *
 * Props:
 *   size: "sm" | "md" | "lg"  — scales the whole lockup
 *   hideText: boolean          — show logo image only (for favicon/icon contexts)
 */

import logoSrc from '@/assets/rockspire-logo.png';
import styles from './Brand.module.css';

interface BrandProps {
  size?: 'sm' | 'md' | 'lg';
  hideText?: boolean; // If true, renders only the logo image (no text lockup)
  className?: string;
}

export function Brand({ size = 'md', hideText = false, className }: BrandProps) {
  /*
   * The logo PNG already contains the ROCKSPIRE + SOFY wordmark baked in.
   * We render it with image-rendering: pixelated to keep the pixel art crisp.
   * hideText=true renders a square crop of just the rocket icon portion,
   * useful for avatars/favicon references.
   */
  return (
    <span
      className={[styles.brand, styles[`brand--${size}`], className ?? ''].join(' ')}
      aria-label="ROCKSPIRE SOFY"
    >
      <img
        src={logoSrc}
        alt="ROCKSPIRE SOFY — pixel-art rocket logo"
        className={[styles.logo, hideText ? styles['logo--icon-only'] : ''].join(' ')}
        // Preserve the crisp pixel-art look — never smooth/blur this image
        style={{ imageRendering: 'pixelated' }}
        draggable={false}
      />
    </span>
  );
}
