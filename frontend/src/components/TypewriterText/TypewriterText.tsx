/*
 * TypewriterText — animates text character by character using CSS steps()
 * Courier Prime font. Respects prefers-reduced-motion (shows instantly).
 * duration: animation duration in seconds (default 3)
 */
import React from 'react';
import styles from './TypewriterText.module.css';

interface TypewriterTextProps {
  text: string;
  duration?: number;
  className?: string;
  as?: 'p' | 'h1' | 'h2' | 'span';
}

export function TypewriterText({ text, duration = 3, className, as: Tag = 'p' }: TypewriterTextProps) {
  return (
    <Tag
      className={[styles.typewriter, className ?? ''].join(' ')}
      style={{
        '--chars': text.length,
        '--duration': `${duration}s`,
      } as React.CSSProperties}
      aria-label={text}
    >
      {text}
    </Tag>
  );
}
