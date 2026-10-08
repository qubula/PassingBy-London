# PassingBy launch advert: script (draft 1)

Length 22 s · 30 fps · built in Remotion · plays muted first (LinkedIn
autoplays without sound), so every key fact is on screen as text.

Formats from the same project:
- **4:5, 1080 × 1350** for the LinkedIn feed (takes the most screen on a phone).
- **16:9, 1920 × 1080** for the website.

Look: the website set's warm grey (`#E3E1DA`), black type in Satoshi, the
app's own cards, tiles and phones. One accent at a time, taken from the theme
being shown. Motion is fast in, soft settle (spring easing), with hard cuts on
the beat. No logos of real companies: the ride app is a generic black-and-white
ride app, and the end card says the integration is a concept.

## Beat sheet

| # | Time | On screen | Text on screen | Sound |
|---|---|---|---|---|
| 1 | 0.0–1.5 | **Hook.** Black frame. A single Elizabeth Tower postcard drops in from above, spins once and lands face-up in the centre. Hard cut to grey on landing. | **Every landmark has a story.** | Beat 1, card snap |
| 2 | 1.5–3.5 | **The deck.** Postcards fall onto the first one and stack into a neat deck, each a different landmark. A counter riffles up with them. | **1,400 London landmarks** | Riffle sound |
| 3 | 3.5–5.5 | **Fan and flip.** The deck fans out in an arc. One card slides out of the fan to the top, scales up and flips to its back: stamp, name and story text writing on. | **A story for each one** | Card flip |
| 4 | 5.5–7.5 | **Alfie.** The story card shrinks to the side; a waveform draws across the frame while Alfie's real voice plays the first line of the London Eye clip. | **Told by Alfie, a London cabbie** | Alfie (2 s), music dips |
| 5 | 7.5–11.0 | **Flow A: ride app.** A phone slides up. Generic ride app, "Choose a ride". A cursor dot taps **Scenic route · +6 min · +£3.20**. The map redraws: the straight route bends past four numbered pins. | **Book a ride. Add the scenic route.** then **+6 min · +£3.20** | Tap, route draw |
| 6 | 11.0–13.5 | **Themes.** The nine theme tiles drop into the grid one by one in their own colours. The Royal tile lifts and the frame washes purple for a beat. | **9 themes · Royal, Historical, Architecture…** | Tile ticks on the beat |
| 7 | 13.5–17.0 | **The ride.** Dark map, car dot moving along the route. The mini card rises and grows into the postcard (the app's real morph). Then cut to the top of the phone: the Dynamic Island expands to **Look left · Elizabeth Tower**. | **Stories as you pass them** | Whoosh, island pop |
| 8 | 17.0–19.5 | **Flow B: black cab.** Cut to the sticker on the back of a cab seat. A phone moves in, the QR frame locks on, and the landing screen opens. | **In a black cab? Scan the sticker.** | Camera beep |
| 9 | 19.5–22.0 | **End card.** Cards from the deck fly in and settle as a neat stack behind the logo. | **PassingBy** · London's stories, as you pass them · passingby.uk · small: *Ride-app integration shown is a concept* | Final hit, music out |

Pacing: no shot is longer than 3.5 s; the first image moves in frame 1.

## What each beat shows (feature checklist)

- 1,400 landmarks → beat 2
- Custom stories → beat 3
- Custom voice, Alfie → beat 4
- Uber / private hire flow, scenic route priced from extra time → beat 5
- Themes → beat 6
- In-ride postcard, morph, Dynamic Island → beat 7
- QR / black cab flow → beat 8

## Built so it's easy to change later

The video isn't a screen recording. It's built from the same pieces as the
design, so a change is one edit and a re-render:

- `video.config.ts`: all copy, timings per beat, colours and which landmarks
  appear. Change a line, re-render.
- `components/Postcard.tsx`, `ThemeTile.tsx`, `RideCard.tsx`, `Phone.tsx`:
  React versions of the app's components. Change the postcard here and every
  beat that uses it updates (deck, fan, flip, end card).
- Theme colours, glyphs and names are read straight from the app's
  `static/v2/js/editions.js`, so the video always matches the live themes.
- Landmark photos and names come from the app's own data; the phone screens
  that are hard to rebuild (map, ride app) use the 3× Figma exports in
  `scripts/mockups/screens/`, which are already kept in sync.
- One command renders both formats.

## Needs from you

1. **Music:** a licensed track (or I make the cut to a click track and you
   drop music in later). LinkedIn mutes by default, so the video must work
   without it.
2. **Alfie:** I'll use the existing London Eye clip in the repo unless you
   prefer another of the recorded ones.
3. **Check the facts on screen:** "1,400 landmarks" (the README says about
   1,400), "9 themes", "+6 min · +£3.20" (example price).
