// Beats 1–5 as one continuous shot, so the cards never cut:
// hook (one card drops and spins on black; the grey opens out from it) →
// deck (cards stack fast, the count grows) → stories (photos, quotes and the
// "Look left" pill burst out around the deck; the count rolls on to stories) →
// fan (the deck fans out, one card rises and flips) → Alfie (the rest fall
// away; the story types onto the card as Alfie says it).
import React from 'react';
import { AbsoluteFill, Audio, Sequence, interpolate, interpolateColors, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  ALFIE, BEATS, COLORS, COPY, HERO, LANDMARKS, LANDMARK_ROUNDED, PICKED, QUOTES, STORY_ROUNDED, alfieCard, alfieText, sec,
} from '../config';
import { CARD_H, CARD_W, Postcard } from '../components/Postcard';
import { Caption } from '../components/Caption';
import { BigCount } from '../components/BigCount';
import { LookLeft, Quote } from '../components/Bits';
import { Waveform } from '../components/Waveform';
import { Mounted } from '../lab/pieces';
import { useLayout } from '../layout';
import { spokenChars } from '../alfie';
import { SNAP, SOFT, lerp, ramp, sp } from '../anim';

// Deck order, bottom to top. The hero lands first; the picked card sits mid-deck.
const DECK_NAMES = [HERO, 'London Eye', 'Tower Bridge', "St Paul's Cathedral", PICKED, 'The Shard', 'Westminster Abbey', 'Tower of London'];
const DECK = DECK_NAMES.map(n => LANDMARKS.find(l => l.name === n)!);
const JITTER = [-4, 3, -2, 5, -3, 2, -5, 1.5];
const JX = [0, 6, -5, 4, -3, 5, -6, 2];
const JY = [0, -4, 3, -2, 5, -3, 2, -1];
const DROP = { damping: 18, stiffness: 180, mass: 0.9 }; // quick, like the first cut

// Pieces that burst out around the deck in the stories beat. x/y are offsets
// from the deck in px at 1080; d is depth (drift and size).
type Bit = { kind: 'photo' | 'quote' | 'pill'; ref: string; x: number; y: number; w: number; rot: number; d: number };
const BITS: Bit[] = [
  { kind: 'photo', ref: 'Trafalgar Square', x: -390, y: -170, w: 170, rot: -7, d: 1.1 },
  { kind: 'photo', ref: 'Royal Albert Hall', x: 380, y: -230, w: 150, rot: 6, d: 0.9 },
  { kind: 'photo', ref: 'Natural History Museum', x: -420, y: 250, w: 160, rot: 5, d: 1.0 },
  { kind: 'photo', ref: 'Palace of Westminster', x: 410, y: 300, w: 175, rot: -5, d: 1.2 },
  { kind: 'photo', ref: 'London Eye', x: -170, y: 420, w: 140, rot: 4, d: 0.85 },
  { kind: 'photo', ref: 'Tower Bridge', x: 200, y: -360, w: 130, rot: -3, d: 0.8 },
  { kind: 'quote', ref: '0', x: 300, y: 95, w: 300, rot: 3, d: 1.05 },
  { kind: 'quote', ref: '1', x: -320, y: 40, w: 300, rot: -3, d: 1.0 },
  { kind: 'quote', ref: '2', x: 190, y: 470, w: 280, rot: -2, d: 0.95 },
  { kind: 'pill', ref: '', x: -150, y: -360, w: 0, rot: -4, d: 1.0 },
];

export const T = {
  reveal: sec(1.05), // the grey opens out from the hero card as it lands
  deck: BEATS.hook,
  stories: BEATS.hook + BEATS.deck,
  fan: BEATS.hook + BEATS.deck + BEATS.stories,
  pick: BEATS.hook + BEATS.deck + BEATS.stories + sec(0.7),
  flip: BEATS.hook + BEATS.deck + BEATS.stories + sec(1.3),
  alfie: BEATS.hook + BEATS.deck + BEATS.stories + BEATS.fan,
  end: BEATS.hook + BEATS.deck + BEATS.stories + BEATS.fan + BEATS.alfie,
  voice: BEATS.hook + BEATS.deck + BEATS.stories + sec(1.0), // Alfie starts as his card rises; the story types as he speaks
};

export const Cards: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const L = useLayout();
  const u = L.u;
  const t = frame / fps;
  const cw = (L.wide ? 380 : 430) * u;
  const ch = cw * (CARD_H / CARD_W);
  const pickIndex = DECK_NAMES.indexOf(PICKED);

  const fanT = sp(frame, fps, T.fan, SOFT);
  const pickT = sp(frame, fps, T.pick, SNAP);
  const flipT = sp(frame, fps, T.flip, { damping: 20, stiffness: 120, mass: 1 });
  const fallT = sp(frame, fps, T.alfie, { damping: 26, stiffness: 70, mass: 1 });
  const said = Math.min((frame - T.voice) / fps, ALFIE.duration);
  // What he has said so far, then the extra reading types in once he's done.
  const spoken = spokenChars(alfieCard(), said + ALFIE.startFrom);
  const afterVoice = T.voice + sec(ALFIE.duration) - sec(0.6);
  const extra = Math.round(ramp(frame, afterVoice, afterVoice + sec(1.3), (x: number) => x) * (alfieCard().length - alfieText().length));
  const storyChars = Math.max(spoken, frame >= afterVoice ? alfieText().length + extra : 0);
  const typing = frame >= T.voice && storyChars < alfieCard().length;
  // A slow push-in on the card while Alfie talks, so the frame keeps moving.
  const push = ramp(frame, T.alfie, T.end, (x: number) => x);

  // Where the story card settles for the Alfie beat, and the waveform under it.
  const restY = L.wide ? L.cy - 60 * u : L.cy - 40 * u;
  const waveTop = L.wide ? L.cy + 300 * u : L.height - 175 * u;
  const waveW = L.wide ? 820 * u : L.width - 160 * u;

  const cards = DECK.map((lm, i) => {
    const dropAt = i === 0 ? 0 : T.deck + sec(0.05) + (i - 1) * sec(0.17);
    const d = sp(frame, fps, dropAt, i === 0 ? { damping: 22, stiffness: 70, mass: 1 } : DROP);
    const startRot = i === 0 ? -364 : JITTER[i] * 6;
    let x = L.cx + JX[i] * u;
    let y = lerp(d, -ch * 1.3, L.cy + JY[i] * u);
    let rot = lerp(d, startRot, JITTER[i]);
    let scale = lerp(d, i === 0 ? 1.7 : 1.25, 1);
    let flip = 0;
    let z = i;
    const opacity = frame >= dropAt - 1 ? 1 : 0;

    // Fan: an arc around a pivot below the deck.
    const span = L.wide ? 19 : 21;
    const R = (L.wide ? 1000 : 900) * u;
    const a = ((i / (DECK.length - 1)) * 2 - 1) * span * fanT;
    const rad = (a * Math.PI) / 180;
    x += R * Math.sin(rad) + (L.wide ? 90 * u * fanT * (1 - pickT * (i === pickIndex ? 1 : 0)) : 0);
    y += R * (1 - Math.cos(rad)) + 40 * u * fanT;
    rot = lerp(fanT, rot, a);

    if (i === pickIndex) {
      x = lerp(pickT, x, L.cx);
      y = lerp(pickT, y, L.cy - 60 * u);
      rot = lerp(pickT, rot, 0);
      scale = lerp(pickT, scale, 1.18);
      if (pickT > 0.01) z = 100;
      flip = flipT;
      y = lerp(fallT, y, restY);
      scale = lerp(fallT, scale, L.wide ? 1.18 : 1.22) * (1 + 0.05 * push);
    } else {
      y += 30 * u * pickT + fallT * (L.height + ch);
      rot += fallT * (i - pickIndex) * 6;
      scale *= 1 - 0.04 * pickT;
    }
    return { lm, x, y, rot, scale, flip, z, opacity, i };
  });

  // Stories beat: the pieces burst out, drift, and are flung outwards as the deck fans.
  const exit = sp(frame, fps, T.fan - sec(0.1), { damping: 22, stiffness: 90, mass: 1 });
  const bits = BITS.map((b, i) => {
    const k = sp(frame, fps, T.stories + i * sec(0.05), { damping: 16, stiffness: 110, mass: 1 });
    const bx = L.wide && b.x < 0 ? b.x * 0.62 : b.x;
    const fling = 1 + exit * 0.9;
    const x = L.cx + (lerp(k, 0, bx) * fling + Math.sin(t * 0.6 + i) * 10 * b.d * k) * u;
    const y = L.cy + (lerp(k, 0, b.y) * fling + Math.cos(t * 0.5 + i * 1.7) * 8 * b.d * k) * u;
    const scale = lerp(k, 0.25, 1) * (0.9 + 0.1 * b.d);
    const rot = lerp(k, 0, b.rot) + Math.sin(t * 0.4 + i) * 1.5;
    return { b, i, x, y, scale, rot, opacity: Math.min(1, k * 2) * (1 - exit), show: frame >= T.stories };
  });

  // Count: 0 → 1,300 landmarks, then rolls on to 4,700 stories.
  const toLandmarks = ramp(frame, T.deck + sec(0.05), T.deck + sec(1.5));
  const toStories = ramp(frame, T.stories + sec(0.1), T.stories + sec(1.4));
  const value = Math.round(lerp(toLandmarks, 0, LANDMARK_ROUNDED) + toStories * (STORY_ROUNDED - LANDMARK_ROUNDED));
  const onStories = frame >= T.stories;
  const plus = onStories ? toStories >= 1 : toLandmarks >= 1;

  // Opening: black, then the grey opens out from the card as it lands.
  const rev = ramp(frame, T.reveal, T.reveal + sec(0.45));
  const radius = Math.hypot(width, height) * rev;
  const hookInk = interpolateColors(rev, [0.15, 0.6], [COLORS.white, COLORS.ink]);

  return (
    <AbsoluteFill style={{ background: COLORS.black }}>
      <AbsoluteFill style={{ background: COLORS.bg, clipPath: `circle(${radius}px at ${L.cx}px ${L.cy}px)` }} />

      {bits.filter(p => p.show).map(({ b, i, x, y, scale, rot, opacity }) => {
        const tf = `rotate(${rot}deg) scale(${scale})`;
        if (b.kind === 'photo') {
          const w = b.w * u;
          return <Mounted key={i} landmark={LANDMARKS.find(l => l.name === b.ref)!} width={w}
            style={{ left: x - w / 2, top: y - w * 0.6, transform: tf, opacity }} />;
        }
        if (b.kind === 'quote') {
          const q = QUOTES[Number(b.ref)];
          const w = b.w * u;
          return <Quote key={i} name={q.name} text={q.text} width={w} style={{ left: x - w / 2, top: y - 60 * u, transform: tf, opacity, zIndex: 1 }} />;
        }
        return <LookLeft key={i} height={60 * u} style={{ left: x - 100 * u, top: y - 30 * u, transform: tf, opacity, zIndex: 1 }} />;
      })}

      {cards.sort((p, q) => p.z - q.z).map(c => (
        <Postcard key={c.lm.name} landmark={c.lm} width={cw} flip={c.flip}
          storyText={c.i === pickIndex ? alfieCard() : undefined}
          storyChars={c.i === pickIndex ? storyChars : undefined} caret={c.i === pickIndex && typing}
          shadow={c.i === pickIndex ? 0.6 + 0.4 * pickT : 0.5}
          style={{ left: c.x - cw / 2, top: c.y - ch / 2, opacity: c.opacity, transform: `rotate(${c.rot}deg) scale(${c.scale})` }} />
      ))}

      <Sequence from={0} durationInFrames={T.deck}>
        <Caption text={COPY.hook} color={hookInk} delay={sec(0.2)} out={T.deck - sec(0.25)} />
      </Sequence>
      <Sequence from={T.deck} durationInFrames={BEATS.deck + BEATS.stories}>
        <BigCount value={value} plus={plus} color={COLORS.ink} delay={0}
          label={onStories ? COPY.stories : COPY.deck} labelKey={onStories ? 's' : 'l'} labelAt={onStories ? BEATS.deck : sec(0.1)}
          sub={onStories ? COPY.storiesSub : undefined} subAt={BEATS.deck + sec(1.0)}
          out={BEATS.deck + BEATS.stories - sec(0.25)} />
      </Sequence>
      <Sequence from={T.fan} durationInFrames={BEATS.fan}>
        <Caption text={COPY.fan} delay={0} out={BEATS.fan - sec(0.25)} />
      </Sequence>
      <Sequence from={T.alfie} durationInFrames={sec(6.8)}>
        <Caption text={COPY.alfie} delay={0} out={sec(6.8) - sec(0.3)} />
      </Sequence>
      <Sequence from={T.alfie + sec(6.8)} durationInFrames={BEATS.alfie - sec(6.8)}>
        <Caption text={COPY.alfie2} sub={COPY.alfie2Sub} delay={0} out={BEATS.alfie - sec(6.8) - sec(0.25)} />
      </Sequence>
      <Sequence from={T.alfie} durationInFrames={BEATS.alfie}>
        <Waveform left={L.wide ? L.cx - waveW / 2 : 80 * u} top={waveTop} width={waveW} height={130 * u}
          color={COLORS.ink} start={T.voice - T.alfie} />
      </Sequence>
      <Sequence from={T.voice}>
        <Audio src={staticFile(ALFIE.file)} startFrom={Math.round(ALFIE.startFrom * fps)}
          endAt={Math.round((ALFIE.startFrom + ALFIE.duration) * fps)}
          volume={f => interpolate(f, [0, 3, ALFIE.duration * fps - 5, ALFIE.duration * fps], [0, 1, 1, 0], { extrapolateRight: 'clamp' })} />
      </Sequence>
    </AbsoluteFill>
  );
};
