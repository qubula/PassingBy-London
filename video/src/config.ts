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
export const LANDMARK_ROUNDED = rounded;
// Stories: an Alfie story for every landmark plus one for each theme it's in
// (4,766 at the last sync), rounded down: "4,700+".
export const STORY_COUNT = (landmarks as { storyCount: number }).storyCount;
export const STORY_ROUNDED = Math.floor(STORY_COUNT / 100) * 100;

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

// Short lines from the landmarks' own stories (Alfie's scripts in Data/),
// shown as quotes around the deck in the "stories" beat.
export const QUOTES = [
  { name: 'Tower of London', text: 'A royal palace, a prison, and even a zoo at one point.' },
  { name: 'Elizabeth Tower', text: "Most folks call it Big Ben, but that's the name of the giant bell inside." },
  { name: 'Royal Albert Hall', text: 'From classical music to rock and even boxing matches.' },
];

// Alfie: a line recorded for the video (docs/video/alfie-buckingham-script.md).
// `text` is what he says, without the delivery tags, typed onto the card word
// by word using the timings in src/alfie-words.json. `more` is extra reading
// that appears on the card once he's finished.
export const ALFIE: { file: string; startFrom: number; duration: number; text?: string; more?: string } = {
  file: 'shared/audio/alfie-video-buckingham.mp3',
  startFrom: 0,
  duration: 14.68,
  text: "Okay, Buckingham Palace, on your left! Did you know there are 775 rooms in that place… and 78 of 'em are bathrooms. 78! Imagine doing the cleaning rota.",
  more: 'It started out in 1703 as a townhouse for the Duke of Buckingham. George III bought it in 1761, and Queen Victoria was the first monarch to live there.',
};
export const alfieText = () => ALFIE.text ?? storyFor(PICKED);
export const alfieCard = () => (ALFIE.more ? `${alfieText()}\n\n${ALFIE.more}` : alfieText());

// The theme that lifts out of the grid (a key from editions.js).
export const THEME_PICK = 'architecture';

// Beats, in order. Lengths in seconds; they add up to the video length.
export const BEATS = {
  hook: s(2.4),
  deck: s(2.4),
  stories: s(3.0),
  fan: s(2.4), // Alfie starts talking 1 s into this beat, as his card rises
  alfie: s(14.6), // the rest of his line, then a moment to read the card
  rideApp: s(4.6),
  blackCab: s(4.2), // the second way in, straight after the ride app
  themes: s(3.2),
  ride: s(5.0),
  end: s(3.8),
};
export const TOTAL = Object.values(BEATS).reduce((a, b) => a + b, 0);

// On-screen copy. Every fact is on screen, because LinkedIn starts muted.
export const COPY = {
  hook: 'Every landmark has a story.',
  deck: 'London landmarks',
  stories: 'stories',
  storiesSub: "One for every landmark, and one for each theme it's in",
  fan: 'A story for each one',
  alfie: 'Told by Alfie, a London cabbie',
  alfie2: 'Short, fun stories',
  alfie2Sub: 'For tourists and lifelong Londoners alike',
  rideApp: 'Book a ride. Add the scenic route.',
  rideAppPrice: '+6 min · +£3.20',
  themes: '9 themes',
  themesSub: 'Architecture, Historical, Royal…',
  ride: 'Stories as you pass them',
  blackCab: 'Or in a black cab? Scan the sticker.',
  endTagline: 'Every ride has a story.',
  endNote: 'Ride-app integration shown is a concept',
  credits: 'Music by Andrii Poradovskyi from Pixabay · Sound effects by ElevenLabs',
};
