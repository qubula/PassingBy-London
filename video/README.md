# PassingBy launch advert (Remotion)

A 38-second advert, rendered in two formats from one project:

- `advert-4x5`: 1080 × 1350, for the LinkedIn feed
- `advert-16x9`: 1920 × 1080, for the website

An experimental cut with different motion (`lab-4x5`, `lab-16x9`, code in
`src/lab/`) is described in the script doc too. The script and beat sheet are in [`docs/video/advert-script.md`](../docs/video/advert-script.md).

## Run it

```bash
cd video
npm install
npm run studio     # live preview in the browser, with a timeline
npm run render     # writes out/advert-4x5.mp4, out/advert-16x9.mp4 and out/advert-16x9-4k.mp4
node scripts/render.mjs --fast   # 1x render, for quick checks
npx remotion render lab-4x5 out/lab-4x5.mp4   # the experimental cut
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
| One beat's motion | `src/scenes/` (Cards covers beats 1–4 as one shot); the lab cut is in `src/lab/` |
| Alfie's word timings (the card types as he speaks) | `src/alfie-words.json` |

Images that come from Figma rather than code:

- App screens: `scripts/mockups/screens/` (3x exports of the source frames, see the root `CLAUDE.md`).
- `public/figma/ride-choose.png`, `island-look-left.png`:
  page "★ PassingBy — Live Activity & ride app" (RA1 screen, DI4 expanded), 3x.
- `public/figma/sticker.png`: the "Sticker" frame in "★ 06 · Chosen sticker (Kuba) · master", 2x.

Re-export these when the frames change. Landmark photo credits: `public/landmarks/CREDITS.md`.

## Quality

- Every frame is rendered at 2x and downscaled with a Lanczos filter
  (supersampling), so rotated cards, thin text and photo edges stay clean.
- Encoded with x264 `-preset slow -crf 14`; audio AAC 256 kbps at −14 LUFS.
- YouTube: upload `out/advert-16x9-4k.mp4` (3840 × 2160). YouTube gives 4K
  uploads a higher bitrate, so it looks sharper even when watched in 1080p.
- Landmark photos are 1000 × 1200, so they're never stretched; the ride-app
  screen is a 4x Figma export.


No music yet. The only sound is Alfie's first two sentences from the recorded
Buckingham Palace clip (a placeholder voice; the final one is still to come). The video is built to work muted, as LinkedIn plays it.

## Credits

- Music by [Andrii Poradovskyi](https://pixabay.com/users/lnplusmusic-47631836/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=611049) from [Pixabay](https://pixabay.com/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=611049) (`docs/audio/music/jazz-lnplusmusic-611049.mp3`).
- Sound effects: generated with ElevenLabs (`docs/audio/sfx/`).
- Alfie's voice: ElevenLabs.
- Landmark photos: Wikimedia Commons, see `video/public/landmarks/CREDITS.md`.

The end card carries a short credit line: "Music by Andrii Poradovskyi from
Pixabay · Sound effects by ElevenLabs".
