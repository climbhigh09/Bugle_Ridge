# Bugle Ridge

An offline, one-thumb spot-and-stalk elk and moose hunting game for your phone, built for playing on a hillside while you wait for a real elk to step out.

**Five seasons and an epilogue:** Colorado archery in the September rut, Colorado 2nd rifle on a cow tag, Idaho wolf country, Montana public land with grizzlies, an Alaska moose float hunt, and one more season with Grandpa Sam. Glass the hillside, plan a stalk against the wind and thermals, creep past the lead cow or call one in, make the shot, follow the blood trail, take care of the meat, and hear from Hank about what went wrong.

## Play it

- **Web, any phone including iPhone:** https://climbhigh09.github.io/Bugle_Ridge/
  Open it once with signal, then use *Add to Home Screen*. After that it works with no signal.
- **Android app:** [`docs/bugle-ridge.apk`](docs/bugle-ridge.apk). Open it, allow installing from that app, and tap *Install anyway* if Play Protect warns. On newer Samsung phones, turn off Auto Blocker first (Settings → Security and privacy).
- **Design storyboard:** [`docs/storyboard/`](https://climbhigh09.github.io/Bugle_Ridge/storyboard/)

## Updates

The game never goes online by itself. To update, open **Menu → Check for updates**. It asks GitHub Pages for `version.json`, downloads a newer build if there is one, and offers a restart. Your hunter and save stay on the phone either way.

To publish an update:

1. Change the game in `www/`.
2. Bump the version in `www/js/core.js`, `tools/build-web.js`, and `build.sh`.
3. Run `node tools/build-web.js`. This refreshes `docs/` and `docs/version.json`.
4. Commit and push to `main`. GitHub Pages redeploys in about a minute.
5. On the phone: **Menu → Check for updates → Restart now**.

Reinstall the APK only when `android/` (the wrapper) changes.

## How a day plays

| Screen | What you do |
|---|---|
| Camp | Pick a campsite, choose where to get water and how to treat it, then check the wind, the rut, and when the sun hits each slope. |
| Glassing | Drag to pan. Press and hold for binoculars. Let go on an animal to mark it. Nothing tells you what it is. |
| Stalk plan | Tap the topo map for up to 4 waypoints (uphill is the top). Stay in cover, off deadfall and shale, and keep your scent off them. |
| Stalk | Hold to move, lift to freeze. You hike when you're far out and hidden, sneak in the middle, and creep inside 60 yards. Move only when the lead animal's head is down. The phone buzzes when she looks up. |
| Calling | Cow mew, estrus, bugle, rake, wait, or slip crosswind. Bulls answer, hang up, or swing downwind. |
| The shot | Bow: hold to draw, slide the right pin onto the vitals, lift to shoot (pins: 20 green, 30 yellow, 40 red). Rifle: zeroed at 200 yd; the hash marks are your 300/400/500 holds; hold into the wind. |
| Blood trail | Read the arrow, pick how long to wait, then tap each drop of blood. |
| Meat | Gutless and boned out, quarters on the bone, or whole; then where to hang it. Heat, sun and predators spoil it. |
| Campfire | Hank names the one thing that went wrong, the skill fix, and, when gear really was the problem, the upgrade. |

The practice range (offered before the first season, and any time from the menu in bow seasons) teaches the pins on a foam 3D elk at known yardage. Skipping it is allowed. It's its own penalty.

## Rules of the trail

- Grandpa Sam tells you the tag rules before each season. Nobody reminds you in the field.
- Shoot an illegal animal (wrong sex, no brow tines, wrong zone, sub-legal moose, no predator tag, outside legal light) and the season is over.
- Wound one and lose it, and you spend the next day looking. A grizzly false charge also costs a day.
- Don't fill your tag and you retry that chapter next season, with your gear.
- Packing out takes a day per 5 miles from the truck for elk, twice that for moose or grizzly, and a day for anything else.
- Bear spray turns a charge and saves the day, but go back to that spot afterward and the worn-off spray draws a bear in. That kills you.
- Drink untreated water from a bad source and there's a 1-in-8 chance of dysentery. Dysentery kills you and you start over with a new hunter. It can also just find you now and then, anywhere but Alaska.
- Wolves and grizzlies are legal only with the tag.

## Built for the hill

- Pixel art on a 240×320 canvas, redrawn only when something changes. Idle screens run at 0 fps, and time only passes while you're glassing or creeping.
- Mostly near-black palette for OLED screens. Silent, no ads, no tracking. It uses the network only when you tap Check for updates.
- Saves on every decision and whenever you leave the app, so you can drop it the second a real elk shows up.
- Ridge mode dims the app so your face doesn't glow.

## Build it yourself

Needs JDK 17, the Android SDK (build-tools 37.0.0, platform 34), and Node 20+. No Gradle.

```bash
./build.sh                 # debug APK → build/bugle-ridge.apk
RELEASE=1 ./build.sh       # release APK → dist/bugle-ridge-<version>.apk (needs keys/, not in this repo)
node tools/build-web.js    # web build → dist/web, dist/bugle-ridge-web.zip, and docs/ for GitHub Pages
```

Release signing reads `keys/bugle-ridge-release.jks` and `keys/release.properties` (`STORE_PASS='…'` and `KEY_ALIAS='bugleridge'`). They're git-ignored on purpose. To make your own:

```bash
mkdir -p keys && keytool -genkeypair -keystore keys/bugle-ridge-release.jks -storetype PKCS12 \
  -alias bugleridge -keyalg RSA -keysize 4096 -validity 10000
```

## Layout

| Path | What it is |
|---|---|
| `www/` | The game: plain HTML5 canvas and JavaScript, no dependencies |
| `android/` | Thin WebView wrapper (fullscreen, vibration, Ridge-mode brightness, save on pause) |
| `tools/build-web.js` | Offline PWA build, icons, single-file page, and the `docs/` mirror |
| `docs/` | Generated GitHub Pages site, plus the hand-made storyboard |

## Roadmap

Weather, walk cycles, pack-out days, and more ground in each state.
