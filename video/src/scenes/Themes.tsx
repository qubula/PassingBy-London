// Beat 6: the nine theme tiles drop into the grid in their own colours, the
// picked theme lifts, and its colour washes over the frame.
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { BEATS, COLORS, COPY, THEME_PICK, sec } from '../config';
import { EDITIONS, EDITION_KEYS } from '../editions';
import { ThemeTile, TILE_H, TILE_W } from '../components/ThemeTile';
import { Caption } from '../components/Caption';
import { useLayout } from '../layout';
import { BOUNCE, SNAP, ramp, sp } from '../anim';

const LIFT_AT = sec(1.3);
const WASH_AT = sec(1.7);

export const Themes: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = useLayout();
  const tw = (L.wide ? 260 : 290) * L.u;
  const th = tw * (TILE_H / TILE_W);
  const gap = 18 * L.u;
  const cols = 3;
  const gw = cols * tw + (cols - 1) * gap;
  const gh = 3 * th + 2 * gap;
  const gx = L.cx - gw / 2;
  const gy = L.wide ? L.cy - gh / 2 : L.cy - gh / 2 + 40 * L.u;

  const lift = sp(frame, fps, LIFT_AT, SNAP);
  const wash = ramp(frame, WASH_AT, WASH_AT + sec(0.6));
  // The picked tile keeps growing slowly on the colour, so the frame never sits still.
  const drift = ramp(frame, WASH_AT, BEATS.themes, (x: number) => x);
  const pickIdx = EDITION_KEYS.indexOf(THEME_PICK);
  const pc = pickIdx % cols, pr = Math.floor(pickIdx / cols);
  const pickX = gx + pc * (tw + gap) + tw / 2;
  const pickY = gy + pr * (th + gap) + th / 2;
  const radius = Math.hypot(L.width, L.height) * wash;
  const onColour = wash > 0.35;

  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      {EDITION_KEYS.map((key, i) => ({ key, i })).sort((a, b) => Number(a.key === THEME_PICK) - Number(b.key === THEME_PICK)).map(({ key, i }) => {
        const c = i % cols, r = Math.floor(i / cols);
        const t = sp(frame, fps, ((c + r) * 3 + c) * sec(0.05), BOUNCE);
        const picked = key === THEME_PICK;
        const scale = (0.6 + 0.4 * t) * (picked ? 1 + 0.12 * lift + 0.1 * drift : 1 - 0.04 * lift);
        const tile = (
          <ThemeTile key={key} edition={key} width={tw} style={{
            left: gx + c * (tw + gap), top: gy + r * (th + gap) - (1 - t) * 120 * L.u,
            opacity: Math.min(1, t * 2) * (picked ? 1 : 1 - 0.45 * lift),
            transform: `scale(${scale})`,
            boxShadow: picked ? `0 ${30 * lift * L.u}px ${60 * lift * L.u}px rgba(20,10,60,${0.35 * lift})` : undefined,
            borderRadius: 12 * (tw / TILE_W),
          }} />
        );
        if (!picked) return tile;
        // The colour washes out from behind the picked tile.
        return (
          <React.Fragment key={key}>
            <AbsoluteFill style={{ background: shade(EDITIONS[THEME_PICK].body, 0.3), clipPath: `circle(${radius}px at ${pickX}px ${pickY}px)` }} />
            {tile}
          </React.Fragment>
        );
      })}

      <Caption text={COPY.themes} sub={COPY.themesSub} color={onColour ? '#fff' : COLORS.ink} delay={sec(0.05)} out={BEATS.themes - sec(0.25)} />
    </AbsoluteFill>
  );
};

// The wash is the theme colour, a shade darker, so the picked tile still reads on it.
const shade = (hex: string, amount: number) => {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => Math.round(v * (1 - amount)));
  return `rgb(${c.join(',')})`;
};
