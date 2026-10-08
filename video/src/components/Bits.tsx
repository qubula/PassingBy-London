// Small pieces that float around the deck: a story quote card and the
// "Look left" pill from the Dynamic Island.
import React from 'react';
import { SANS } from '../fonts';

export const Quote: React.FC<{ name: string; text: string; width: number; style?: React.CSSProperties }> = ({ name, text, width, style }) => {
  const k = width / 300;
  return (
    <div style={{
      position: 'absolute', width, padding: `${18 * k}px ${20 * k}px`, borderRadius: 16 * k, background: '#fff',
      boxShadow: `0 ${10 * k}px ${30 * k}px rgba(0,0,0,0.16)`, fontFamily: SANS, ...style,
    }}>
      <div style={{ fontSize: 11 * k, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#6b7280' }}>{name}</div>
      <div style={{ marginTop: 6 * k, fontSize: 19 * k, fontWeight: 600, lineHeight: 1.3, color: '#1a1a1a' }}>“{text}”</div>
    </div>
  );
};

export const LookLeft: React.FC<{ height: number; style?: React.CSSProperties }> = ({ height, style }) => {
  const k = height / 64;
  return (
    <div style={{
      position: 'absolute', height, borderRadius: height / 2, background: '#000', color: '#fff',
      display: 'flex', alignItems: 'center', gap: 12 * k, padding: `0 ${26 * k}px 0 ${20 * k}px`,
      fontFamily: SANS, fontWeight: 700, fontSize: 26 * k, whiteSpace: 'nowrap', boxShadow: `0 ${10 * k}px ${26 * k}px rgba(0,0,0,0.25)`, ...style,
    }}>
      <svg width={18 * k} height={26 * k} viewBox="0 0 18 26"><path d="M14 3 L4 13 L14 23" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg>
      Look left
    </div>
  );
};
