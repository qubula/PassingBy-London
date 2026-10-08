// Beat 8, flow B: the sticker on the back of a cab seat. A phone moves in,
// the camera locks on the QR code, and the landing page opens.
// Sticker: Figma "★ 06 · Chosen sticker (Kuba) · master" (page "★ PassingBy — Sticker & QR").
import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { BEATS, COLORS, COPY, sec } from '../config';
import { Phone, PHONE_H, PHONE_W, StatusBar } from '../components/Phone';
import { Caption } from '../components/Caption';
import { useLayout } from '../layout';
import { SANS } from '../fonts';
import { SOFT, SNAP, lerp, ramp, sp } from '../anim';

// sticker.png is 1008 × 1600; the QR code's centre and size in that image.
const IMG = { w: 1008, h: 1600 };
const QR = { x: 345, y: 975, size: 400 };
const LOCK_AT = sec(1.5);
const OPEN_AT = sec(2.7);
const YELLOW = '#FFD60A';

export const BlackCab: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = useLayout();

  const sh = (L.wide ? 860 : 820) * L.u;
  const sw = sh * (IMG.w / IMG.h);
  const sx = L.wide ? L.cx - sw / 2 - 150 * L.u : L.width / 2 - sw / 2 - 130 * L.u;
  const sy = L.wide ? L.cy - sh / 2 : 420 * L.u;
  const stickerIn = sp(frame, fps, 0, SOFT);

  const pw = 380 * L.u;
  const k = pw / PHONE_W;
  const ph = PHONE_H * k;
  const phoneIn = sp(frame, fps, sec(0.35), SOFT);
  const px = L.wide ? L.cx + 120 * L.u : L.width - pw - 60 * L.u;
  const py = L.wide ? L.cy - ph / 2 + 40 * L.u : 470 * L.u;

  const lock = sp(frame, fps, LOCK_AT, SNAP);
  const banner = sp(frame, fps, LOCK_AT + sec(0.4), SNAP);
  const open = sp(frame, fps, OPEN_AT, { damping: 26, stiffness: 90, mass: 1 });
  const out = ramp(frame, BEATS.blackCab - sec(0.3), BEATS.blackCab);

  // Camera view inside the phone: the sticker, scaled so the QR fills the middle.
  const s = 0.72;
  const drift = (1 - lock) * 8;
  const camLeft = 195 - QR.x * s + Math.sin(frame / 5) * drift;
  const camTop = 380 - QR.y * s + Math.cos(frame / 6) * drift;
  const box = lerp(lock, 330, QR.size * s + 16);

  return (
    <AbsoluteFill style={{ background: '#151618', opacity: 1 - out }}>
      {/* seat back: dark leather with a stitched seam */}
      <AbsoluteFill style={{
        background: 'radial-gradient(ellipse at 40% 35%, #2a2c30 0%, #18191c 55%, #0f1012 100%)',
      }} />
      <AbsoluteFill style={{
        backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.018) 0 2px, transparent 2px 7px)',
      }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: sy - 60 * L.u, borderTop: `2px dashed rgba(255,255,255,0.10)` }} />

      <Img src={staticFile('figma/sticker.png')} style={{
        position: 'absolute', left: sx, top: sy, width: sw, height: sh,
        transform: `rotate(-2deg) scale(${0.96 + 0.04 * stickerIn})`, opacity: stickerIn,
        filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))',
      }} />

      <Phone statusBar={false} island width={pw} style={{
        left: px + (1 - phoneIn) * 500 * L.u, top: py + (1 - phoneIn) * 300 * L.u,
        transform: `rotate(${lerp(phoneIn, 12, -3)}deg)`,
        filter: 'drop-shadow(0 40px 60px rgba(0,0,0,0.55))',
      }}>
        {/* camera */}
        <div style={{ position: 'absolute', inset: 0, background: '#1d1e21', overflow: 'hidden' }}>
          <Img src={staticFile('figma/sticker.png')} style={{
            position: 'absolute', left: camLeft, top: camTop, width: IMG.w * s, height: IMG.h * s, filter: `blur(${(1 - lock) * 1.2}px)`,
          }} />
          <Corners x={195} y={380} size={box} opacity={ramp(frame, sec(0.8), sec(1.05))} />
          {/* QR banner */}
          <div style={{
            position: 'absolute', left: 40, right: 40, top: 600, padding: '14px 18px', borderRadius: 18,
            background: 'rgba(250,250,250,0.92)', display: 'flex', alignItems: 'center', gap: 12,
            fontFamily: SANS, fontSize: 15, color: '#111',
            transform: `translateY(${(1 - banner) * 30}px)`, opacity: banner,
          }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: '#111', display: 'grid', placeItems: 'center', color: '#fff', fontSize: 15 }}>↗</div>
            <div><div style={{ fontWeight: 600 }}>Website QR code</div><div style={{ color: '#555' }}>Open “passingby.uk” in Safari</div></div>
          </div>
        </div>
        {/* landing opens */}
        <div style={{ position: 'absolute', inset: 0, transform: `translateY(${(1 - open) * 844}px)` }}>
          <Img src={staticFile('shared/screens/landing.png')} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          <StatusBar dark={false} />
        </div>
      </Phone>

      <Caption text={COPY.blackCab} color={COLORS.white} delay={sec(0.2)} out={BEATS.blackCab - sec(0.35)} />
    </AbsoluteFill>
  );
};

const Corners: React.FC<{ x: number; y: number; size: number; opacity: number }> = ({ x, y, size, opacity }) => {
  const arm = size * 0.16;
  const b = `4px solid ${YELLOW}`;
  const c: React.CSSProperties = { position: 'absolute', width: arm, height: arm, borderRadius: 6 };
  return (
    <div style={{ position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, opacity }}>
      <div style={{ ...c, left: 0, top: 0, borderLeft: b, borderTop: b }} />
      <div style={{ ...c, right: 0, top: 0, borderRight: b, borderTop: b }} />
      <div style={{ ...c, left: 0, bottom: 0, borderLeft: b, borderBottom: b }} />
      <div style={{ ...c, right: 0, bottom: 0, borderRight: b, borderBottom: b }} />
    </div>
  );
};
