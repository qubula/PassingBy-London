// The PassingBy wordmark as in Figma (component "PB/Logo"): JetBrains Mono
// Medium Italic, letter spacing -4%. Live text, so it stays sharp at any size.
import React from 'react';
import { MONO } from '../fonts';

export const Wordmark: React.FC<{ size: number; color?: string; style?: React.CSSProperties }> = ({ size, color = '#111', style }) => (
  <div style={{ fontFamily: MONO, fontStyle: 'italic', fontWeight: 500, fontSize: size, letterSpacing: '-0.04em', lineHeight: 1.1, color, whiteSpace: 'nowrap', ...style }}>
    PassingBy
  </div>
);
