// Copies the app's shared pieces into the video project, so the advert always
// matches the live app: theme editions, landmark stories, fonts, the 3x Figma
// screen exports used by the mockups, Alfie's audio and the logo.
// Run automatically by `npm run studio` and `npm run render`.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const VIDEO = path.join(HERE, '..');
const REPO = path.join(VIDEO, '..');
const SHARED = path.join(VIDEO, 'public', 'shared');
const GEN = path.join(VIDEO, 'src', 'generated');

const copy = (from, to) => {
  if (!fs.existsSync(from)) return false;
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
  return true;
};
fs.mkdirSync(GEN, { recursive: true });

// 1. Theme editions, read from the same file the app uses.
const editionsSrc = fs.readFileSync(path.join(REPO, 'App/Web_App/static/v2/js/editions.js'), 'utf8');
const sandbox = { window: {} };
vm.runInNewContext(editionsSrc, sandbox);
fs.writeFileSync(path.join(GEN, 'editions.json'), JSON.stringify(sandbox.window.EDITIONS, null, 2));

// 2. Landmark count and the stories for the landmarks named in src/config.ts.
const db = JSON.parse(fs.readFileSync(path.join(REPO, 'Data/final_landmarks_v6.2_Big.json'), 'utf8'));
const stories = Object.fromEntries(db.map(l => [l.name, (l.script || '').trim()]));
// Stories: one Alfie story per landmark, plus one per theme the landmark is in.
const tags = JSON.parse(fs.readFileSync(path.join(REPO, 'Data/landmark_tags.json'), 'utf8')).tags;
const themeStories = Object.values(tags).reduce((n, t) => n + Object.values(t.talking_points || {}).filter(v => String(v).trim()).length, 0);
const storyCount = db.filter(l => (l.script || '').trim()).length + themeStories;
fs.writeFileSync(path.join(GEN, 'landmarks.json'), JSON.stringify({ count: db.length, storyCount, stories }, null, 0));

// 3. Fonts: Satoshi from the app, theme fonts from @fontsource, SF Pro if present locally.
const FS = path.join(VIDEO, 'node_modules', '@fontsource');
const fonts = {
  'Satoshi-Variable.ttf': path.join(REPO, 'App/Web_App/static/fonts/Satoshi-Variable.ttf'),
  'SF-Pro-Text-Semibold.otf': path.join(REPO, 'scripts/mockups/fonts/SF-Pro-Text-Semibold.otf'),
  'jetbrains-mono-500.woff2': path.join(FS, 'jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff2'),
  'jetbrains-mono-500-italic.woff2': path.join(FS, 'jetbrains-mono/files/jetbrains-mono-latin-500-italic.woff2'),
  'cinzel-700.woff2': path.join(FS, 'cinzel/files/cinzel-latin-700-normal.woff2'),
  'fraunces-600.woff2': path.join(FS, 'fraunces/files/fraunces-latin-600-normal.woff2'),
  'grenze-gotisch-600.woff2': path.join(FS, 'grenze-gotisch/files/grenze-gotisch-latin-600-normal.woff2'),
  'big-shoulders-display-700.woff2': path.join(FS, 'big-shoulders-display/files/big-shoulders-display-latin-700-normal.woff2'),
  'bodoni-moda-600.woff2': path.join(FS, 'bodoni-moda/files/bodoni-moda-latin-600-normal.woff2'),
  'cormorant-garamond-700.woff2': path.join(FS, 'cormorant-garamond/files/cormorant-garamond-latin-700-normal.woff2'),
  'unbounded-500.woff2': path.join(FS, 'unbounded/files/unbounded-latin-500-normal.woff2'),
  'abril-fatface-400.woff2': path.join(FS, 'abril-fatface/files/abril-fatface-latin-400-normal.woff2'),
};
const present = [];
for (const [name, from] of Object.entries(fonts)) if (copy(from, path.join(SHARED, 'fonts', name))) present.push(name);
fs.writeFileSync(path.join(GEN, 'fonts.json'), JSON.stringify(present));

// 4. App screens (3x Figma exports, status bar removed), logo and Alfie's audio.
const screens = path.join(REPO, 'scripts/mockups/screens');
for (const f of fs.readdirSync(screens)) copy(path.join(screens, f), path.join(SHARED, 'screens', f));
copy(path.join(REPO, 'App/Web_App/static/v2/images/logo.png'), path.join(SHARED, 'logo.png'));
const audio = path.join(REPO, 'docs/audio');
for (const f of fs.readdirSync(audio)) {
  const from = path.join(audio, f);
  if (fs.statSync(from).isDirectory()) {
    for (const g of fs.readdirSync(from)) copy(path.join(from, g), path.join(SHARED, 'audio', f, g)); // sfx/, music/
  } else copy(from, path.join(SHARED, 'audio', f));
}

console.log(`synced: ${Object.keys(sandbox.window.EDITIONS).length} editions, ${db.length} landmarks, ${storyCount} stories, ${present.length} fonts`);
