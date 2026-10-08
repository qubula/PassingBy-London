// Beats 1–4 as one continuous shot, so the cards never cut:
// hook (one card drops and spins) → deck (cards stack, counter) →
// fan (the deck fans out, one card rises and flips) → Alfie (the rest fall away,
// the story stays, Alfie's waveform draws under it).
import React from 'react';
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ALFIE, BEATS, COLORS, COPY, HERO, LANDMARKS, LANDMARK_LABEL, PICKED, sec } from '../config';
import { CARD_H, CARD_W, Postcard } from '../components/Postcard';
import { Caption } from '../components/Caption';
import { Waveform } from '../components/Waveform';
import { useLayout } from '../layout';
import { SNAP, SOFT, lerp, ramp, sp } from '../anim';

// Deck order, bottom to top. The hero lands first; the picked card sits mid-deck.
const DECK_NAMES = [HERO, 'London Eye', 'Tower Bridge', "St Paul's Cathedral", PICKED, 'The Shard', 'Westminster Abbey', 'Tower of London'];
const DECK = DECK_NAMES.map(n => LANDMARKS.find(l => l.name === n)!);
const JITTER = [-4, 3, -2, 5, -3, 2, -5, 1.5];
const JX = [0, 6, -5, 4, -3, 5, -6, 2];
const JY = [0, -4, 3, -2, 5, -3, 2, -1];

const T = {
  cut: sec(1.25), // black to grey, as the hero card lands
  deck: BEATS.hook,
  fan: BEATS.hook + BEATS.deck,
  pick: BEATS.hook + BEATS.deck + sec(1.1),
  flip: BEATS.hook + BEATS.deck + sec(1.8),
  alfie: BEATS.hook + BEATS.deck + BEATS.fan,
  end: BEATS.hook + BEATS.deck + BEATS.fan + BEATS.alfie,
};

export const Cards: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = useLayout();
  const cw = (L.wide ? 380 : 430) * L.u;
  const ch = cw * (CARD_H / CARD_W);
  const pickIndex = DECK_NAMES.indexOf(PICKED);

  const fanT = sp(frame, fps, T.fan, SOFT);
  const pickT = sp(frame, fps, T.pick, SNAP);
  const flipT = sp(frame, fps, T.flip, { damping: 20, stiffness: 120, mass: 1 });
  const fallT = sp(frame, fps, T.alfie, { damping: 26, stiffness: 70, mass: 1 });
  const storyT = ramp(frame, T.flip + sec(0.5), T.end, (x: number) => x);

  // Where the story card settles for the Alfie beat, and the waveform under it.
  const restY = L.wide ? L.cy - 70 * L.u : L.cy - 60 * L.u;
  const waveTop = L.wide ? L.cy + 300 * L.u : L.height - 200 * L.u;
  const waveW = L.wide ? 820 * L.u : L.width - 160 * L.u;

  const cards = DECK.map((lm, i) => {
    // Drop: the hero first, then the others on a quick rhythm.
    const dropAt = i === 0 ? 0 : T.deck + sec(0.2) + (i - 1) * sec(0.28);
    const d = sp(frame, fps, dropAt, i === 0 ? { damping: 22, stiffness: 50, mass: 1 } : SNAP);
    const startRot = i === 0 ? -364 : JITTER[i] * 6;
    let x = L.cx + JX[i] * L.u;
    let y = lerp(d, -ch * 1.3, L.cy + JY[i] * L.u);
    let rot = lerp(d, startRot, JITTER[i]);
    let scale = lerp(d, i === 0 ? 1.7 : 1.25, 1);
    let flip = 0;
    let z = i;
    let opacity = frame >= dropAt - 1 ? 1 : 0;

    // Fan: an arc around a pivot below the deck.
    const span = L.wide ? 19 : 21;
    const R = (L.wide ? 1000 : 900) * L.u;
    const a = ((i / (DECK.length - 1)) * 2 - 1) * span * fanT;
    const rad = (a * Math.PI) / 180;
    x += R * Math.sin(rad) + (L.wide ? 90 * L.u * fanT * (1 - pickT * (i === pickIndex ? 1 : 0)) : 0);
    y += R * (1 - Math.cos(rad)) + 40 * L.u * fanT;
    rot = lerp(fanT, rot, a);

    if (i === pickIndex) {
      // Out of the fan, to the top, then flip.
      x = lerp(pickT, x, L.cx);
      y = lerp(pickT, y, L.cy - 60 * L.u);
      rot = lerp(pickT, rot, 0);
      scale = lerp(pickT, scale, 1.18);
      if (pickT > 0.01) z = 100;
      flip = flipT;
      // Alfie: settle above the waveform.
      y = lerp(fallT, y, restY);
      scale = lerp(fallT, scale, L.wide ? 0.98 : 1);
    } else {
      // The rest dip while the picked card rises, then fall away for Alfie.
      y += 30 * L.u * pickT + fallT * (L.height + ch);
      rot += fallT * (i - pickIndex) * 6;
      scale *= 1 - 0.04 * pickT;
    }
    return { lm, x, y, rot, scale, flip, z, opacity, i };
  });

  const black = frame < T.cut;
  const count = Math.round(interpolate(ramp(frame, T.deck + sec(0.2), T.deck + sec(2.6)), [0, 1], [0, Math.floor(1300)]));
  const deckText = `${count.toLocaleString('en-GB')}${count >= 1300 ? '+' : ''} ${COPY.deck.replace(LANDMARK_LABEL + ' ', '')}`;

  return (
    <AbsoluteFill style={{ background: black ? COLORS.black : COLORS.bg }}>
      {cards.sort((p, q) => p.z - q.z).map(c => (
        <Postcard key={c.lm.name} landmark={c.lm} width={cw} flip={c.flip} story={c.i === pickIndex ? storyT : 1}
          shadow={c.i === pickIndex ? 0.6 + 0.4 * pickT : 0.5}
          style={{
            left: c.x - cw / 2, top: c.y - ch / 2, opacity: c.opacity,
            transform: `rotate(${c.rot}deg) scale(${c.scale})`,
          }} />
      ))}

      <Sequence from={0} durationInFrames={T.deck}>
        <Caption text={COPY.hook} color={black ? COLORS.white : COLORS.ink} delay={sec(0.2)} out={T.deck - sec(0.35)} />
      </Sequence>
      <Sequence from={T.deck} durationInFrames={BEATS.deck}>
        <Caption text={deckText} delay={sec(0.1)} out={BEATS.deck - sec(0.35)} />
      </Sequence>
      <Sequence from={T.fan} durationInFrames={BEATS.fan}>
        <Caption text={COPY.fan} delay={sec(0.3)} out={BEATS.fan - sec(0.35)} />
      </Sequence>
      <Sequence from={T.alfie} durationInFrames={BEATS.alfie}>
        <Caption text={COPY.alfie} delay={sec(0.2)} out={BEATS.alfie - sec(0.35)} />
        <Waveform left={L.wide ? L.cx - waveW / 2 : 80 * L.u} top={waveTop - T.alfie * 0} width={waveW} height={130 * L.u}
          color={COLORS.ink} start={sec(0.4)} />
        <Sequence from={sec(0.4)}>
          <Audio src={staticFile(ALFIE.file)} startFrom={Math.round(ALFIE.startFrom * fps)}
            endAt={Math.round((ALFIE.startFrom + ALFIE.duration) * fps)}
            volume={f => interpolate(f, [0, 3, ALFIE.duration * fps - 5, ALFIE.duration * fps], [0, 1, 1, 0], { extrapolateRight: 'clamp' })} />
        </Sequence>
      </Sequence>
    </AbsoluteFill>
  );
};
