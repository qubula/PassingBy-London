// Lab cut, part 1 (one continuous shot): a dot swells into a gooey blob and
// becomes the Elizabeth Tower postcard; a collage of landmarks bursts out
// around it and keeps drifting; focus pulls to Buckingham Palace, which comes
// forward and flips while everything else goes soft; Alfie reads its story.
import React from 'react';
import { AbsoluteFill, Audio, Sequence, interpolate, interpolateColors, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ALFIE, COLORS, COPY, LANDMARKS, LANDMARK_LABEL, sec, storyFor } from '../config';
import { CARD_H, CARD_W, Postcard } from '../components/Postcard';
import { ThemeTile, TILE_W } from '../components/ThemeTile';
import { Caption } from '../components/Caption';
import { Waveform } from '../components/Waveform';
import { useLayout } from '../layout';
import { spokenChars } from '../alfie';
import { SANS } from '../fonts';
import { SOFT, lerp, ramp, sp } from '../anim';
import { Goo, Mounted } from './pieces';

export const ORIGIN_LEN = sec(16.6);
const T = {
  dot: 0,
  blob: sec(0.6),
  merge: sec(1.9),
  morph: sec(2.4),
  face: sec(3.0),
  burst: sec(5.0),
  count: sec(5.3),
  pull: sec(10.0),
  flip: sec(10.9),
  voice: sec(11.8),
};

const lm = (n: string) => LANDMARKS.find(l => l.name === n)!;
type Item = { kind: 'photo' | 'tile' | 'pill' | 'card'; name: string; x: number; y: number; d: number; w: number; rot: number };
// Offsets from the centre card in px at 1080; d is depth (parallax and blur).
const ITEMS: Item[] = [
  { kind: 'photo', name: 'London Eye', x: -420, y: -250, d: 1.1, w: 180, rot: -6 },
  { kind: 'photo', name: 'Tower Bridge', x: 410, y: -300, d: 0.8, w: 160, rot: 5 },
  { kind: 'photo', name: "St Paul's Cathedral", x: -460, y: 190, d: 0.9, w: 170, rot: 4 },
  { kind: 'photo', name: 'The Shard', x: 470, y: 120, d: 1.25, w: 190, rot: -4 },
  { kind: 'photo', name: 'Westminster Abbey', x: -150, y: -400, d: 0.7, w: 140, rot: 3 },
  { kind: 'photo', name: 'Tower of London', x: 160, y: 420, d: 1.05, w: 170, rot: -3 },
  { kind: 'photo', name: 'Trafalgar Square', x: -290, y: 440, d: 1.35, w: 200, rot: 6 },
  { kind: 'tile', name: 'architecture', x: -560, y: -20, d: 0.85, w: 150, rot: -3 },
  { kind: 'tile', name: 'historical', x: 590, y: -120, d: 0.75, w: 140, rot: 4 },
  { kind: 'pill', name: 'Look left', x: 140, y: -430, d: 0.95, w: 230, rot: 0 },
  { kind: 'card', name: 'Buckingham Palace', x: 330, y: 330, d: 1.0, w: 210, rot: 7 },
];

export const Origin: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const L = useLayout();
  const u = L.u;
  const t = frame / fps;
  const cw = (L.wide ? 380 : 430) * u;
  const ch = cw * (CARD_H / CARD_W);

  // 1. Dot → blob → card
  const dotT = sp(frame, fps, T.dot, { damping: 14, stiffness: 120, mass: 1 });
  const out = sp(frame, fps, T.blob, { damping: 12, stiffness: 60, mass: 1 }) - sp(frame, fps, T.merge, { damping: 16, stiffness: 90, mass: 1 });
  const morph = sp(frame, fps, T.morph, { damping: 22, stiffness: 70, mass: 1 });
  const face = ramp(frame, T.face, T.face + sec(0.5));
  const D = 90 * u;
  const core = lerp(dotT, 0, 26 * u) + 20 * u * Math.max(0, out);
  const sats = Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2 + t * 0.9;
    const dist = Math.max(0, out) * (62 + 10 * Math.sin(t * 3 + i)) * u;
    return { x: L.cx + Math.cos(a) * dist, y: L.cy + Math.sin(a) * dist, r: (14 + 4 * Math.sin(t * 2.5 + i * 2)) * u * Math.min(1, Math.max(0, out) * 3) };
  });

  // 2. Collage burst and drift. 3. Focus pull to Buckingham Palace.
  const pull = sp(frame, fps, T.pull, { damping: 24, stiffness: 45, mass: 1 });
  const flip = sp(frame, fps, T.flip, { damping: 20, stiffness: 90, mass: 1 });
  const said = Math.min((frame - T.voice) / fps, ALFIE.duration);
  const chars = spokenChars(storyFor('Buckingham Palace'), said + ALFIE.startFrom);
  const typing = frame >= T.voice && said < ALFIE.duration;

  const restY = L.wide ? L.cy - 60 * u : L.cy - 40 * u;
  const count = Math.round(interpolate(ramp(frame, T.count, T.count + sec(2.3)), [0, 1], [0, 1300]));
  const deckText = `${count.toLocaleString('en-GB')}${count >= 1300 ? '+' : ''} ${COPY.deck.replace(LANDMARK_LABEL + ' ', '')}`;

  const items = ITEMS.map((it, i) => {
    const b = sp(frame, fps, T.burst + i * sec(0.07), { damping: 18, stiffness: 70, mass: 1 });
    const dx = Math.sin(t * 0.5 + i) * 14 * it.d * u;
    const dy = Math.cos(t * 0.42 + i * 1.7) * 12 * it.d * u;
    // in 16:9 the words sit on the left, so the collage leans right
    const ix = L.wide && it.x < 0 ? it.x * 0.7 : it.x;
    let x = L.cx + lerp(b, 0, ix * u) + dx * b;
    let y = L.cy + lerp(b, 0, it.y * u) + dy * b;
    let scale = lerp(b, 0.3, 1) * (0.85 + 0.15 * it.d);
    let rot = lerp(b, 0, it.rot) + Math.sin(t * 0.3 + i) * 2;
    let blur = Math.abs(it.d - 1) * 3 * b;
    let opacity = Math.min(1, b * 2);
    let z = Math.round(it.d * 10);
    const isHero = it.kind === 'card';
    if (isHero) {
      // forward, to the centre, larger, flat
      x = lerp(pull, x, L.cx);
      y = lerp(pull, y, restY);
      scale = lerp(pull, scale, (cw * 1.2) / (it.w * u));
      rot = lerp(pull, rot, 0);
      blur = lerp(pull, blur, 0);
      z = 100;
    } else {
      blur += 10 * pull * (0.6 + it.d * 0.4);
      opacity *= 1 - 0.55 * pull;
      scale *= 1 - 0.1 * pull;
    }
    return { it, i, x, y, scale, rot, blur, opacity, z, isHero };
  });

  const centreBlur = 10 * pull;
  const centreScale = 1 - 0.12 * pull;
  const centreOpacity = 1 - 0.6 * pull;
  const mw = lerp(morph, D, cw);
  const mh = lerp(morph, D, ch);

  return (
    <AbsoluteFill style={{ background: COLORS.bg, overflow: 'hidden' }}>
      {/* the blob, until the morph takes over */}
      {frame < T.morph + 2 ? (
        <Goo id="origin-goo" width={width} height={height} softness={9 * u} color={COLORS.ink}
          circles={[{ x: L.cx, y: L.cy, r: frame >= T.morph ? D / 2 : core }, ...sats]} />
      ) : null}

      {/* the card, growing out of the dot */}
      {frame >= T.morph ? (
        <div style={{ position: 'absolute', left: L.cx, top: L.cy, transform: `translate(-50%, -50%) scale(${centreScale})`, filter: centreBlur ? `blur(${centreBlur}px)` : undefined, opacity: centreOpacity }}>
          <div style={{
            width: mw, height: mh, borderRadius: lerp(morph, D / 2, 16 * (cw / CARD_W)),
            background: interpolateColors(morph, [0, 0.6], [COLORS.ink, '#ffffff']),
            boxShadow: `0 ${20 * morph * u}px ${50 * morph * u}px rgba(0,0,0,${0.18 * morph})`,
          }} />
          <Postcard landmark={lm('Elizabeth Tower')} width={cw} shadow={0.5} style={{ left: (mw - cw) / 2, top: (mh - ch) / 2, opacity: face }} />
        </div>
      ) : null}

      {items.sort((p, q) => p.z - q.z).map(({ it, i, x, y, scale, rot, blur, opacity, isHero }) => {
        if (frame < T.burst) return null;
        const w = it.w * u;
        const common: React.CSSProperties = {
          left: x - w / 2, top: y - (it.kind === 'pill' ? 32 * u : w * 0.6), opacity,
          transform: `rotate(${rot}deg) scale(${scale})`, filter: blur > 0.2 ? `blur(${blur}px)` : undefined,
        };
        if (it.kind === 'photo') return <Mounted key={i} landmark={lm(it.name)} width={w} style={common} />;
        if (it.kind === 'tile') return <ThemeTile key={i} edition={it.name} width={w} style={{ ...common, top: y - w * (150 / TILE_W) / 2 }} />;
        if (it.kind === 'pill') return (
          <div key={i} style={{ position: 'absolute', ...common, width: w, height: 64 * u, borderRadius: 32 * u, background: '#000', color: '#fff', display: 'flex', alignItems: 'center', gap: 12 * u, padding: `0 ${22 * u}px`, fontFamily: SANS, fontWeight: 700, fontSize: 24 * u }}>
            <span style={{ fontSize: 30 * u }}>‹</span>{it.name}
          </div>
        );
        const ph = w * (CARD_H / CARD_W);
        return (
          <Postcard key={i} landmark={lm(it.name)} width={w} flip={flip} shadow={0.4 + 0.6 * pull}
            storyChars={isHero ? chars : undefined} caret={isHero && typing}
            style={{ ...common, top: y - ph / 2 }} />
        );
      })}

      <Sequence from={0} durationInFrames={T.burst}>
        <Caption text={COPY.hook} delay={sec(0.9)} out={T.burst - sec(0.45)} />
      </Sequence>
      <Sequence from={T.burst} durationInFrames={T.pull - T.burst}>
        <Caption text={deckText} delay={sec(0.2)} out={T.pull - T.burst - sec(0.4)} />
      </Sequence>
      <Sequence from={T.pull + sec(0.6)}>
        <Caption text={COPY.alfie} delay={0} out={ORIGIN_LEN - T.pull - sec(0.6) - sec(0.4)} />
        <Waveform left={L.wide ? L.cx - 410 * u : 80 * u} top={(L.wide ? L.cy + 290 * u : L.height - 215 * u)}
          width={L.wide ? 820 * u : L.width - 160 * u} height={130 * u} color={COLORS.ink} start={T.voice - T.pull - sec(0.6)} />
      </Sequence>
      <Sequence from={T.voice}>
        <Audio src={staticFile(ALFIE.file)} startFrom={Math.round(ALFIE.startFrom * fps)}
          endAt={Math.round((ALFIE.startFrom + ALFIE.duration) * fps)}
          volume={f => interpolate(f, [0, 3, ALFIE.duration * fps - 5, ALFIE.duration * fps], [0, 1, 1, 0], { extrapolateRight: 'clamp' })} />
      </Sequence>
    </AbsoluteFill>
  );
};
