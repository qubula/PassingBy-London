// Beat 7: the ride. Dark map, the mini card grows into the postcard (the app's
// morph), then the camera rises to the Dynamic Island as it expands to "Look left".
// Screens: the 3x mockup exports (Figma 04d) and DI4 "Look left" (Live Activity page).
import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { BEATS, COLORS, COPY, THEME_PICK, sec } from '../config';
import { EDITIONS } from '../editions';
import { Phone, PHONE_H, PHONE_W } from '../components/Phone';
import { Caption } from '../components/Caption';
import { useLayout } from '../layout';
import { SOFT, lerp, ramp, sp } from '../anim';

// Mini card on the map screen, in 390 × 844 screen points.
const MINI = { top: 639, right: 20, bottom: 76, left: 21, r: 18 };
export const MORPH_AT = sec(0.9);
export const ZOOM_AT = sec(2.7);
export const ISLAND_AT = sec(3.0);

export const Ride: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = useLayout();
  const pw = 440 * L.u;
  const k = pw / PHONE_W;
  const ph = PHONE_H * k;
  const left = L.cx - pw / 2;
  const top = L.wide ? L.cy - ph / 2 : 400 * L.u;

  const enter = sp(frame, fps, -sec(0.3), SOFT); // already rising at the cut
  const m = sp(frame, fps, MORPH_AT, { damping: 24, stiffness: 70, mass: 1 });
  const zoom = sp(frame, fps, ZOOM_AT, { damping: 30, stiffness: 55, mass: 1 });
  const isl = sp(frame, fps, ISLAND_AT, { damping: 22, stiffness: 120, mass: 1 });

  const clip = `inset(${lerp(m, MINI.top, 0)}px ${lerp(m, MINI.right, 0)}px ${lerp(m, MINI.bottom, 0)}px ${lerp(m, MINI.left, 0)}px round ${lerp(m, MINI.r, 0)}px)`;

  // Island grows from the pill (125 × 37) to the expanded activity (371 × 180).
  const iw = lerp(isl, 125, 371);
  const ih = lerp(isl, 37, 180);

  // Camera: rise to the island.
  const islX = left + pw / 2;
  const islY = top + (15.5 + 11 + ih / 2) * k;
  const Z = lerp(zoom, 1, L.wide ? 1.7 : 1.6);
  const tx = lerp(zoom, 0, L.cx - islX);
  const ty = lerp(zoom, 0, (L.wide ? L.cy - 40 * L.u : L.cy - 20 * L.u) - islY);

  return (
    <AbsoluteFill style={{ background: COLORS.black }}>
      <AbsoluteFill style={{
        transformOrigin: `${islX}px ${islY}px`,
        transform: `translate(${tx}px, ${ty + (1 - enter) * 160 * L.u}px) scale(${Z * (0.94 + 0.06 * enter)})`,
        opacity: Math.min(1, enter * 1.4),
      }}>
        <Phone screen="shared/screens/ridemap.png" statusBar="dark" island={false} width={pw} style={{ left, top }}>
          <Img src={staticFile('shared/screens/postcard.png')} style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', clipPath: clip,
            opacity: m > 0.001 ? 1 : 0,
          }} />
          {/* The screens were exported with the Royal badge; draw the picked theme's badge over it. */}
          <ThemeBadge edition={THEME_PICK} />
          {/* Once the island pops up, whatever is under it is hidden, so nothing
              shows round its edge. */}
          <div style={{
            position: 'absolute', left: 0, right: 0, top: 0, height: 215, zIndex: 4, pointerEvents: 'none',
            background: 'linear-gradient(180deg, #000 0%, #000 86%, rgba(0,0,0,0) 100%)',
            opacity: ramp(frame, ISLAND_AT, ISLAND_AT + sec(0.2)),
          }} />
          {/* Dynamic Island */}
          <div style={{
            position: 'absolute', top: 11, left: 195 - iw / 2, width: iw, height: ih, borderRadius: lerp(isl, 20, 46),
            background: '#000', zIndex: 5, overflow: 'hidden', boxShadow: isl > 0.05 ? '0 10px 30px rgba(0,0,0,0.35)' : undefined,
          }}>
            {/* the content stays at its real size; the growing island reveals it */}
            <Img src={staticFile('figma/island-look-left.png')} style={{
              position: 'absolute', left: (iw - 371) / 2, top: 0, width: 371, height: 180,
              opacity: ramp(frame, ISLAND_AT + sec(0.1), ISLAND_AT + sec(0.35)),
            }} />
          </div>
        </Phone>
      </AbsoluteFill>
      <Caption text={COPY.ride} color={COLORS.white} delay={0} out={BEATS.ride - sec(0.25)} />
    </AbsoluteFill>
  );
};

// The ride's theme badge (.v2-badge in v2.css, filled by tour_logic.js), at its
// place in the next-stop card: 36 pt circle, theme body colour, accent glyph.
export const ThemeBadge: React.FC<{ edition: string }> = ({ edition }) => {
  const e = EDITIONS[edition];
  return (
    <div style={{
      position: 'absolute', left: 61.7 - 19, top: 96 - 19, width: 38, height: 38, borderRadius: '50%', background: '#fff', zIndex: 2,
      display: 'grid', placeItems: 'center',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%', background: e.body, display: 'grid', placeItems: 'center',
        boxShadow: e.light ? 'inset 0 0 0 1px rgba(0,0,0,0.1)' : undefined,
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill={e.accent} dangerouslySetInnerHTML={{ __html: e.glyph }} />
      </div>
    </div>
  );
};
