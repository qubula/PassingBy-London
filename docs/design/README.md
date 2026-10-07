# PassingBy v2: the redesign

I designed and built PassingBy in December 2025. In autumn 2026 I came back to
it, tested the interface informally and redesigned every screen. This folder
documents that redesign: what I tested, what changed, what didn't work and
what I plan to test next.

- **Design board (Figma):** [★ PassingBy — Design Iterations](https://www.figma.com/design/f4HvYvFfbI5Fi7HiI7SMpA/BlackCab-App-Wireframe?node-id=2008-108)
- **Live v2:** [passingby.uk/v2](https://www.passingby.uk/v2)
- **Original design (v1):** [v1 README](https://github.com/qubula/PassingBy-London/tree/v1-archive#readme) · live at [passingby.uk/mobile](https://www.passingby.uk/mobile)

## How the board is laid out

Each screen has one row on the Figma page, read left to right:

| Row | Round 1 | Round 2 | Final direction |
|---|---|---|---|
| Landing | Four layouts (A–D) | Two versions, plus a bonus that combines B and D | Two entry points: black cab and Uber / private hire |
| Choose Route | Four layouts | Two versions | Map, time difference and landmark list in one card |
| Choose Theme | Four layouts | Two versions | Large equal tiles, sorted by landmarks on the route |
| In-ride map | Four layouts | Two versions | Full card (04c) and postcard (04d), built as 04d |

Below the rows: the proto-personas, the feedback method, the theme system
(nine editions sharing one body), the testing summary slides, and clean copies
of the final screens used in this repo.

## How the feedback was gathered

I showed each round to peers, friends and people around me. It was not a
recruited or counted group, so the findings are directional, not statistical.
Nobody used it in a moving cab, and rounds 1 and 2 were static screens.

## Testing summary

![What informal feedback changed in PassingBy](../images/v2/testing/1-overview.png)

![Landing and Choose Route](../images/v2/testing/2-landing-and-route.png)

![Choose Theme and the ride](../images/v2/testing/3-theme-and-ride.png)

![Ideas I dropped, and why](../images/v2/testing/4-what-didnt-work.png)

![Next: making the testing more rigorous](../images/v2/testing/5-next-steps.png)

The last slide is a plan. None of it has been run yet.

## Final screens

| Landing (black cab) | Landing (Uber / private hire, concept) | Choose Route | Choose Theme |
|---|---|---|---|
| ![](../images/v2/screens/01-landing-black-cab.png) | ![](../images/v2/screens/02-landing-private-hire.png) | ![](../images/v2/screens/03-choose-route.png) | ![](../images/v2/screens/04-choose-theme.png) |

| Ride: map | Ride: postcard | Ride: story |
|---|---|---|
| ![](../images/v2/screens/05-ride-map.png) | ![](../images/v2/screens/06-ride-postcard.png) | ![](../images/v2/screens/07-ride-story.png) |

The black cab screens are built in v2. The Uber / private hire screen is a
design concept and is not built yet.

## Still to come

- The Uber / private hire entry point, with its own page and QR code.
- A mock-up of PassingBy inside a ride-hailing app (format still open, for
  example an App Clip-style card).
- Landmark audio in the ride, once the remaining recordings are in.

## Specs

- [`handoff-in-ride-map.md`](handoff-in-ride-map.md): interaction spec for the
  in-ride map (states, gestures, card size, Audio toggle, theme badge and
  colours).
