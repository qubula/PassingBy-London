# PassingBy launch advert: script (as built, draft 3)

Length 40 s · 30 fps · built in Remotion ([`video/`](../../video/)) · plays muted
first (LinkedIn autoplays without sound), so every key fact is on screen as text.

Formats from the same project:
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
| 1 | 0.0–2.5 | **Hook.** Black frame. An Elizabeth Tower postcard drops in from above, spins once and lands. Hard cut to grey as it lands. | **Every landmark has a story.** | (music later) |
| 2 | 2.5–6.0 | **The deck.** Seven more postcards fall onto it, each a different landmark, into a loose stack. The number counts up with them. | **1,300+ London landmarks** | |
| 3 | 6.0–10.0 | **Fan and flip.** The deck fans out in an arc. Buckingham Palace rises out of the fan and flips to its back; the story writes on. | **A story for each one** | |
| 4 | 10.0–15.0 | **Alfie.** The other cards fall away. The story card stays, and Alfie's waveform draws under it as his first two sentences play. | **Told by Alfie, a London cabbie** | Alfie, 4.4 s (Buckingham Palace clip) |
| 5 | 15.0–21.0 | **Flow A: ride app.** A phone rises with a generic ride app, "Choose a ride". A tap lands on **Scenic route**, and the camera pushes in on the row. | **Book a ride. Add the scenic route.** and **+6 min · +£3.20** | |
| 6 | 21.0–25.5 | **Themes.** The nine theme tiles drop into a 3 × 3 grid in their own colours. Architecture lifts and its colour washes over the frame. | **9 themes** · Architecture, Historical, Royal… | |
| 7 | 25.5–31.5 | **The ride.** Black frame, the dark ride map. The mini card grows into the postcard (the app's morph). The theme badge shows the Architecture glyph. The camera rises to the Dynamic Island, which expands to **Look left · Elizabeth Tower · 200 m**. | **Stories as you pass them** | |
| 8 | 31.5–36.0 | **Flow B: black cab.** The sticker on a dark seat back. A phone moves in, the camera locks on the QR code, the "passingby.uk" banner appears, and the landing page opens. | **In a black cab? Scan the sticker.** | |
| 9 | 36.0–40.0 | **End card.** Five postcards fly in and settle into a stack beside the logo. | **PassingBy** · London's stories, as you pass them · passingby.uk · small: *Ride-app integration shown is a concept* | |

## Facts on screen, and where they come from

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
