import styles from './LoadingState.module.css';

interface LoadingStateProps {
  message?: string;
  fullPage?: boolean;
}

export function LoadingState({ message = 'Loading...', fullPage = false }: LoadingStateProps) {
  return (
    <div className={[styles.container, fullPage ? styles['container--full'] : ''].join(' ')} role="status" aria-live="polite">
      <div className={styles.rocket} aria-hidden="true">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <rect x="18" y="8" width="12" height="24" rx="6" fill="var(--color-pewter)" stroke="var(--color-black)" strokeWidth="1.5"/>
          <polygon points="18,22 10,36 18,30" fill="var(--color-ecru)" stroke="var(--color-black)" strokeWidth="1.5"/>
          <polygon points="30,22 38,36 30,30" fill="var(--color-ecru)" stroke="var(--color-black)" strokeWidth="1.5"/>
          <rect x="21" y="32" width="6" height="6" rx="2" fill="var(--color-rose)" stroke="var(--color-black)" strokeWidth="1"/>
        </svg>
      </div>
      <p className={styles.message}>{message}</p>
    </div>
  );
}
