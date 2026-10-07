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

## Design source for v2

- Figma file "BlackCab App Wireframe", page "★ PassingBy — Design Iterations":
  https://www.figma.com/design/f4HvYvFfbI5Fi7HiI7SMpA/BlackCab-App-Wireframe?node-id=2008-108
  Each screen reads left to right: round 1, round 2, final direction. Build
  from the boards marked "Final direction".
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
