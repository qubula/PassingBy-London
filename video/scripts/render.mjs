// Renders both formats to out/. Pass --stills to render one frame per beat
// instead (quick visual check), e.g. `node scripts/render.mjs --stills`.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const browser = ['/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell']
  .find(p => fs.existsSync(p));
const extra = browser ? ['--browser-executable', browser] : [];
const run = args => execFileSync('npx', ['remotion', ...args, ...extra], { stdio: 'inherit' });

// --only=advert-4x5 renders one format
const only = process.argv.find(a => a.startsWith('--only='))?.slice(7);
const ids = only ? [only] : ['advert-4x5', 'advert-16x9'];
if (process.argv.includes('--stills')) {
  const frames = process.argv.slice(process.argv.indexOf('--stills') + 1).filter(a => /^\d+$/.test(a));
  for (const id of ids) for (const f of frames.length ? frames : ['30', '100', '160', '200', '280', '380', '470', '550', '640'])
    run(['still', id, `out/stills/${id}-${f}.png`, `--frame=${f}`]);
} else {
  for (const id of ids) {
    run(['render', id, `out/${id}.mp4`, '--codec=h264', '--crf=16']);
    // Loudness for social video: -14 LUFS integrated, true peak -1.5 dB. Picture is copied untouched.
    execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', `out/${id}.mp4`,
      '-af', 'loudnorm=I=-14:TP=-1.5:LRA=7', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', `out/${id}.norm.mp4`], { stdio: 'inherit' });
    fs.renameSync(`out/${id}.norm.mp4`, `out/${id}.mp4`);
  }
}
