// A Choose Theme tile (Figma "Theme v2 / Picker" in 05b, code: tileHtml() in
// static/v2/js/tour_selection.js and the .v2-tile rules in v2.css).
// Designed at the app's 161 × 150 and scaled.
import React from 'react';
import { EDITIONS } from '../editions';
import { MONO } from '../fonts';

export const TILE_W = 161;
export const TILE_H = 150;

type Props = { edition: string; count?: number; width: number; style?: React.CSSProperties };

export const ThemeTile: React.FC<Props> = ({ edition, count, width, style }) => {
  const e = EDITIONS[edition];
  const k = width / TILE_W;
  const mono: React.CSSProperties = { position: 'absolute', left: 14, fontFamily: MONO, fontWeight: 500 };
  return (
    <div style={{ position: 'absolute', width: TILE_W * k, height: TILE_H * k, ...style }}>
      <div style={{
        position: 'absolute', width: TILE_W, height: TILE_H, transform: `scale(${k})`, transformOrigin: 'top left',
        borderRadius: 12, background: e.body, color: e.ink, overflow: 'hidden',
        boxShadow: e.light ? 'inset 0 0 0 1px rgba(0,0,0,0.08)' : undefined,
      }}>
        <span style={{ ...mono, top: 13, fontSize: 10, letterSpacing: '0.08em', opacity: 0.7 }}>{e.code}</span>
        <svg width="26" height="26" viewBox="0 0 24 24" style={{ position: 'absolute', top: 11, right: 13, fill: e.accent }}
          dangerouslySetInnerHTML={{ __html: e.glyph }} />
        {count !== undefined ? (
          <>
            <span style={{ ...mono, top: 30, fontSize: 34, lineHeight: 1.2, letterSpacing: '-0.03em' }}>{count}</span>
            <span style={{ ...mono, top: 76, fontSize: 9, letterSpacing: '0.1em', opacity: 0.7 }}>{count === 1 ? 'LANDMARK' : 'LANDMARKS'}</span>
          </>
        ) : null}
        <span style={{
          position: 'absolute', left: 14, right: 14, bottom: 13, lineHeight: 1.1,
          fontFamily: e.font, fontWeight: e.weight, fontSize: e.size, fontStyle: e.style ?? 'normal',
        }}>{e.name}</span>
      </div>
    </div>
  );
};
