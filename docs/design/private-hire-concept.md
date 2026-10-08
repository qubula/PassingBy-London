# PassingBy in Uber and private hire: concept

Status: design concept. Nothing here is built yet, and nothing here has been
agreed with Uber or any other ride-hailing company. The working black cab
version of PassingBy is the basis for it.

## The idea in one line

When you book a ride, you can make it a PassingBy ride: a slightly longer
route past London's landmarks, shown with the extra time and the extra fare
before you agree, and a postcard and story for each landmark on the way.

## Why it works for everyone in the car

| Who | What they get |
|---|---|
| Rider | A tour of the city on a trip they were making anyway. They see the extra minutes, the extra cost and the landmarks before they choose it. |
| Driver | A longer trip, so a higher fare. No extra work: the route arrives as normal turn-by-turn directions. |
| Uber | More revenue per trip from its commission on the higher fare, and a feature other ride apps don't have. |

The fastest route is always the default. The PassingBy route is an opt-in
upgrade, never a surprise.

## How the route works

PassingBy already plans its route with Google Maps (the Directions API, with
the chosen landmarks added as waypoints). Most private hire drivers navigate
with Google Maps or Waze. So a PassingBy route is a normal route with a few
extra stops on the way, which the driver's navigation can follow without any
new tools. It is close to how a rider adds a stop in Uber today: the app shows
the new arrival time and fare, the rider confirms, and the driver's route
updates.

## When the rider chooses

1. **While waiting for the driver (the main moment).** After booking, there
   are usually a few minutes before pickup. A card on the waiting screen offers
   the upgrade:
   *"Make it a PassingBy ride: 6 landmarks · +6 min · +£3.20"*.
   One tap shows the two routes on a map, like the Choose Route screen in the
   black cab version, and a second tap confirms. This is the most valuable
   placement, because the route can still change before the car sets off.
2. **At the start of the ride.** If the rider skipped the upgrade, a quiet
   card in the trip screen offers stories for the route they're already on:
   *"4 landmarks on your route · Hear their stories"*. No extra cost, no
   detour.
3. **No pop-up when you get in the car.** Riders are busy greeting the driver
   and checking it's the right car. A modal at that moment would be dismissed
   unread, which is the same "too mysterious" problem the landing tests found.

## During the ride

- **In the app:** the same ride view as the black cab version: next stop on
  top, postcards, Audio switch, card that minimises to the map. Because the
  ride app already knows the pickup, destination and live position, there is
  no destination field and no location permission prompt.
- **Dynamic Island and Live Activity (iPhone):** many riders lock their phone
  and look out of the window. A Live Activity keeps the next landmark on the
  lock screen and in the Dynamic Island, like the live updates Uber and
  airlines already use.
  - Before pickup: *"PassingBy route · 6 landmarks"*.
  - Compact island: the theme glyph and *"200 m"*.
  - Expanded island and lock screen: landmark photo, name, *"On your left in
    200 m"*, and a tap to open the postcard.
  - In a real partnership this would live inside Uber's own trip Live
    Activity rather than as a second one.

## The QR code

The QR code is for rides without an in-app integration: black cabs today, and
private hire drivers who opt in before any partnership exists.

- **Placement:** on the back of the front headrest or seat-back holder, at
  eye level for the rear seats. In a black cab, on the partition next to the
  card reader, where passengers already look.
- **Wording:** a short line explains what it is before anyone scans, for
  example *"London's stories, as you pass them. Scan for a postcard of every
  landmark on this ride."*
- Scanning opens the web app (or an App Clip on iPhone) with nothing to
  install. The black cab version asks for the destination; the private hire
  version can read the trip if the driver's app shares it.

## What's realistic

- **Today:** the web app from a QR code or a shared link. This works now.
- **Next:** an iPhone App Clip from the same QR code, plus the Live Activity.
  Both are standard Apple features a small team can ship.
- **With a partner:** the waiting-screen upgrade, the in-trip card and the
  shared trip data. These need Uber (or another ride app) to build them in.

## Open questions

- How to price the detour: the normal per-minute and per-mile fare, or a flat
  upgrade price that is easier to understand.
- How to cap the detour so it never makes a trip much longer (the black cab
  version already limits it to a few minutes).
- Shared rides and very short trips: hide the offer when it doesn't make
  sense.

## What to test

The entry point is a good A/B test once there is real traffic: waiting-screen
card vs in-trip card vs notification, with the share of trips that start
stories as the main measure and cancelled or complained-about trips as the
guardrail. Until then, informal walkthroughs of the screens, as with the black
cab rounds.
