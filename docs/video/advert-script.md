# PassingBy launch advert: script (as built, draft 2)

Length 22 s · 30 fps · built in Remotion ([`video/`](../../video/)) · plays muted
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
| 1 | 0.0–1.5 | **Hook.** Black frame. An Elizabeth Tower postcard drops in from above, spins once and lands. Hard cut to grey as it lands. | **Every landmark has a story.** | (music later) |
| 2 | 1.5–3.5 | **The deck.** Seven more postcards fall onto it, each a different landmark, into a loose stack. The number counts up with them. | **1,300+ London landmarks** | |
| 3 | 3.5–5.5 | **Fan and flip.** The deck fans out in an arc. Buckingham Palace rises out of the fan and flips to its back; the story writes on. | **A story for each one** | |
| 4 | 5.5–7.5 | **Alfie.** The other cards fall away. The story card stays, and Alfie's waveform draws under it as his first line plays. | **Told by Alfie, a London cabbie** | Alfie, 2.6 s (Buckingham Palace clip) |
| 5 | 7.5–11.0 | **Flow A: ride app.** A phone rises with a generic ride app, "Choose a ride". A tap lands on **Scenic route**, and the camera pushes in on the row. | **Book a ride. Add the scenic route.** and **+6 min · +£3.20** | |
| 6 | 11.0–13.5 | **Themes.** The nine theme tiles drop into a 3 × 3 grid in their own colours. Royal lifts and its purple washes over the frame. | **9 themes** · Royal, Historical, Architecture… | |
| 7 | 13.5–17.0 | **The ride.** Black frame, the dark ride map. The mini card grows into the postcard (the app's morph). The camera rises to the Dynamic Island, which expands to **Look left · Elizabeth Tower · 200 m**. | **Stories as you pass them** | |
| 8 | 17.0–19.5 | **Flow B: black cab.** The sticker on a dark seat back. A phone moves in, the camera locks on the QR code, the "passingby.uk" banner appears, and the landing page opens. | **In a black cab? Scan the sticker.** | |
| 9 | 19.5–22.0 | **End card.** Five postcards fly in and settle into a stack beside the logo. | **PassingBy** · London's stories, as you pass them · passingby.uk · small: *Ride-app integration shown is a concept* | |

## Facts on screen, and where they come from

- **1,300+ landmarks:** the database (`Data/final_landmarks_v6.2_Big.json`)
  holds 1,327. The video reads the count at render time and rounds down to the
  hundred. (The README says "about 1,400"; 1,300+ is the accurate figure.)
- **Stories:** the story on the flipped card is the app's own text for that
  landmark, from the same database.
- **Alfie:** the real recorded clip (`docs/audio/alfie-buckingham-palace.mp3`),
  first line only. Buckingham Palace was chosen because its first line ends
  cleanly at 2.55 s; the London Eye clip's first pause is at 6.8 s.
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
2. **Longer version:** a 45–60 s cut with more of each flow.
