// Loads every font before the first frame renders, so no frame shows a fallback.
import { continueRender, delayRender, staticFile } from 'remotion';
import present from './generated/fonts.json';

const FONTS: { family: string; file: string; weight?: string; style?: string }[] = [
  { family: 'Satoshi', file: 'Satoshi-Variable.ttf', weight: '300 900' },
  { family: 'SF Pro Text', file: 'SF-Pro-Text-Semibold.otf', weight: '600' },
  { family: 'JetBrains Mono', file: 'jetbrains-mono-500.woff2', weight: '500' },
  { family: 'JetBrains Mono', file: 'jetbrains-mono-500-italic.woff2', weight: '500', style: 'italic' },
  { family: 'Cinzel', file: 'cinzel-700.woff2', weight: '700' },
  { family: 'Fraunces', file: 'fraunces-600.woff2', weight: '600' },
  { family: 'Grenze Gotisch', file: 'grenze-gotisch-600.woff2', weight: '600' },
  { family: 'Big Shoulders Display', file: 'big-shoulders-display-700.woff2', weight: '700' },
  { family: 'Bodoni Moda', file: 'bodoni-moda-600.woff2', weight: '600' },
  { family: 'Cormorant Garamond', file: 'cormorant-garamond-700.woff2', weight: '700' },
  { family: 'Unbounded', file: 'unbounded-500.woff2', weight: '500' },
  { family: 'Abril Fatface', file: 'abril-fatface-400.woff2', weight: '400' },
];

let started = false;
export const loadFonts = () => {
  if (started || typeof document === 'undefined') return;
  started = true;
  const handle = delayRender('Loading fonts');
  const jobs = FONTS.filter(f => (present as string[]).includes(f.file)).map(async f => {
    const face = new FontFace(f.family, `url(${staticFile('shared/fonts/' + f.file)})`, {
      weight: f.weight ?? '400',
      style: f.style ?? 'normal',
    });
    await face.load();
    document.fonts.add(face);
  });
  Promise.all(jobs).then(() => continueRender(handle)).catch(err => {
    console.error(err);
    continueRender(handle);
  });
};

export const SANS = "Satoshi, -apple-system, 'Helvetica Neue', sans-serif";
export const MONO = "'JetBrains Mono', ui-monospace, monospace";
