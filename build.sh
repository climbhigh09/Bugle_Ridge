#!/bin/bash
# Builds the APK with the SDK build-tools directly — no Gradle, no network.
#   ./build.sh             debug-signed (this Mac's debug key)  → build/bugle-ridge.apk
#   RELEASE=1 ./build.sh   release-signed with keys/ for sharing → dist/bugle-ridge-<version>.apk
set -euo pipefail
cd "$(dirname "$0")"

SDK="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
BT="$SDK/build-tools/37.0.0"
JAR="$SDK/platforms/android-34/android.jar"
OUT=build
VERSION_NAME=1.2.0
VERSION_CODE="${VERSION_CODE:-$(date +%s | cut -c1-9)}"

rm -rf "$OUT"
mkdir -p "$OUT/classes" "$OUT/dex" "$OUT/gen" "$OUT/assets"
cp -R www "$OUT/assets/www"

"$BT/aapt2" compile --dir android/res -o "$OUT/res.zip"
"$BT/aapt2" link -o "$OUT/unsigned.apk" -I "$JAR" \
  --manifest android/AndroidManifest.xml -A "$OUT/assets" --java "$OUT/gen" \
  --min-sdk-version 26 --target-sdk-version 34 \
  --version-code "$VERSION_CODE" --version-name "$VERSION_NAME" \
  "$OUT/res.zip"

javac -source 8 -target 8 -Xlint:-options -nowarn -classpath "$JAR" -d "$OUT/classes" \
  $(find android/src "$OUT/gen" -name '*.java')
"$BT/d8" --release --min-api 26 --lib "$JAR" --output "$OUT/dex" $(find "$OUT/classes" -name '*.class')
(cd "$OUT/dex" && zip -q ../unsigned.apk classes.dex)

"$BT/zipalign" -f -p 4 "$OUT/unsigned.apk" "$OUT/aligned.apk"

if [ "${RELEASE:-}" = "1" ]; then
  # keys/release.properties defines STORE_PASS and KEY_ALIAS. Back up keys/ — updates must be signed with this same key.
  set -a; source keys/release.properties; set +a
  mkdir -p dist
  "$BT/apksigner" sign --ks keys/bugle-ridge-release.jks --ks-key-alias "$KEY_ALIAS" \
    --ks-pass env:STORE_PASS --key-pass env:STORE_PASS \
    --out "dist/bugle-ridge-$VERSION_NAME.apk" "$OUT/aligned.apk"
  echo "Built $(pwd)/dist/bugle-ridge-$VERSION_NAME.apk (release)"
else
  "$BT/apksigner" sign --ks "$HOME/.android/debug.keystore" --ks-pass pass:android --key-pass pass:android \
    --out "$OUT/bugle-ridge.apk" "$OUT/aligned.apk"
  echo "Built $(pwd)/$OUT/bugle-ridge.apk (debug)"
fi
