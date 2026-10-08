// Prints the sound cues and, for the counts, the frame the number last changes,
// to check sound and picture finish together: npx tsx scripts/cues.ts
import { CUES } from '../src/Soundtrack';
import { COUNTS, countAt } from '../src/scenes/Cards';
const fps = 30;
for (const c of COUNTS) {
  let last = c.from;
  for (let f = c.from; f <= c.to + 30; f++) if (countAt(f).value !== countAt(f - 1).value) last = f;
  const ticks = CUES.filter(q => q.sfx === 'counter-tick' && q.at >= c.from && q.at <= c.to + 5).map(q => q.at);
  console.log(`count ${c.a}→${c.b}: number last changes at frame ${last} (${(last / fps).toFixed(2)} s); ${ticks.length} ticks, last at ${ticks.at(-1)}; gaps ${ticks.slice(1).map((t, i) => t - ticks[i]).join(',')}`);
}
console.log(CUES.filter(q => q.sfx === 'card-draw').map(q => `${(q.at / fps).toFixed(2)}`).join(' '));
