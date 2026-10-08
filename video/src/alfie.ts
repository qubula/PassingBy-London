// Types the story as Alfie says it: word timings from src/alfie-words.json,
// matched in order to the words of the card's story text.
import timing from './alfie-words.json';

const WORDS = timing.words as [number, number, string][];

// How many characters of `text` Alfie has said `t` seconds into the clip.
export const spokenChars = (text: string, t: number): number => {
  if (t <= 0) return 0;
  const tokens = text.match(/\S+\s*/g) ?? [];
  let chars = 0;
  for (let i = 0; i < tokens.length && i < WORDS.length; i++) {
    const [start, end] = WORDS[i];
    if (t < start) break;
    const word = tokens[i].trimEnd();
    if (t >= end) {
      chars += tokens[i].length;
    } else {
      chars += Math.ceil(word.length * ((t - start) / Math.max(0.05, end - start)));
      break;
    }
  }
  return chars;
};
