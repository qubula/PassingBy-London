// Lab cut, part 3: the pieces fly back to the centre and melt into the dot
// the film began with; the dot closes and the logo comes out of it.
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, COPY, LANDMARKS, sec } from '../config';
import { useLayout } from '../layout';
import { SANS } from '../fonts';
import { Wordmark } from '../components/Wordmark';
import { SOFT, lerp, ramp, sp } from '../anim';
import { Goo, Mounted } from './pieces';

export const COLLAPSE_LEN = sec(5.2);
const NAMES = ['London Eye', 'Tower Bridge', "St Paul's Cathedral", 'The Shard', 'Buckingham Palace', 'Elizabeth Tower', 'Tower of London', 'Westminster Abbey'];

export const Collapse: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const L = useLayout();
  const u = L.u;
  const t = frame / fps;
  const ox = L.wide ? L.width / 2 : L.cx;
  const oy = L.wide ? L.height / 2 - 40 * u : L.height * 0.42;

  // photos come in from a ring and shrink into the centre
  const photos = NAMES.map((n, i) => {
    const a = (i / NAMES.length) * Math.PI * 2 + 0.4;
    const k = sp(frame, fps, i * sec(0.06), { damping: 22, stiffness: 55, mass: 1 });
    const r = lerp(k, Math.hypot(width, height) * 0.55, 0);
    return { n, x: ox + Math.cos(a) * r, y: oy + Math.sin(a) * r * 0.8, s: lerp(k, 1, 0.12), o: 1 - ramp(frame, sec(0.9), sec(1.3)) };
  });
  // goo dot: forms as the photos arrive, swells, then closes
  const form = ramp(frame, sec(0.8), sec(1.3));
  const close = sp(frame, fps, sec(2.0), { damping: 16, stiffness: 90, mass: 1 });
  const R = (lerp(form, 0, 70) * (1 - close)) * u;
  const sats = Array.from({ length: 5 }, (_, i) => {
    const a = (i / 5) * Math.PI * 2 + t;
    const d = 50 * u * form * (1 - form) * 4 * (1 - close);
    return { x: ox + Math.cos(a) * d, y: oy + Math.sin(a) * d, r: 22 * u * (1 - close) * form };
  });
  const text = (delay: number) => {
    const k = sp(frame, fps, delay, SOFT);
    return { opacity: k, transform: `translateY(${(1 - k) * 24 * u}px)` };
  };

  return (
    <AbsoluteFill style={{ background: COLORS.bg, fontFamily: SANS, color: COLORS.ink }}>
      {photos.map((p, i) => (
        <Mounted key={p.n} landmark={LANDMARKS.find(l => l.name === p.n)!} width={200 * u}
          style={{ left: p.x - 100 * u, top: p.y - 120 * u, transform: `scale(${p.s}) rotate(${(i - 4) * 6}deg)`, opacity: p.o }} />
      ))}
      <Goo id="collapse-goo" width={width} height={height} softness={9 * u} color={COLORS.ink}
        circles={[{ x: ox, y: oy, r: R }, ...sats]} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: oy - 90 * u, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <Wordmark size={(L.wide ? 104 : 96) * u} style={text(sec(2.15))} />
        <div style={{ marginTop: 30 * u, fontSize: (L.wide ? 60 : 56) * u, fontWeight: 700, letterSpacing: '-0.03em', ...text(sec(2.45)) }}>{COPY.endTagline}</div>
      </div>
      <div style={{ position: 'absolute', bottom: 100 * u, left: 0, right: 0, textAlign: 'center', fontSize: 22 * u, color: COLORS.muted, ...text(sec(3.1)) }}>{COPY.endNote}</div>
    </AbsoluteFill>
  );
};
