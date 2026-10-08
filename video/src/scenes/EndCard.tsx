// Beat 9: cards fly in from the edges and settle into a neat stack; the logo,
// tagline, address and the concept note come in beside it.
import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, COPY, LANDMARKS, sec } from '../config';
import { CARD_H, CARD_W, Postcard } from '../components/Postcard';
import { useLayout } from '../layout';
import { SANS } from '../fonts';
import { SNAP, SOFT, lerp, sp } from '../anim';

const STACK = ['Tower Bridge', 'London Eye', "St Paul's Cathedral", 'Buckingham Palace', 'Elizabeth Tower'];
const FROM = [[-1.2, 0.2], [1.3, -0.1], [-1.1, 0.9], [1.2, 0.8], [0, 1.4]];
const ROT = [-9, 7, -4, 4, -1];
const LOGO_RATIO = 2944 / 655;

export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = useLayout();
  const cw = (L.wide ? 380 : 400) * L.u;
  const ch = cw * (CARD_H / CARD_W);
  const sx = L.wide ? L.width * 0.68 : L.width / 2;
  const sy = L.wide ? L.cy : L.cy + 150 * L.u;

  const text = (delay: number) => {
    const t = sp(frame, fps, delay, SOFT);
    return { opacity: t, transform: `translateY(${(1 - t) * 24 * L.u}px)` };
  };
  const logoW = (L.wide ? 620 : 560) * L.u;
  const textBox: React.CSSProperties = L.wide
    ? { position: 'absolute', left: 140 * L.u, top: 0, bottom: 0, width: L.width * 0.42, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }
    : { position: 'absolute', left: 0, right: 0, top: 90 * L.u, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' };

  return (
    <AbsoluteFill style={{ background: COLORS.bg, fontFamily: SANS, color: COLORS.ink }}>
      {STACK.map((name, i) => {
        const lm = LANDMARKS.find(l => l.name === name)!;
        const t = sp(frame, fps, i * sec(0.15), SNAP);
        const x = sx + lerp(t, FROM[i][0] * L.width, 0);
        const y = sy + lerp(t, FROM[i][1] * L.height, 0);
        const rot = lerp(t, ROT[i] * 4, ROT[i]);
        return (
          <Postcard key={name} landmark={lm} width={cw} shadow={0.5}
            style={{ left: x - cw / 2, top: y - ch / 2, transform: `rotate(${rot}deg)` }} />
        );
      })}

      <div style={textBox}>
        <Img src={staticFile('shared/logo.png')} style={{ width: logoW, height: logoW / LOGO_RATIO, ...text(sec(0.6)) }} />
        <div style={{ marginTop: 30 * L.u, fontSize: (L.wide ? 66 : 60) * L.u, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.08, maxWidth: L.wide ? 760 * L.u : 900 * L.u, ...text(sec(0.9)) }}>
          {COPY.endTagline}
        </div>
        <div style={{ marginTop: 26 * L.u, fontSize: 40 * L.u, fontWeight: 500, ...text(sec(1.2)) }}>{COPY.endUrl}</div>
      </div>
      <div style={{
        position: 'absolute', bottom: 46 * L.u, left: L.wide ? 140 * L.u : 0, right: L.wide ? undefined : 0,
        textAlign: L.wide ? 'left' : 'center', fontSize: 22 * L.u, color: COLORS.muted, ...text(sec(1.6)),
      }}>{COPY.endNote}</div>
    </AbsoluteFill>
  );
};
