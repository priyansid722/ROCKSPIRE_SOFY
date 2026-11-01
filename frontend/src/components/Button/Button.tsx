/*
 * Button component
 * variant: 'primary' (rose bg, black text), 'secondary' (pewter bg, black text), 'ghost' (transparent, black border)
 * size: 'sm' | 'md' | 'lg'
 * isLoading: boolean (shows spinner, disables button)
 * fullWidth: boolean
 * Uses Alumni Sans font. Min touch target 44px.
 * Has hover, focus-visible, active, disabled states.
 */
import React from 'react';
import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  disabled,
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        styles.btn,
        styles[`btn--${variant}`],
        styles[`btn--${size}`],
        fullWidth ? styles['btn--full'] : '',
        isLoading ? styles['btn--loading'] : '',
        className ?? '',
      ].filter(Boolean).join(' ')}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading && <span className={styles.spinner} aria-hidden="true" />}
      <span className={isLoading ? styles['btn__text--hidden'] : ''}>{children}</span>
    </button>
  );
}
