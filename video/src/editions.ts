// Theme editions, copied from App/Web_App/static/v2/js/editions.js by scripts/sync.mjs.
import raw from './generated/editions.json';

export type Edition = {
  name: string; code: string; body: string; ink: string; accent: string;
  font: string; style?: string; weight: number; size: number; glyph: string; light?: boolean;
};
export const EDITIONS = raw as Record<string, Edition>;
// Grid order in the video: Surprise Me first, then the themes as listed in editions.js.
export const EDITION_KEYS = Object.keys(EDITIONS);
