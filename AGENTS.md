# PassingBy: notes for AI agents

PassingBy is a mobile web app that turns a London cab ride (or walk) into a
tour: it plans a route past landmarks and shows a story card for each one as
you pass it, narrated by Alfie, a London cabbie voice. See `README.md` for the
product and the data pipeline.

## Two versions run side by side

| | v1 (shipped, archived) | v2 (redesign in progress) |
|---|---|---|
| URLs | `/mobile`, `/mobile/destination`, `/mobile/route-mode`, `/mobile/tour-type`, `/mobile/tour` | the same paths under `/v2` |
| Templates | `App/Web_App/templates/mobile/` | `App/Web_App/templates/v2/` |
| CSS, JS, images | `App/Web_App/static/mobile/` | `App/Web_App/static/v2/` |
| Browser storage keys | `alfie_*`, `tour_redirect_attempted` | `pb_v2_*` |
| Frozen copy | branch `v1-archive` (do not push to it) | — |

- v1 was designed and built from December 2025. v2 is the same product,
  revisited and redesigned in autumn 2026 after informal feedback rounds.
- v2 started as an exact copy of v1. Only its paths and storage keys differ.
  It will change screen by screen to match the new design.
- **Do not change v1 files** (`templates/mobile/`, `static/mobile/`, the
  `/mobile` routes) unless the user asks for a v1 fix. v1 is the working
  fallback.
- Both versions share everything else: `server.py` API routes, `App/*.py`
  (routing, landmarks, stories), `Data/`, fonts in `App/Web_App/static/fonts/`
  and Alfie's audio.
- Keep v2 links inside v2 (`/v2/...`, `/static/v2/...`). Never link from v2
  back into `/mobile`.

## v2 build status and files

All four v2 screens are built. Each one's Figma source is in the sync table below.

| Screen | Template | Script |
|---|---|---|
| Landing (black cab entry point) | `templates/v2/index.html` | `static/v2/js/location.js` |
| Choose Route | `templates/v2/route_mode.html` | `static/v2/js/route_selection.js` |
| Choose Theme | `templates/v2/tour_type.html` | `static/v2/js/tour_selection.js` |
| Ride (postcard version, board 04d) | `templates/v2/tour.html` | `static/v2/js/tour_logic.js` |

- New v2 styles: `static/v2/css/v2.css` (loaded after the copied `style.css`).
- Theme edition colours, fonts and glyphs: `static/v2/js/editions.js`, shared by the
  theme tiles and the ride's theme badge. Keep it in sync with the handoff doc.
- Landmark audio is switched off in the v2 preview. The ride's Audio toggle
  only shows an "Audio is coming soon" pop-up and plays nothing (no Alfie clips,
  no phone voice). The landing page's "Hear Alfie" clip still plays. Samples of
  Alfie's narration will be in the promo video instead.
- When landmark audio comes back: `static/v2/js/narration.js` (not loaded at the
  moment) lists the MP3s in `static/v2/audio/narration/`. Only 3 exist so far;
  about 100 more are being generated. Never describe the phone's built-in voice
  as Alfie.
- `templates/v2/destination.html` is no longer linked: the landing has the
  destination field. The Uber / private hire entry point is a separate concept
  still to build (it gets its own URL and QR code).
- v2 uses the same API endpoints as v1 (`/api/plan-route`,
  `/api/check-tour-availability`); there are no v2-only endpoints.

## Design source for v2

- Figma file "BlackCab App Wireframe", page "★ PassingBy — Design Iterations":
  https://www.figma.com/design/f4HvYvFfbI5Fi7HiI7SMpA/BlackCab-App-Wireframe?node-id=2008-108
  Each screen reads left to right: round 1, round 2, final direction. Build
  from the frames in the sync table below. Choose Theme comes from "05b",
  not from the "03c" final board.
- Figma page "★ PassingBy — Sticker & QR": five in-car sticker directions.
  Each QR code encodes https://www.passingby.uk/v2 (error correction H) and
  was checked with a ZXing decoder. Re-check any restyled QR before printing.
- Figma page "★ PassingBy — Live Activity & ride app": lock screen Live
  Activity, Dynamic Island and ride-app entry points for
  `docs/design/private-hire-concept.md`. Ride-app screens follow ride-hailing
  patterns but carry no real company logo and are labelled as a concept.
  SF Pro is listed in Figma but does not render through the API; use Inter.
- `docs/design/README.md`: the redesign write-up (testing summary slides,
  final screens). The README and this page use PNG exports from the Figma
  frames "06 · Testing summary" and "07 · Clean screens for GitHub and
  portfolio exports", saved in `docs/images/v2/`. Re-export them when the design changes.
## Keep code and Figma in sync (required)

The live v2 code is the source of truth. Figma must always show what the code
draws, because the README and portfolio images are exported from Figma.

| Screen | Code | Figma source frame (page "★ PassingBy — Design Iterations") |
|---|---|---|
| Landing, black cab | `templates/v2/index.html` | "Landing Final / Black cab" in 01c |
| Landing, Uber / private hire | not built (concept) | "Landing Final / Uber · private hire concept" in 01c |
| Choose Route | `templates/v2/route_mode.html`, `route_selection.js` | "Route Final" in 02c |
| Choose Theme | `templates/v2/tour_type.html`, `tour_selection.js`, `editions.js` | "Theme v2 / Picker" in 05b |
| Ride | `templates/v2/tour.html`, `tour_logic.js`, `map_pins.js` | "Map Postcard / 1–3" in 04d |

Shared parts are Figma components on the Components page. Change the component
when the code changes, and every board updates:
`PB/Audio switch` (`.v2-audio`, `.v2-switch`), `PB/Map pin` (`map_pins.js`),
`PB/End ride button` (`.v2-end`), `PB/Theme badge` (`editions.js`),
`PB/Ride map` (the ride map: a real London map in the `DARK_MAP` colours from
`tour_logic.js`, with the route, pins and position dot drawn as the code draws
them). Never draw a placeholder map on a final board; use `PB/Ride map`.
Regenerate its image with `scripts/figma/ride_map.js` if the map style changes.

Rules:
1. **Any visual change in v2 code** (colour, size, copy, a new or removed
   element) must update the matching Figma frame or component in the same
   task. If that can't be done, say so to the user before finishing.
2. **Before exporting images**, read the current code for each screen and
   check the Figma frame against it: copy, controls, map pins, route line,
   badge and buttons. Never export from an old board or an old copy.
3. Testing slides 2–5 ("06 · Testing summary") show each screen's round 1,
   round 2 and final frames, copied from the boards, with the verdict and
   reason for each. Verdicts come only from the user's feedback and the
   "Round 2 — my decision" notes on the boards. Rebuild a slide when a final
   frame changes.
4. Mockups (`docs/images/v2/mockups/`) are rendered by
   `scripts/mockups/render.mjs` from 3x exports of the source frames with the
   status bar and home indicator removed (`scripts/mockups/screens/`); the
   script draws the device, status bar and island. Re-export those screens and
   re-render when a final frame changes. Phones have no drop shadow (the
   user's choice). `advert` and `advert-single` add product copy around the
   phones; keep that copy factual and in line with the README.
5. Exports are rebuilt from the source frames above. Never edit the copies in
   "07 · Clean screens" or the slide images by hand.
6. Round 1 and round 2 boards are a historical record. Leave them unchanged.

- The root `README.md` is the project's portfolio page. It describes v2 and
  links to the v1 README on the `v1-archive` branch. v1 screenshots stay in
  `docs/images/screenshots/`.
- `docs/design/handoff-in-ride-map.md`: interaction spec for the in-ride map
  (states, gestures, card size, Audio toggle, theme badge, theme colours).
- The product font is Satoshi (`App/Web_App/static/fonts/`). Figma uses DM Sans
  only as a stand-in; use Satoshi in code.
- Feedback behind the design came from peers, friends and people around the
  designer, not a recruited or counted group. Never describe it as formal
  research, and never invent participant numbers or metrics.

## Running locally

```bash
pip install -r requirements.txt
cp .env.example .env          # add GOOGLE_MAPS_BROWSER_KEY and GOOGLE_DIRECTIONS_KEY
uvicorn server:app --reload
```

Open http://localhost:8000/mobile (v1) or http://localhost:8000/v2 (v2).
Maps, routing and GPS need the Google keys and, on a phone, HTTPS
(`start_https.sh`).

## Working conventions

- Plain English in docs and UI copy. No marketing language.
- Ask before committing or pushing; the user reviews changes first.
