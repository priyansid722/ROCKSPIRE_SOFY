// Avatar component – renders PNG avatars from registry
// Also exports AvatarPicker with keyboard navigation and 44px touch targets
import React, { useCallback } from 'react';
import styles from './Avatar.module.css';
import { AVATARS, getAvatarById } from '@/config/avatars';

// ─── Avatar ─────────────────────────────────────────────────────────────────

export interface AvatarProps {
  avatarId: number;
  username?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ avatarId, username = 'User', size = 'md', className }: AvatarProps) {
  const avatarInfo = getAvatarById(avatarId);
  return (
    <span
      className={[styles.avatar, styles[`avatar--${size}`], className ?? ''].filter(Boolean).join(' ')}
      role="img"
      aria-label={`${username}'s avatar`}
    >
      <img
        src={avatarInfo.src}
        alt={avatarInfo.alt}
        className={styles.avatarImg}
        style={{ objectPosition: avatarInfo.objectPosition ?? 'center' }}
        draggable={false}
      />
    </span>
  );
}

// ─── AvatarPicker ────────────────────────────────────────────────────────────

interface AvatarPickerProps {
  selected: number;
  onChange: (id: number) => void;
}

/**
 * Renders a 5×2 grid of 10 pixel-art avatars.
 * - Rose-gold ring (--color-rose) + inline SVG checkmark on selected item.
 * - Arrow-key keyboard navigation (← → ↑ ↓), wrapping at grid edges.
 * - Each button is at least 44×44px (touch target rule).
 * - radiogroup / radio ARIA semantics.
 */
export function AvatarPicker({ selected, onChange }: AvatarPickerProps) {
  const COLS = 5; // 5 avatars per row

  /** Handle arrow-key navigation within the picker grid. */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, currentId: number) => {
      const idx = currentId - 1; // 0-based index
      let nextIdx: number | null = null;

      if (e.key === 'ArrowRight') {
        nextIdx = (idx + 1) % AVATARS.length;
      } else if (e.key === 'ArrowLeft') {
        nextIdx = (idx - 1 + AVATARS.length) % AVATARS.length;
      } else if (e.key === 'ArrowDown') {
        const below = idx + COLS;
        nextIdx = below < AVATARS.length ? below : idx; // clamp at bottom row
      } else if (e.key === 'ArrowUp') {
        const above = idx - COLS;
        nextIdx = above >= 0 ? above : idx; // clamp at top row
      } else {
        return; // not a navigation key
      }

      e.preventDefault();
      // Move focus to the next button and select it
      const buttons = document.querySelectorAll<HTMLButtonElement>('[data-avatar-picker-btn]');
      if (buttons[nextIdx]) {
        buttons[nextIdx].focus();
        onChange(nextIdx + 1);
      }
    },
    [onChange],
  );

  return (
    <div className={styles.picker} role="radiogroup" aria-label="Choose your avatar">
      {AVATARS.map((avatar) => {
        const isSelected = selected === avatar.id;
        return (
          <button
            key={avatar.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={`${avatar.name} avatar`}
            data-avatar-picker-btn
            className={[
              styles['picker-item'],
              isSelected ? styles['picker-item--selected'] : '',
            ].join(' ')}
            onClick={() => onChange(avatar.id)}
            onKeyDown={(e) => handleKeyDown(e, avatar.id)}
            tabIndex={isSelected ? 0 : -1}
          >
            <img
              src={avatar.src}
              alt={avatar.alt}
              className={styles.pickerImg}
              style={{ objectPosition: avatar.objectPosition ?? 'center' }}
              draggable={false}
            />
            {isSelected && (
              <span className={styles.checkBadge} aria-hidden="true">
                {/* Inline SVG — black check on rose-gold circle */}
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="black"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
