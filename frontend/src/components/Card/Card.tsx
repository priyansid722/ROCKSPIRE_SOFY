/*
 * Card — base reusable card component
 * background: 'cream' | 'ecru' | 'pewter' | 'rose'
 * elevation: 'flat' | 'raised' (adds shadow-md)
 * Clickable variant (as button or link wrapper)
 */
import React from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: React.ReactNode;
  background?: 'cream' | 'ecru' | 'pewter' | 'rose';
  elevation?: 'flat' | 'raised';
  className?: string;
  onClick?: () => void;
  role?: string;
  tabIndex?: number;
  'aria-label'?: string;
}

export function Card({
  children,
  background = 'cream',
  elevation = 'flat',
  className,
  onClick,
  ...rest
}: CardProps) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      className={[
        styles.card,
        styles[`card--${background}`],
        styles[`card--${elevation}`],
        onClick ? styles['card--clickable'] : '',
        className ?? '',
      ].filter(Boolean).join(' ')}
      onClick={onClick}
      {...(onClick ? { type: 'button' } : {})}
      {...rest}
    >
      {children}
    </Tag>
  );
}
