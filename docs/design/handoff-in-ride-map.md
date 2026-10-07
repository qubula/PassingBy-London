# Design handoff: in-ride map and theme badge

Notes for turning the final in-ride map design into code. The source is the
"04c · In-ride map — Final direction" board in the Figma file
[BlackCab App Wireframe](https://www.figma.com/design/f4HvYvFfbI5Fi7HiI7SMpA/BlackCab-App-Wireframe?node-id=2008-108),
page "★ PassingBy — Design Iterations".

Current implementation for comparison: `App/Web_App/templates/mobile/tour.html`
and `App/Web_App/static/mobile/js/tour_logic.js`.

## States

| State | What's on screen | How you get there |
|---|---|---|
| 1 · Minimised | Full map, next stop panel, Audio toggle, mini card at the bottom | Default when a landmark comes up. Swipe down from state 2. |
| 2 · Photo | Card with the whole landmark photo and a title panel | Swipe up on the mini card. Tap a landmark pin in state 1. Swipe down from state 3. |
| 3 · Story | Card with a small photo on top and the story text | Swipe up on the title panel in state 2. |

- Swipe up moves one state forward, swipe down moves one state back.
- In states 2 and 3, swipe sideways to go to the previous or next landmark.

## Card

- Fixed size, the same as round 1 version D: about 350 × 470 on a 390-wide
  screen, so the map stays visible above the card.
- The story text scrolls inside the card. When there is more text than fits,
  show a fade at the bottom and a thin scroll indicator.
- The photo uses `object-fit: contain` on a neutral background. Never crop the
  landmark: people use the photo to spot it out of the window.

## Map pins (state 1)

- Every landmark on the route is shown as a numbered pin.
- Minimum hit area 44 × 44 px, even if the pin is drawn smaller.
- Tapping a pin opens state 2 for that landmark and moves the card stack to it.

## Next stop panel

- Always visible at the top in all three states.
- Holds a 36 px theme badge on the left: a circle in the theme's body colour
  with its glyph in the accent colour (Figma component `PB/Theme badge`).
- This is the only theme styling during the ride. Map, cards, controls and type
  stay neutral for every theme.

## Audio

- The toggle label is "Audio" (was "Alfie's voice").
- The label "Audio" sits in a white pill next to an iOS-style switch. Off: light
  grey track (`#e5e5e5`), white knob on the left. On: dark track (`#2a2a2a`),
  white knob on the right. The knob has a soft shadow. No green, no blue.
- Small labels in the ride UI ("Next stop · in 2 min", "On your left · 200 m")
  are grey (`#6b7280`), not blue.
- When audio is on, the mini card shows "Stories are playing live"
  (was "Alfie is telling it").

## Theme editions (for the picker and the badge)

Colours are Figma variables under `edition/<theme>/body|ink|accent`. Ink is used
for text and passes WCAG AA (4.5:1) on its body. Accent is for glyphs and
graphics only (Architecture and Modern accents are about 3:1, so never use them
for text).

| Theme | Body | Ink | Accent | Name font |
|---|---|---|---|---|
| Surprise Me | `#111111` | `#FFFFFF` | `#EF4444` | JetBrains Mono Italic |
| Royal | `#3A1C9C` | `#FFFFFF` | `#FFC629` | Cinzel |
| Parks & Gardens | `#17803A` | `#FFFFFF` | `#C8F04B` | Fraunces |
| Historical | `#EAD9B0` | `#2A1A10` | `#B3261E` | Grenze Gotisch |
| Architecture | `#B8401C` | `#FFFFFF` | `#1E1E1E` | Big Shoulders Display |
| Museums & Galleries | `#F2EFE8` | `#111111` | `#1E3FD8` | Bodoni Moda |
| Religious | `#1F3A93` | `#FFFFFF` | `#F2B33D` | Cormorant Garamond |
| Modern London | `#FF5A1F` | `#111111` | `#FFFFFF` | Unbounded |
| Victorian Era | `#0E4B3B` | `#F3E3C3` | `#D4AF37` | Abril Fatface |

Theme picker tile (Figma component `PB/Theme tile`): 161 × 150, radius 12, flat,
14 px inset. Code label, count and "LANDMARKS" in a mono font. Glyph top-right.
Only the colours, the name font and the glyph change per theme.

## Alternative to test: postcard version (Figma board 04d)

Same flow and same state 1 as above. Only the way the landmark is shown
changes: the shipped postcard, tapped to flip, restyled to the current design
language (white card, Satoshi, no cream or vintage fonts).

| State | What's on screen | How you get there |
|---|---|---|
| 1 · Minimised | Same as the main version | Swipe down from the front or the back of the postcard |
| 2 · Postcard front | Photo in a white mount (whole, `object-fit: contain`), name, "On your left · 200 m", "Tap to read the story" | Swipe up on the mini card, or tap a landmark pin |
| 3 · Postcard back | Story text, the photo shrunk into a stamp top-right, "Tap to flip back" | Tap anywhere on the card front |

- Tap anywhere on the card flips it (the current code already does this on
  iOS: see commit "Flip landmark cards on a tap anywhere on the card").
- Swipe down minimises from either face.
- Swipe sideways moves to the previous or next postcard. Behind the card sits
  a neat deck: two same-size cards, no rotation, offset 12 px and 24 px to the
  right (and slightly shorter), so only their right edges peek out.
- The card plus its deck spans exactly the mini card's width (20 px side
  margins on a 390-wide screen): card about 326 px wide, deck edges filling the
  last 24 px. Height stays round 1 D's (about 470).
- The card keeps round 1 D's height. The story scrolls inside the back, with a
  fade and a scroll indicator.

Test 04c against 04d with the same task: "A landmark just came up. Find out
what it is and read about it, then go back to the map."

## Built in v2 (October 2026)

The postcard version (board 04d) is built at `/v2/tour`
(`templates/v2/tour.html`, `static/v2/js/tour_logic.js`, styles in
`static/v2/css/v2.css`). Notes from building it:

- Landmark audio is switched off for now (October 2026), because most of
  Alfie's recordings aren't made yet. Tapping the Audio toggle slides the switch
  on, shows a white pop-up under it ("Audio is coming soon / For now, tap a card
  to read its story."), then slides the switch back off after about 2.6 s. Tapping
  the pop-up closes it sooner. The landing page's "Hear Alfie" clip still plays.
- Earlier build, kept for when audio returns: turning audio on played the story on
  screen straight away, then each new landmark as it triggered. A landmark with an
  MP3 listed in `static/v2/js/narration.js` played Alfie; any other was read by
  the phone's built-in British English voice. Phones only allow sound after a tap,
  so audio must stay off by default.
- Before the first landmark triggers, the mini card previews the next stop.
  Once the person opens a card themselves, it stops following automatically.
- A landmark that triggers while the postcard is open doesn't replace it. It
  shows in the mini card when the postcard is minimised.
- The mini card and the postcard are one panel. Dragging the mini card up grows
  the panel from the mini card's size into the postcard, with its top edge under
  the finger (a clip-path reveal, bottom-anchored); the mini card's content fades
  out early and the postcard's fades in late. Pulling the postcard down shrinks
  it back the same way. On release a critically damped spring finishes the move
  at the finger's speed: past halfway or a fast flick opens or closes it.
- Tapping the mini card does nothing; only the drag opens it. Tapping a map pin
  opens that landmark's postcard with the same animation.
- "Stories are playing live" always shows on the mini card (it is a static label
  for now, whether or not audio is on). With landmark audio off it no longer
  matches what happens; see "Still to decide".
- Sideways drags follow the finger; a fast flick or a drag past 90 px moves to
  the next card, otherwise it springs back. The ride page is locked: it never scrolls or
  bounces, and the map takes one-finger drags. Only the story text scrolls.
- Choose Route starts the theme check in the background, so Choose Theme can
  show its counts straight away.
- Landmark pins (ride map and Choose Route map): light grey (`#D9D9D9`) teardrop,
  28 × 40 px, with the landmark number in black Satoshi in the round head. The
  tip sits on the landmark. Defined once in `static/v2/js/map_pins.js`.

## Still to decide

- What the mini card's "Stories are playing live" label should say while
  landmark audio is off.

- Whether Royal and Religious are too similar side by side (both blue-purple).
- Whether themed landmark cards are worth testing at all, now that the ride
  only shows the badge.
