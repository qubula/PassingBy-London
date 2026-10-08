// The expanded Dynamic Island "Look left" (Figma DI4, page "★ PassingBy — Live
// Activity & ride app"), rebuilt as live text and shapes so it stays sharp while
// the camera zooms. Figma uses DM Sans as a stand-in; this uses Satoshi.
// Drawn at the Figma size (371 × 180) and scaled to `width`.
import React from 'react';
import { Img, staticFile } from 'remotion';
import { SANS } from '../fonts';

export const ISLAND_W = 371;
export const ISLAND_H = 180;

export const IslandLookLeft: React.FC<{ width: number; opacity?: number }> = ({ width, opacity = 1 }) => {
  const k = width / ISLAND_W;
  const t: React.CSSProperties = { position: 'absolute', fontFamily: SANS, color: '#fff', whiteSpace: 'nowrap' };
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: ISLAND_W, height: ISLAND_H, transform: `scale(${k})`, transformOrigin: 'top left', opacity }}>
      <svg style={{ position: 'absolute', left: 39.3 - 4, top: 39.3 - 4 }} width={27} height={46} viewBox="-4 -4 27 46">
        <path d="M18.67 0 L0 18.67 L18.67 37.33" fill="none" stroke="#fff" strokeWidth={6.93} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span style={{ ...t, left: 90, top: 30, fontSize: 42, lineHeight: '55px', fontWeight: 700, letterSpacing: -1 }}>Look left</span>
      <span style={{ ...t, left: 92, top: 86, fontSize: 17, lineHeight: '22px', fontWeight: 500, opacity: 0.7 }}>Elizabeth Tower · 200 m</span>
      <div style={{ position: 'absolute', left: 39, top: 126, width: 44, height: 36, borderRadius: 8, overflow: 'hidden' }}>
        <Img src={staticFile('landmarks/elizabeth-tower.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <span style={{ ...t, left: 95, top: 136, fontSize: 14, lineHeight: '18px', fontWeight: 400, opacity: 0.6 }}>Tap for the postcard</span>
    </div>
  );
};
