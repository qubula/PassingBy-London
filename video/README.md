# PassingBy launch advert (Remotion)

A 22-second advert, rendered in two formats from one project:

- `advert-4x5`: 1080 × 1350, for the LinkedIn feed
- `advert-16x9`: 1920 × 1080, for the website

The script and beat sheet are in [`docs/video/advert-script.md`](../docs/video/advert-script.md).

## Run it

```bash
cd video
npm install
npm run studio     # live preview in the browser, with a timeline
npm run render     # writes out/advert-4x5.mp4 and out/advert-16x9.mp4
node scripts/stills.mjs 30 200 400   # a few frames of both formats, for a quick check
```

`npm run studio` and `npm run render` first run `scripts/sync.mjs`, which copies
the app's shared pieces into the project (theme editions, landmark stories and
count, fonts, app screens, Alfie's audio, the logo). So the video always
matches the app.

## Changing things

| To change | Edit |
|---|---|
| Any words on screen, timings, landmarks, the Alfie clip, the theme that's picked | `src/config.ts` |
| The postcard (used in the hook, deck, fan, flip and end card) | `src/components/Postcard.tsx` |
| The theme tiles | `src/components/ThemeTile.tsx`; colours, fonts and glyphs come from the app's `static/v2/js/editions.js` |
| The phone frame and status bar | `src/components/Phone.tsx` (same as `scripts/mockups/render.mjs`) |
| One beat's motion | `src/scenes/` (Cards covers beats 1–4 as one shot) |

Images that come from Figma rather than code:

- App screens: `scripts/mockups/screens/` (3x exports of the source frames, see the root `CLAUDE.md`).
- `public/figma/ride-choose.png`, `island-look-left.png`:
  page "★ PassingBy — Live Activity & ride app" (RA1 screen, DI4 expanded), 3x.
- `public/figma/sticker.png`: the "Sticker" frame in "★ 06 · Chosen sticker (Kuba) · master", 2x.

Re-export these when the frames change. Landmark photo credits: `public/landmarks/CREDITS.md`.

## Sound

No music yet. The only sound is Alfie's first line from the recorded Buckingham
Palace clip. The video is built to work muted, as LinkedIn plays it.
