// Beat 7: the ride. Dark map, the mini card grows into the postcard (the app's
// morph), then the camera rises to the Dynamic Island as it expands to "Look left".
// Screens: the 3x mockup exports (Figma 04d) and DI4 "Look left" (Live Activity page).
import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { BEATS, COLORS, COPY } from '../config';
import { Phone, PHONE_H, PHONE_W } from '../components/Phone';
import { Caption } from '../components/Caption';
import { useLayout } from '../layout';
import { SOFT, lerp, ramp, sp } from '../anim';

// Mini card on the map screen, in 390 × 844 screen points.
const MINI = { top: 639, right: 20, bottom: 76, left: 21, r: 18 };
const MORPH_AT = 20;
const ZOOM_AT = 56;
const ISLAND_AT = 62;

export const Ride: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = useLayout();
  const pw = 440 * L.u;
  const k = pw / PHONE_W;
  const ph = PHONE_H * k;
  const left = L.cx - pw / 2;
  const top = L.wide ? L.cy - ph / 2 : 400 * L.u;

  const enter = sp(frame, fps, 0, SOFT);
  const m = sp(frame, fps, MORPH_AT, { damping: 22, stiffness: 120, mass: 1 });
  const zoom = sp(frame, fps, ZOOM_AT, { damping: 24, stiffness: 90, mass: 1 });
  const isl = sp(frame, fps, ISLAND_AT, { damping: 16, stiffness: 150, mass: 0.9 });
  const out = ramp(frame, BEATS.ride - 6, BEATS.ride);

  const clip = `inset(${lerp(m, MINI.top, 0)}px ${lerp(m, MINI.right, 0)}px ${lerp(m, MINI.bottom, 0)}px ${lerp(m, MINI.left, 0)}px round ${lerp(m, MINI.r, 0)}px)`;

  // Island grows from the pill (125 × 37) to the expanded activity (371 × 180).
  const iw = lerp(isl, 125, 371);
  const ih = lerp(isl, 37, 180);

  // Camera: rise to the island.
  const islX = left + pw / 2;
  const islY = top + (15.5 + 11 + ih / 2) * k;
  const Z = lerp(zoom, 1, L.wide ? 2.0 : 1.9);
  const tx = lerp(zoom, 0, L.cx - islX);
  const ty = lerp(zoom, 0, (L.wide ? L.cy - 40 * L.u : L.cy - 20 * L.u) - islY);

  return (
    <AbsoluteFill style={{ background: COLORS.black }}>
      <AbsoluteFill style={{
        transformOrigin: `${islX}px ${islY}px`,
        transform: `translate(${tx}px, ${ty + (1 - enter) * 160 * L.u}px) scale(${Z * (0.94 + 0.06 * enter)})`,
        opacity: Math.min(1, enter * 1.4) * (1 - out),
      }}>
        <Phone screen="shared/screens/ridemap.png" statusBar="dark" island={false} width={pw} style={{ left, top }}>
          <Img src={staticFile('shared/screens/postcard.png')} style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', clipPath: clip,
            opacity: m > 0.001 ? 1 : 0,
          }} />
          {/* Dynamic Island */}
          <div style={{
            position: 'absolute', top: 11, left: 195 - iw / 2, width: iw, height: ih, borderRadius: lerp(isl, 20, 46),
            background: '#000', zIndex: 5, overflow: 'hidden', boxShadow: isl > 0.05 ? '0 10px 30px rgba(0,0,0,0.35)' : undefined,
          }}>
            <Img src={staticFile('figma/island-look-left.png')} style={{
              position: 'absolute', left: 0, top: 0, width: 371, height: 180,
              transform: `scale(${iw / 371}, ${ih / 180})`, transformOrigin: 'top left', opacity: ramp(frame, ISLAND_AT + 4, ISLAND_AT + 12),
            }} />
          </div>
        </Phone>
      </AbsoluteFill>
      <Caption text={COPY.ride} color={COLORS.white} delay={6} out={BEATS.ride - 8} />
    </AbsoluteFill>
  );
};
