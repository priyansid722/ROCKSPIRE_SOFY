/*
 * FormField — label + input/textarea + error message
 * Always uses semantic <label htmlFor>.
 * Courier Prime font for input text.
 * Shows rose-tinted error state with message.
 *
 * TypeScript note: inputProps uses `Record<string, unknown>` spread
 * to avoid the input/textarea onChange type conflict. Individual
 * call sites type their own handlers correctly.
 */
import React from 'react';
import styles from './FormField.module.css';

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;
type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

interface FormFieldBaseProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  className?: string;
}

interface InputFormFieldProps extends FormFieldBaseProps {
  as?: 'input';
  inputProps?: InputProps;
}

interface TextareaFormFieldProps extends FormFieldBaseProps {
  as: 'textarea';
  inputProps?: TextareaProps;
}

type FormFieldProps = InputFormFieldProps | TextareaFormFieldProps;

export function FormField({ id, label, error, hint, as = 'input', className, inputProps }: FormFieldProps) {
  const hasError = Boolean(error);
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  const inputClass = [styles.input, hasError ? styles['input--error'] : ''].filter(Boolean).join(' ');

  return (
    <div className={[styles.field, className ?? ''].join(' ')}>
      <label htmlFor={id} className={styles.label}>{label}</label>

      {as === 'textarea' ? (
        <textarea
          id={id}
          className={inputClass}
          aria-describedby={describedBy}
          aria-invalid={hasError || undefined}
          {...(inputProps as TextareaProps)}
        />
      ) : (
        <input
          id={id}
          className={inputClass}
          aria-describedby={describedBy}
          aria-invalid={hasError || undefined}
          {...(inputProps as InputProps)}
        />
      )}

      {hint && !error && (
        <p id={`${id}-hint`} className={styles.hint}>{hint}</p>
      )}
      {error && (
        <p id={`${id}-error`} className={styles.error} role="alert">{error}</p>
      )}
    </div>
  );
}
