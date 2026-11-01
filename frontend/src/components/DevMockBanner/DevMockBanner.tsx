/*
 * DevMockBanner — visible warning when VITE_USE_MOCK_API=true
 * Shown at the top of the page so there's never confusion about
 * whether real data is displayed.
 */
import { IS_MOCK_MODE } from '@/services';
import { resetRuntimeData } from '@/services/mock/mockData';
import styles from './DevMockBanner.module.css';

export function DevMockBanner() {
  if (!IS_MOCK_MODE) return null;
  return (
    <div className={styles.banner} role="banner" aria-label="Development mode notice">
      <span className={styles.icon} aria-hidden="true">🧪</span>
      <strong className={styles.label}>DEV MOCK MODE</strong>
      <span className={styles.text}>
        Using in-memory mock data. No real backend is connected.
        Test users: <code>nova@mockrockspire.dev</code> / <code>MockPass123!</code>
      </span>
      {/* Reset mock data button (dev only) */}
      <button
        type="button"
        className={styles.resetButton}
        onClick={() => {
          resetRuntimeData();
          window.location.reload();
        }}
      >
        Reset mock data (dev only)
      </button>
    </div>
  );
}
