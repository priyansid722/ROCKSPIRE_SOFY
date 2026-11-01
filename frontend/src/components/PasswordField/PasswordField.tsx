/*
 * PasswordField — FormField with show/hide toggle
 * Eye icon (SVG inline) toggles input type between password and text.
 */
import React, { useState } from 'react';
import { FormField } from '@/components/FormField';
import styles from './PasswordField.module.css';

interface PasswordFieldProps {
  id: string;
  label?: string;
  error?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  autoComplete?: string;
  className?: string;
}

export function PasswordField({ id, label = 'Password', error, value, onChange, placeholder, autoComplete, className }: PasswordFieldProps) {
  const [show, setShow] = useState(false);
  return (
    <div className={[styles.wrapper, className ?? ''].join(' ')}>
      <FormField
        id={id}
        label={label}
        error={error}
        inputProps={{
          type: show ? 'text' : 'password',
          value,
          onChange,
          placeholder,
          autoComplete: autoComplete ?? 'current-password',
          style: { paddingRight: '3rem' },
        }}
      />
      <button
        type="button"
        className={styles.toggle}
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'Hide password' : 'Show password'}
        tabIndex={0}
      >
        {show ? (
          // Eye-off SVG
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
        ) : (
          // Eye SVG
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        )}
      </button>
    </div>
  );
}
