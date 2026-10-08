# PassingBy as an iPhone App Clip: what it would take

Status: research note. Nothing here is built. Facts come from Apple's App Clip
documentation (links at the end), checked in October 2026.

## Recommendation

Keep the web app as the main product and add an App Clip on top. The web app
works on every phone and costs nothing to open. The App Clip adds the things a
web page can't do on iPhone: a Live Activity on the lock screen and in the
Dynamic Island, and short-lived notifications. Both open from the same QR
sticker; on iPhone the App Clip card appears, and other phones go to the web
app.

## What an App Clip can do for PassingBy

| | Web app | App Clip |
|---|---|---|
| Opens from the QR sticker, nothing to install | Yes | Yes (App Clip card) |
| Works on Android | Yes | No |
| Lock screen Live Activity and Dynamic Island | No | Yes, through a Live Activity widget extension (iOS 16 and later) |
| Notifications without asking | No | Yes, for up to 8 hours after each launch |
| Location | While the page is open | "When In Use" only; resets at 4:00 the next day |
| Keeps working with the phone locked | No | The app itself can't run in the background; the Live Activity is updated by push from a server |
| Apple Pay, Sign in with Apple | Limited | Yes |
| Speed and feel | Good | Native animations, gestures and maps |

## The catch that matters most

An App Clip can't do background work, and it only gets "When In Use"
location. Once the phone is locked, the App Clip can't track the car's
position itself. So the "On your left in 200 m" Live Activity has to be
updated by a server sending push updates, and the server needs to know where
the car is:

- **Black cab via the sticker:** the server can only estimate progress from
  the planned route and the time since the ride started. Good enough for
  "Elizabeth Tower in about 2 min", not for exact distances.
- **Ride-app partnership:** the ride app already knows the car's live
  position from the driver's app, so updates can be exact. This is a strong
  argument for the partnership.

## Limits to design around

- **Size:** an App Clip opened from a QR code, NFC tag or App Clip Code must
  stay under 15 MB uncompressed. The 100 MB limit on iOS 17 and later only
  applies to App Clips opened digitally (from a website or Spotlight), or
  through Apple's App Clip demo link. So
  landmark photos, stories and audio are streamed from the server, not
  bundled. Apple's MapKit is a better choice than the Google Maps iOS SDK,
  which would eat most of the budget.
- **A full app is required.** Apple only allows an App Clip as part of a full
  app on the App Store that offers at least the same features. The full app
  can be small: the same ride flow, plus saved rides.
- **Apple Developer Program** membership is needed to publish (yearly fee).

## How hard it would be

The backend doesn't change: the App Clip would call the same `/api/plan-route`
and `/api/check-tour-availability` endpoints as the web app. The work is the
front end, rewritten in Swift and SwiftUI:

| Part | Work |
|---|---|
| Landing, Choose Route, Choose Theme | Rebuild the four screens in SwiftUI from the Figma frames. Straightforward. |
| Ride map, postcard deck, flip, swipe | The hardest screen to rebuild, but SwiftUI gestures and MapKit make it smoother than the web version. |
| Live Activity and Dynamic Island | A widget extension with the designs on the Live Activity Figma page, plus server push updates. |
| Server | Add Apple push (APNs) for Live Activity updates and the progress estimate described above. |
| App Store | Full app, App Clip experience in App Store Connect, associated domain on passingby.uk, review. |

It needs a Mac with Xcode, and it can't be built or tested in this cloud
environment. For one person learning Swift with AI help, expect a few weeks
for a working App Clip and a minimal full app, plus App Store review time.
The design work is already done: the Figma screens and the Live Activity page
carry over directly.

## Suggested order

1. Keep improving the web app; it stays the version everyone can use.
2. Build the Live Activity first in a small test app, to prove the lock
   screen and Dynamic Island designs work with push updates.
3. Wrap the four screens as the App Clip and a minimal full app.
4. Point the sticker's QR at the same URL; set up the App Clip experience so
   iPhones get the App Clip card and everything else gets the web app.

## Sources

- [Choosing the right functionality for your App Clip](https://developer.apple.com/documentation/appclip/choosing-the-right-functionality-for-your-app-clip)
- [Offering Live Activities with your App Clip](https://developer.apple.com/documentation/appclip/offering-live-activities-with-your-app-clip)
- [Enabling notifications in App Clips](https://developer.apple.com/documentation/appclip/enabling-notifications-in-app-clips)
- [Creating an App Clip with Xcode](https://developer.apple.com/documentation/appclip/creating-an-app-clip-with-xcode)
- [ActivityKit](https://developer.apple.com/documentation/activitykit)
