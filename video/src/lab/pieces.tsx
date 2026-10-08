// Small building blocks for the experimental cut: mono corner labels, a
// mounted landmark photo, the gooey dot, and depth-of-field helpers.
import React from 'react';
import { Img, staticFile } from 'remotion';
import { Landmark } from '../config';
import { MONO } from '../fonts';

// Mono corner labels, in the style of the theme codes ("04 · FORMA").
export const Chrome: React.FC<{ u: number; color: string; index: string; spec: string; opacity?: number }> = ({ u, color, index, spec, opacity = 1 }) => {
  const s: React.CSSProperties = { position: 'absolute', fontFamily: MONO, fontWeight: 500, fontSize: 17 * u, letterSpacing: '0.08em', textTransform: 'uppercase', color, opacity: 0.75 * opacity, whiteSpace: 'nowrap' };
  const m = 42 * u;
  return (
    <>
      <span style={{ ...s, left: m, top: m }}>PassingBy</span>
      <span style={{ ...s, right: m, top: m }}>{index}</span>
      <span style={{ ...s, left: m, bottom: m }}>{spec}</span>
      <span style={{ ...s, right: m, bottom: m }}>London</span>
    </>
  );
};

// A landmark photo in the postcard's white mount (.v2-pc-mount).
export const Mounted: React.FC<{ landmark: Landmark; width: number; style?: React.CSSProperties }> = ({ landmark, width, style }) => {
  const k = width / 200;
  return (
    <div style={{
      position: 'absolute', width, height: width * 1.2, padding: 8 * k, borderRadius: 12 * k, background: '#fff',
      boxShadow: `0 ${10 * k}px ${30 * k}px rgba(0,0,0,0.18)`, ...style,
    }}>
      <Img src={staticFile('landmarks/' + landmark.photo)} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 * k, display: 'block' }} />
    </div>
  );
};

// Gooey blob: circles blurred together and thresholded, so they merge like liquid.
export const Goo: React.FC<{ id: string; width: number; height: number; circles: { x: number; y: number; r: number }[]; color: string; softness: number }> = ({ id, width, height, circles, color, softness }) => (
  <svg width={width} height={height} style={{ position: 'absolute', left: 0, top: 0 }}>
    <defs>
      <filter id={id} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation={softness} result="b" />
        <feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -10" />
      </filter>
    </defs>
    <g filter={`url(#${id})`} fill={color}>
      {circles.map((c, i) => <circle key={i} cx={c.x} cy={c.y} r={Math.max(0, c.r)} />)}
    </g>
  </svg>
);

// Depth of field: blur grows with distance from the focus plane.
export const dof = (depth: number, focus: number, strength: number) => Math.min(24, Math.abs(depth - focus) * strength);
