import React from 'react';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className={styles.container}>
      <div className={styles.illustration} aria-hidden="true">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="40" r="38" fill="var(--color-ecru)" stroke="var(--color-black)" strokeWidth="2"/>
          <rect x="30" y="16" width="20" height="36" rx="10" fill="var(--color-pewter)" stroke="var(--color-black)" strokeWidth="1.5"/>
          <polygon points="30,36 18,56 30,48" fill="var(--color-cream)" stroke="var(--color-black)" strokeWidth="1.5"/>
          <polygon points="50,36 62,56 50,48" fill="var(--color-cream)" stroke="var(--color-black)" strokeWidth="1.5"/>
          <rect x="35" y="52" width="10" height="8" rx="3" fill="var(--color-rose)" stroke="var(--color-black)" strokeWidth="1"/>
        </svg>
      </div>
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
