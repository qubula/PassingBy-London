# PassingBy launch advert: script (as built, draft 7)

Length 45.6 s · 30 fps · built in Remotion ([`video/`](../../video/)) · plays muted
first (LinkedIn autoplays without sound), so every key fact is on screen as text.

Formats from the same project (while the edit is in progress, only the 4:5
version is rendered; the 16:9 file in `docs/video/` is from an earlier draft):
- **4:5, 1080 × 1350** for the LinkedIn feed (takes the most screen on a phone).
- **16:9, 1920 × 1080** for the website.

Look: the website set's warm grey (`#E3E1DA`), black type in Satoshi, the
app's own cards, tiles and phones. In 16:9 the words sit on the left and the
picture on the right; in 4:5 the words sit on top. Motion is fast in, soft
settle (springs), with hard cuts between beats. No logos of real companies:
the ride app is a generic black-and-white ride app, and the end card says the
integration is a concept.

## Beat sheet

| # | Time | On screen | Text on screen | Sound |
|---|---|---|---|---|
| 1 | 0.0–2.4 | **Hook.** Black frame. An Elizabeth Tower postcard drops in, spins once and lands; the grey opens out from the card. | **Every landmark has a story.** | |
| 2 | 2.4–4.8 | **The deck.** Seven more postcards drop fast onto it. The number grows on its own line. | **1,300+** / London landmarks | |
| 3 | 4.8–7.8 | **Stories.** Photos in white mounts, quotes from the stories and the "Look left" pill burst out around the deck. The number rolls on. | **4,700+** / stories · One for every landmark, and one for each theme it's in | |
| 4 | 7.8–10.2 | **Fan and flip.** The pieces fly outwards as the deck fans. Buckingham Palace rises and flips; Alfie starts talking as it rises. | **A story for each one** | Alfie starts (9.2 s) |
| 5 | 10.2–24.8 | **Alfie.** The other cards fall away. His line types onto the card word by word as he says it, then a few lines of extra reading type in. The card slowly pushes in; the waveform draws underneath. | **Told by Alfie, a London cabbie**, then **Short, fun stories** · For tourists and lifelong Londoners alike | Alfie, 14.7 s (`docs/audio/alfie-video-buckingham.mp3`) |
| 6 | 24.8–29.4 | **Way in 1: ride app.** Already rising at the cut. A tap on **Scenic route**, and the camera pushes in. | **Book a ride. Add the scenic route.** and **+6 min · +£3.20** | phone whoosh, tap; music back to full |
| 7 | 29.4–33.6 | **Way in 2: black cab.** The sticker on the plain grey background; a phone locks on the QR code and the landing page opens. | **Or in a black cab? Scan the sticker.** | whoosh, camera shutter on the lock, swipe |
| 8 | 33.6–36.8 | **Themes.** Nine tiles drop in; Architecture lifts and its colour washes the frame. | **9 themes** · Architecture, Historical, Royal… | lift, whoosh |
| 9 | 36.8–41.8 | **The ride.** Dark map, Architecture badge, the mini card grows into the postcard; the camera rises to the Dynamic Island, which opens to **Look left · Elizabeth Tower · 200 m**. | **Stories as you pass them** | whooshes |
| 10 | 41.8–45.6 | **End card.** Five postcards settle into a stack below the logo. | **PassingBy** · Learn about London as you commute · passingby.uk · small: *Ride-app integration shown is a concept* | card taps; music fades out |

## Sound

All in `video/src/Soundtrack.tsx`; every cue is placed from the same timing
constants as the animation, so retiming a beat moves its sounds.

- **Effects** (`docs/audio/sfx/`, ElevenLabs): `card-draw` for each card landing
  (pitched slightly differently per card), `card-spread` for the stories burst
  and the fan, `counter` under the counts, `whoosh` for movement, `shutter`
  for the QR lock (and, short and high, the tap).
- **Music** (`docs/audio/music/jazz-lnplusmusic-611049.mp3`, about 99 BPM): the
  track starts at 52.67 s so its full section returns (77.47 s) on the ride-app
  cut, with its quieter section under Alfie. It dips further while Alfie talks
  and fades out over the last 1.8 s.
- **Loudness:** the render script normalises to −14 LUFS, true peak −1.5 dB.

## Alfie in sync with the card

The Alfie line was recorded for the video (script and delivery notes in
`alfie-buckingham-script.md`). The card shows his words without the delivery
tags, then extra reading (`ALFIE.more` in `video/src/config.ts`).

The story on the card types as Alfie says it. Word timings come from a
Whisper transcription of the clip (`video/src/alfie-words.json`), matched in
order to the words of the card's story; the clip and the database text say the
same words. If the clip changes, re-run the transcription and replace the file.

## Experimental cut ("lab")

`lab-4x5` and `lab-16x9` (34.8 s, `docs/video/lab-*.mp4`) use the same pieces
with motion borrowed from two references the user shared: Mouthwash Studio's
Brand.ai identity (everything grows out of one dot and returns to it, a
collage that keeps drifting) and Rico's Jitter Showcase 09 (pieces floating at
different depths, focus pulls instead of cuts, mono labels in the corners).

| Part | Time | What happens |
|---|---|---|
| Origin | 0–16.6 | A dot swells into a gooey blob and becomes the Elizabeth Tower postcard. Landmark photos, tiles and the "Look left" pill burst out around it and drift. Focus pulls to Buckingham Palace: it comes forward and flips while the rest goes soft; Alfie reads it as it types. |
| Depth | 16.6–29.6 | On black, the ride app, theme tiles, the ride and the sticker float at different depths. The camera pulls focus from one to the next, each with its own caption and small action (tap and price, Architecture lifts, postcard morph and Dynamic Island, QR lock). |
| Collapse | 29.6–34.8 | The photos fly back into the centre and melt into the dot; the dot closes and the logo comes out of it. |

Corner labels: "PassingBy", the section ("03 · Ride app"), "1,327 landmarks ·
9 themes · Alfie" and "passingby.uk", in JetBrains Mono like the theme codes.

## Facts on screen, and where they come from

- **4,700+ stories:** 1,327 Alfie stories (one per landmark) plus 3,439 theme
  stories (`talking_points` in `Data/landmark_tags.json`, one for each theme a
  landmark is in): 4,766, rounded down. Counted at render time.
- **Quotes:** short lines from Alfie's own scripts in the database.

- **1,300+ landmarks:** the database (`Data/final_landmarks_v6.2_Big.json`)
  holds 1,327. The video reads the count at render time and rounds down to the
  hundred. (The README says "about 1,400"; 1,300+ is the accurate figure.)
- **Stories:** the story on the flipped card is the app's own text for that
  landmark, from the same database.
- **Alfie:** the real recorded clip (`docs/audio/alfie-buckingham-palace.mp3`),
  first two sentences (to the pause at 4.43 s). Buckingham Palace was chosen
  because its sentences are short; the London Eye clip's first pause is at
  6.8 s. This voice is a placeholder: the final, livelier Alfie voice is still
  to be generated. Swap the file in `ALFIE` in `src/config.ts`.
- **9 themes:** the nine editions in `static/v2/js/editions.js` (Surprise Me
  and eight themes), read at render time.
- **+6 min · +£3.20:** an example price, as on the ride-app concept screens.
- **Ride-app screens, Dynamic Island and sticker:** concept designs from Figma.
  The web app can't show the Dynamic Island; the end card notes the concept.

## Built so it's easy to change later

The video isn't a screen recording. It's built from the same pieces as the
design, so a change is one edit and a re-render. See
[`video/README.md`](../../video/README.md) for the file map:

- `src/config.ts`: all copy, timings per beat, colours, which landmarks appear,
  the Alfie clip and the picked theme.
- `src/components/Postcard.tsx`, `ThemeTile.tsx`, `Phone.tsx`: React versions
  of the app's postcard, theme tile and the mockups' phone frame. Change the
  postcard here and every beat that uses it updates.
- Theme colours, fonts and glyphs, the landmark count and the stories are read
  from the app's own files on every render.
- One command renders both formats.

## Still to do

1. **Music:** a licensed track from you. Each beat starts on a cut, so the
   edit can be retimed to the track's bars in `BEATS` in `src/config.ts`.
2. **Alfie's final voice:** regenerate the clips in the livelier voice.
3. **Next shots:** the cards being swiped to show different landmarks, and a
   clearer moment for scanning the QR code as you get into a black cab.
4. **Theme badge in the screen exports:** the ride screens were exported with
   the Royal badge; the video draws the picked theme's badge over it.
