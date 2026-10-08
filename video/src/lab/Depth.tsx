// Lab cut, part 2: everything the app does, floating at different depths on
// black. The camera pulls focus from one piece to the next instead of cutting:
// ride app → themes → the ride → the sticker, then back out.
import React from 'react';
import { AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, COPY, LANDMARKS, THEME_PICK, sec } from '../config';
import { Phone, PHONE_H, PHONE_W } from '../components/Phone';
import { Postcard, CARD_H, CARD_W } from '../components/Postcard';
import { ThemeTile, TILE_H, TILE_W } from '../components/ThemeTile';
import { Caption } from '../components/Caption';
import { useLayout } from '../layout';
import { SANS } from '../fonts';
import { lerp, ramp, sp } from '../anim';
import { Mounted, dof } from './pieces';
import { ThemeBadge } from '../scenes/Ride';

export const DEPTH_LEN = sec(13);
const lm = (n: string) => LANDMARKS.find(l => l.name === n)!;

// World positions in px at 1080, depth d (1 = the main plane).
const A = { x: -600, y: -80, d: 1.0, w: 400 }; // ride app
const B = { x: 560, y: -460, d: 0.85, w: 640 }; // theme tiles
const C = { x: 430, y: 430, d: 1.15, w: 400 }; // the ride
const D = { x: -620, y: 1150, d: 0.8, w: 420 }; // sticker

type Stop = { t: number; x: number; y: number; zoom: number; focus: number };
const fit = (o: { x: number; y: number; d: number; w: number }, shown: number, t: number): Stop =>
  ({ t, x: o.x * o.d, y: o.y * o.d, zoom: shown / (o.w * o.d), focus: o.d });
const STOPS: Stop[] = [
  { t: 0, x: 0, y: 300, zoom: 0.5, focus: 1 },
  fit(A, 450, 0.9),
  fit(B, 720, 4.1),
  fit(C, 450, 7.0),
  fit(D, 470, 9.9),
  { t: 12.0, x: 0, y: 300, zoom: 0.5, focus: 1 },
];
const TAP = 2.2, LIFT = 5.3, MORPH = 7.7, ISLAND = 8.7, LOCK = 10.7;

export const Depth: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = useLayout();
  const u = L.u;
  const t = frame / fps;

  // camera: each stop springs in from the previous one, with a slow drift on top
  let cam = { ...STOPS[0] };
  for (const s of STOPS.slice(1)) {
    const p = sp(frame, fps, sec(s.t), { damping: 26, stiffness: 38, mass: 1 });
    cam = { t: 0, x: lerp(p, cam.x, s.x), y: lerp(p, cam.y, s.y), zoom: lerp(p, cam.zoom, s.zoom), focus: lerp(p, cam.focus, s.focus) };
  }
  cam.x += Math.sin(t * 0.35) * 18;
  cam.y += Math.cos(t * 0.3) * 12;

  const place = (o: { x: number; y: number; d: number }, w: number, h: number, extra: React.CSSProperties = {}): React.CSSProperties => {
    const s = o.d * cam.zoom * u;
    const sx = L.cx + (o.x * o.d - cam.x) * cam.zoom * u;
    const sy = L.cy + (o.y * o.d - cam.y) * cam.zoom * u;
    const blur = dof(o.d, cam.focus, 16) + Math.max(0, 0.55 - cam.zoom) * 6;
    return {
      position: 'absolute', left: sx - w / 2, top: sy - h / 2, width: w, height: h,
      transform: `scale(${s})`, filter: blur > 0.3 ? `blur(${blur}px)` : undefined, ...extra,
    };
  };

  const tap = ramp(frame, sec(TAP), sec(TAP + 0.6));
  const chip = sp(frame, fps, sec(TAP + 0.5), { damping: 18, stiffness: 120, mass: 1 });
  const lift = sp(frame, fps, sec(LIFT), { damping: 18, stiffness: 120, mass: 1 });
  const m = sp(frame, fps, sec(MORPH), { damping: 24, stiffness: 70, mass: 1 });
  const isl = sp(frame, fps, sec(ISLAND), { damping: 17, stiffness: 110, mass: 1 });
  const lock = sp(frame, fps, sec(LOCK), { damping: 18, stiffness: 140, mass: 1 });
  const tiles = ['historical', THEME_PICK, 'royal'];
  const iw = lerp(isl, 125, 371), ih = lerp(isl, 37, 180);
  const MINI = { top: 639, right: 20, bottom: 76, left: 21, r: 18 };
  const clip = `inset(${lerp(m, MINI.top, 0)}px ${lerp(m, MINI.right, 0)}px ${lerp(m, MINI.bottom, 0)}px ${lerp(m, MINI.left, 0)}px round ${lerp(m, MINI.r, 0)}px)`;

  // phones and pieces are drawn at their own size, then scaled by place()
  const phoneH = (A.w * PHONE_H) / PHONE_W;
  const stickerH = D.w * (1600 / 1008);
  const intro = ramp(frame, 0, sec(0.8));

  return (
    <AbsoluteFill style={{ background: COLORS.black, overflow: 'hidden', opacity: intro }}>
      {/* soft background shapes, far behind */}
      <Mounted landmark={lm('London Eye')} width={260} style={place({ x: -80, y: -820, d: 0.5 }, 260, 312, { opacity: 0.8 })} />
      <Mounted landmark={lm('The Shard')} width={300} style={place({ x: -1300, y: 260, d: 0.55 }, 300, 360, { opacity: 0.7 })} />

      {/* D: the sticker */}
      <div style={place(D, D.w, stickerH)}>
        <Img src={staticFile('figma/sticker.png')} style={{ width: '100%', height: '100%' }} />
        <Corners size={170} x={D.w * 0.342} y={stickerH * 0.61} t={lock} />
      </div>

      {/* B: theme tiles */}
      <div style={place(B, B.w, (B.w / 3) * (TILE_H / TILE_W))}>
        {tiles.map((k, i) => {
          const tw = (B.w - 40) / 3;
          const picked = k === THEME_PICK;
          return (
            <ThemeTile key={k} edition={k} width={tw} style={{
              left: i * (tw + 20), top: picked ? -30 * lift : 0, transform: `scale(${picked ? 1 + 0.12 * lift : 1 - 0.04 * lift})`,
              boxShadow: picked ? `0 ${30 * lift}px ${60 * lift}px rgba(0,0,0,${0.5 * lift})` : undefined, borderRadius: 12 * (tw / TILE_W),
              opacity: picked ? 1 : 1 - 0.4 * lift,
            }} />
          );
        })}
      </div>

      {/* A: ride app, with the tap and the price */}
      <div style={place(A, A.w, phoneH)}>
        <Phone screen="figma/ride-choose.png" statusBar={false} island={false} width={A.w} style={{ left: 0, top: 0 }}>
          {tap > 0 && tap < 1 ? (
            <div style={{ position: 'absolute', left: 205, top: 533, width: 120, height: 120, borderRadius: '50%', border: '3px solid rgba(0,0,0,0.5)', transform: `scale(${0.3 + tap * 1.2})`, opacity: 1 - tap }} />
          ) : null}
        </Phone>
        <div style={{
          position: 'absolute', left: A.w * 0.5, top: phoneH * 0.86, transform: `translate(-50%, ${(1 - chip) * 30}px) scale(${0.9 + 0.1 * chip})`, opacity: chip,
          padding: '12px 26px', borderRadius: 999, background: '#fff', color: COLORS.ink, fontFamily: SANS, fontWeight: 700, fontSize: 40, whiteSpace: 'nowrap',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        }}>{COPY.rideAppPrice}</div>
      </div>

      {/* C: the ride: map, postcard morph, Dynamic Island */}
      <div style={place(C, C.w, phoneH)}>
        <Phone screen="shared/screens/ridemap.png" statusBar="dark" island={false} width={C.w} style={{ left: 0, top: 0 }}>
          <Img src={staticFile('shared/screens/postcard.png')} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', clipPath: clip, opacity: m > 0.001 ? 1 : 0 }} />
          <ThemeBadge edition={THEME_PICK} />
          <div style={{ position: 'absolute', top: 11, left: 195 - iw / 2, width: iw, height: ih, borderRadius: lerp(isl, 20, 46), background: '#000', zIndex: 5, overflow: 'hidden' }}>
            <Img src={staticFile('figma/island-look-left.png')} style={{ position: 'absolute', left: 0, top: 0, width: 371, height: 180, transform: `scale(${iw / 371}, ${ih / 180})`, transformOrigin: 'top left', opacity: ramp(frame, sec(ISLAND + 0.15), sec(ISLAND + 0.45)) }} />
          </div>
        </Phone>
      </div>

      {/* near, out of focus: drifts past the lens */}
      <Postcard landmark={lm('Tower Bridge')} width={CARD_W} shadow={0.5} style={place({ x: 1150, y: 120, d: 1.7 }, CARD_W, CARD_H)} />
      <Mounted landmark={lm('Westminster Abbey')} width={240} style={place({ x: -1100, y: -520, d: 1.6 }, 240, 288)} />

      {/* scrim behind the words, so blurred pieces never fight the caption */}
      <AbsoluteFill style={{ background: L.wide
        ? 'linear-gradient(90deg, rgba(11,11,12,0.92) 0%, rgba(11,11,12,0.75) 30%, rgba(11,11,12,0) 48%)'
        : 'linear-gradient(180deg, rgba(11,11,12,0.92) 0%, rgba(11,11,12,0.7) 20%, rgba(11,11,12,0) 32%)' }} />
      <Caption text={COPY.rideApp} color={COLORS.white} delay={sec(1.3)} out={sec(3.8)} />
      <Seq from={sec(4.4)}><Caption text={COPY.themes} sub={COPY.themesSub} color={COLORS.white} delay={0} out={sec(2.3)} /></Seq>
      <Seq from={sec(7.3)}><Caption text={COPY.ride} color={COLORS.white} delay={0} out={sec(2.3)} /></Seq>
      <Seq from={sec(10.2)}><Caption text={COPY.blackCab} color={COLORS.white} delay={0} out={sec(1.9)} /></Seq>
    </AbsoluteFill>
  );
};

// A Sequence, so each caption's frame count starts at 0.
const Seq: React.FC<{ from: number; children: React.ReactNode }> = ({ from, children }) => <Sequence from={from}>{children}</Sequence>;

// Yellow camera corners locking onto the QR code.
const Corners: React.FC<{ size: number; x: number; y: number; t: number }> = ({ size, x, y, t }) => {
  const s = lerp(t, size * 1.5, size);
  const arm = s * 0.18;
  const b = '5px solid #FFD60A';
  const c: React.CSSProperties = { position: 'absolute', width: arm, height: arm, borderRadius: 6 };
  return (
    <div style={{ position: 'absolute', left: x - s / 2, top: y - s / 2, width: s, height: s, opacity: Math.min(1, t * 3) }}>
      <div style={{ ...c, left: 0, top: 0, borderLeft: b, borderTop: b }} />
      <div style={{ ...c, right: 0, top: 0, borderRight: b, borderTop: b }} />
      <div style={{ ...c, left: 0, bottom: 0, borderLeft: b, borderBottom: b }} />
      <div style={{ ...c, right: 0, bottom: 0, borderRight: b, borderBottom: b }} />
    </div>
  );
};
