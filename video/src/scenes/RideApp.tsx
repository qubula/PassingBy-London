// Beat 5, flow A: a generic ride app (concept, no real logos). The phone comes
// up, a tap lands on "Scenic route", and the camera pushes in on the price.
// Screen: Figma "RA1 · Choose a ride" (page "★ PassingBy — Live Activity & ride app").
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { BEATS, COLORS, COPY, sec } from '../config';
import { Phone, PHONE_H, PHONE_W } from '../components/Phone';
import { Caption } from '../components/Caption';
import { useLayout } from '../layout';
import { SANS } from '../fonts';
import { SOFT, SNAP, lerp, ramp, sp } from '../anim';

// The "Scenic route" row in the 390 × 844 screen.
const ROW = { x: 195, y: 593 };
const TAP_AT = sec(1.35);

export const RideApp: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = useLayout();
  const pw = (L.wide ? 440 : 500) * L.u;
  const k = pw / PHONE_W;
  const ph = PHONE_H * k;
  const left = L.cx - pw / 2;
  const top = L.wide ? L.cy - ph / 2 : 360 * L.u;

  const enter = sp(frame, fps, -sec(0.35), SOFT); // already rising at the cut
  const tap = ramp(frame, TAP_AT, TAP_AT + sec(0.6));
  const press = sp(frame, fps, TAP_AT, SNAP) - sp(frame, fps, TAP_AT + sec(0.25), SNAP);
  const zoom = sp(frame, fps, TAP_AT + sec(0.5), { damping: 26, stiffness: 50, mass: 1 });

  // Camera: push in on the row (screen point -> page point), keeping it in the picture area.
  const rowX = left + (12 + 3.5 + ROW.x) * k;
  const rowY = top + (12 + 3.5 + ROW.y) * k;
  const Z = lerp(zoom, 1, L.wide ? 1.9 : 1.7);
  const targetX = L.cx;
  const targetY = L.wide ? L.cy + 40 * L.u : L.cy + 120 * L.u;
  const camX = lerp(zoom, 0, targetX - rowX);
  const camY = lerp(zoom, 0, targetY - rowY);

  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      <AbsoluteFill style={{ clipPath: L.wide ? `inset(0 0 0 ${L.width * 0.4}px)` : `inset(${330 * L.u}px 0 0 0)` }}>
      <AbsoluteFill style={{
        transformOrigin: `${rowX}px ${rowY}px`,
        transform: `translate(${camX}px, ${camY + (1 - enter) * L.height * 0.9}px) scale(${Z})`,
      }}>
        <Phone screen="figma/ride-choose.png" statusBar={false} island={false} width={pw} style={{ left, top }}>
          {/* tap: press on the row, then a ripple */}
          <div style={{
            position: 'absolute', left: 14, top: ROW.y - 62, width: 362, height: 124, borderRadius: 14,
            background: `rgba(0,0,0,${0.06 * press})`,
          }} />
          {tap > 0 && tap < 1 ? (
            <div style={{
              position: 'absolute', left: ROW.x + 70 - 60, top: ROW.y - 60, width: 120, height: 120, borderRadius: '50%',
              border: '3px solid rgba(0,0,0,0.5)', transform: `scale(${0.3 + tap * 1.2})`, opacity: 1 - tap,
            }} />
          ) : null}
        </Phone>
      </AbsoluteFill>
      </AbsoluteFill>

      {/* price chip */}
      <PriceChip L={L} frame={frame} fps={fps} start={TAP_AT + sec(1.0)} out={BEATS.rideApp - sec(0.25)} />

      <Caption text={COPY.rideApp} delay={0} out={BEATS.rideApp - sec(0.25)} />
    </AbsoluteFill>
  );
};

const PriceChip: React.FC<{ L: ReturnType<typeof useLayout>; frame: number; fps: number; start: number; out: number }> = ({ L, frame, fps, start, out }) => {
  const t = sp(frame, fps, start, SNAP);
  const o = ramp(frame, out, out + 10);
  const fs = (L.wide ? 54 : 58) * L.u;
  const pos = L.wide
    ? { left: 140 * L.u, top: L.cy + 150 * L.u }
    : { left: L.width / 2, top: 350 * L.u, transform: 'translateX(-50%)' };
  return (
    <div style={{ position: 'absolute', ...pos }}>
      <div style={{
        padding: `${14 * L.u}px ${30 * L.u}px`, borderRadius: 999, background: COLORS.ink, color: '#fff',
        fontFamily: SANS, fontWeight: 700, fontSize: fs, letterSpacing: '-0.02em', whiteSpace: 'nowrap',
        transform: `translateY(${(1 - t) * 40 * L.u}px) scale(${0.9 + 0.1 * t})`, opacity: Math.min(1, t * 1.5) * (1 - o),
      }}>{COPY.rideAppPrice}</div>
    </div>
  );
};
