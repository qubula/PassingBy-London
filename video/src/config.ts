// Everything you might want to change in the advert lives here:
// copy, timings, colours and which landmarks appear.
// Change a line, then re-render (`npm run render`).
import landmarks from './generated/landmarks.json';

export const FPS = 30;
// Seconds to frames.
export const sec = (seconds: number) => Math.round(seconds * FPS);
const s = sec;

// Landmark count straight from the database, rounded down: 1,327 -> "1,300+".
const rounded = Math.floor(landmarks.count / 100) * 100;
export const LANDMARK_COUNT = landmarks.count;
export const LANDMARK_LABEL = `${rounded.toLocaleString('en-GB')}+`;

export const COLORS = {
  bg: '#E3E1DA', // the website set's warm grey
  ink: '#111111',
  muted: '#6B7280',
  black: '#0B0B0C',
  white: '#FFFFFF',
};

// Landmarks used across the video. `photo` is in public/landmarks/.
// The story on each card comes from the app's database (Data/), by name.
export type Landmark = { name: string; photo: string; where: string };
export const LANDMARKS: Landmark[] = [
  { name: 'Elizabeth Tower', photo: 'elizabeth-tower.jpg', where: 'On your left · 200 m' },
  { name: 'London Eye', photo: 'london-eye.jpg', where: 'On your right · 350 m' },
  { name: 'Tower Bridge', photo: 'tower-bridge.jpg', where: 'Coming up · 1.2 km' },
  { name: 'Buckingham Palace', photo: 'buckingham-palace.jpg', where: 'On your left · 150 m' },
  { name: "St Paul's Cathedral", photo: 'st-pauls-cathedral.jpg', where: 'On your right · 400 m' },
  { name: 'Westminster Abbey', photo: 'westminster-abbey.jpg', where: 'On your left · 300 m' },
  { name: 'The Shard', photo: 'the-shard.jpg', where: 'Coming up · 2 km' },
  { name: 'Tower of London', photo: 'tower-of-london.jpg', where: 'On your left · 600 m' },
  { name: 'Trafalgar Square', photo: 'trafalgar-square.jpg', where: 'On your right · 250 m' },
  { name: 'Royal Albert Hall', photo: 'royal-albert-hall.jpg', where: 'On your left · 500 m' },
  { name: 'Natural History Museum', photo: 'natural-history-museum.jpg', where: 'On your right · 700 m' },
  { name: 'Palace of Westminster', photo: 'palace-of-westminster.jpg', where: 'On your right · 100 m' },
];

export const storyFor = (name: string): string =>
  (landmarks.stories as Record<string, string>)[name] ?? '';

// The card that drops in first (hook) and the one picked out of the fan and
// flipped. The picked card's story matches the Alfie clip below.
export const HERO = 'Elizabeth Tower';
export const PICKED = 'Buckingham Palace';

// Alfie: the real recorded clip, trimmed to its first two sentences.
export const ALFIE = {
  file: 'shared/audio/alfie-buckingham-palace.mp3',
  startFrom: 0, // seconds into the clip
  duration: 4.45, // seconds: the first two sentences (the second pause is at 4.43 s)
};

// The theme that lifts out of the grid (a key from editions.js).
export const THEME_PICK = 'architecture';

// Beats, in order. Lengths in seconds; they add up to the video length.
export const BEATS = {
  hook: s(2.5),
  deck: s(3.5),
  fan: s(4.0),
  alfie: s(5.0),
  rideApp: s(6.0),
  themes: s(4.5),
  ride: s(6.0),
  blackCab: s(4.5),
  end: s(4.0),
};
export const TOTAL = Object.values(BEATS).reduce((a, b) => a + b, 0);

// On-screen copy. Every fact is on screen, because LinkedIn starts muted.
export const COPY = {
  hook: 'Every landmark has a story.',
  deck: `${LANDMARK_LABEL} London landmarks`,
  fan: 'A story for each one',
  alfie: 'Told by Alfie, a London cabbie',
  rideApp: 'Book a ride. Add the scenic route.',
  rideAppPrice: '+6 min · +£3.20',
  themes: '9 themes',
  themesSub: 'Architecture, Historical, Royal…',
  ride: 'Stories as you pass them',
  blackCab: 'In a black cab? Scan the sticker.',
  endTagline: "London's stories, as you pass them",
  endUrl: 'passingby.uk',
  endNote: 'Ride-app integration shown is a concept',
};
