// Music and sound effects. Every cue is placed from the same timing constants
// the animation uses, so if a beat moves, its sounds move with it.
// Files: docs/audio/sfx/ (ElevenLabs sound effects) and docs/audio/music/,
// copied into public/shared/audio/ by scripts/sync.mjs.
import React from 'react';
import { Audio, Sequence, interpolate, staticFile, useVideoConfig } from 'remotion';
import { BEATS, TOTAL, sec } from './config';
import { T } from './scenes/Cards';
import { TAP_AT } from './scenes/RideApp';
import { LOCK_AT, OPEN_AT, PHONE_AT } from './scenes/BlackCab';
import { LIFT_AT, WASH_AT } from './scenes/Themes';
import { ISLAND_AT, MORPH_AT } from './scenes/Ride';

// Where each scene starts in the whole film (frames).
const START = (() => {
  const order = ['hook', 'deck', 'stories', 'fan', 'alfie', 'rideApp', 'blackCab', 'themes', 'ride', 'end'] as const;
  const out: Record<string, number> = {};
  let t = 0;
  for (const k of order) { out[k] = t; t += BEATS[k]; }
  return out;
})();

type Sfx = 'whoosh' | 'shutter' | 'card-draw' | 'card-spread' | 'counter';
type Cue = { sfx: Sfx; at: number; volume: number; rate?: number; length?: number };

const RATES = [1.0, 1.08, 0.95, 1.12, 0.98, 1.05, 0.92];

export const CUES: Cue[] = [
  // Hook: the card falls and spins, lands; the grey opens out.
  { sfx: 'whoosh', at: sec(0.05), volume: 0.45, rate: 0.85 },
  { sfx: 'card-draw', at: T.reveal - sec(0.06), volume: 0.8, rate: 0.85 },
  { sfx: 'whoosh', at: T.reveal + sec(0.05), volume: 0.25, rate: 0.7 },
  // Deck: one card sound per drop, each pitched slightly differently, and the counter.
  ...RATES.map((rate, i) => ({ sfx: 'card-draw' as Sfx, at: T.deck + sec(0.05) + i * sec(0.17) - 1, volume: 0.5, rate })),
  { sfx: 'counter', at: T.deck + sec(0.05), volume: 0.3 },
  // Stories: the pieces burst out; the count rolls on.
  { sfx: 'card-spread', at: T.stories, volume: 0.45, rate: 1.1 },
  { sfx: 'counter', at: T.stories + sec(0.1), volume: 0.25, rate: 1.1 },
  // Fan: pieces fly out, the deck spreads, one card rises and flips.
  { sfx: 'whoosh', at: T.fan - sec(0.12), volume: 0.4 },
  { sfx: 'card-spread', at: T.fan, volume: 0.7 },
  { sfx: 'card-draw', at: T.pick, volume: 0.55, rate: 1.1 },
  { sfx: 'card-draw', at: T.flip, volume: 0.45, rate: 1.3 },
  // Ride app: the phone comes up, the tap.
  { sfx: 'whoosh', at: START.rideApp - sec(0.12), volume: 0.35, rate: 0.9 },
  { sfx: 'shutter', at: START.rideApp + TAP_AT - 1, volume: 0.22, rate: 1.5, length: sec(0.12) },
  // Black cab: the phone comes in, the camera locks on the QR code, the page opens.
  { sfx: 'whoosh', at: START.blackCab + PHONE_AT - sec(0.05), volume: 0.35 },
  { sfx: 'shutter', at: START.blackCab + LOCK_AT - 2, volume: 0.65 },
  { sfx: 'whoosh', at: START.blackCab + OPEN_AT, volume: 0.3, rate: 1.15 },
  // Themes: the tile lifts, its colour washes over.
  { sfx: 'card-draw', at: START.themes + LIFT_AT - 1, volume: 0.4, rate: 1.2 },
  { sfx: 'whoosh', at: START.themes + WASH_AT, volume: 0.45, rate: 0.8 },
  // The ride: the card grows into the postcard; the island opens.
  { sfx: 'whoosh', at: START.ride + MORPH_AT, volume: 0.3, rate: 0.9 },
  { sfx: 'whoosh', at: START.ride + ISLAND_AT, volume: 0.3, rate: 1.4 },
  // End: five cards settle.
  ...[0, 1, 2, 3, 4].map(i => ({ sfx: 'card-draw' as Sfx, at: START.end + i * sec(0.15) + sec(0.1), volume: 0.45, rate: RATES[i] })),
];

// Music: the full section of the track comes back at 77.47 s; start the track
// so that lands on the ride-app cut, which puts its quiet section under Alfie.
// Overall level of the effects, so Alfie stays the loudest thing in the mix.
const SFX_LEVEL = 0.8;

export const MUSIC = {
  file: 'shared/audio/music/jazz-lnplusmusic-611049.mp3',
  startFrom: 77.47 - BEATS.hook / 30 - BEATS.deck / 30 - BEATS.stories / 30 - BEATS.fan / 30 - BEATS.alfie / 30,
  level: 0.32, // under the effects
  underVoice: 0.12, // while Alfie talks
};

export const Soundtrack: React.FC = () => {
  const { fps } = useVideoConfig();
  const voiceIn = T.voice;
  const voiceOut = START.rideApp - sec(0.6);
  const music = (f: number) => interpolate(
    f,
    [0, sec(0.4), voiceIn - sec(0.4), voiceIn + sec(0.1), voiceOut, START.rideApp, TOTAL - sec(1.8), TOTAL],
    [0, MUSIC.level, MUSIC.level, MUSIC.underVoice, MUSIC.underVoice, MUSIC.level, MUSIC.level, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  return (
    <>
      <Audio src={staticFile(MUSIC.file)} startFrom={Math.round(MUSIC.startFrom * fps)} volume={music} />
      {CUES.map((c, i) => (
        <Sequence key={i} from={Math.max(0, c.at)} durationInFrames={c.length ?? sec(2)}>
          <Audio src={staticFile(`shared/audio/sfx/${c.sfx}.mp3`)} volume={c.volume * SFX_LEVEL} playbackRate={c.rate ?? 1} />
        </Sequence>
      ))}
    </>
  );
};
