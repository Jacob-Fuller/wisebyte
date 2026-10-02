# Wisebyte for iOS

The iOS app is the Wisebyte web app (the repo root) wrapped with Capacitor.
Nothing here needs a Mac: Codemagic builds it in the cloud and uploads it
to TestFlight.

## What's in this folder

| Path | What it is |
|---|---|
| `package.json` | Capacitor 7, the Apple purchases plugin (cordova-plugin-purchase) |
| `capacitor.config.json` | Bundle ID `au.wisebyte.wisebyte`, app name, background colour |
| `scripts/copy-web.js` | Copies the web app into `www/` (leaves out Go, Scroll, Kids and browser-only files) |
| `scripts/patch-ios.js` | Adds the App Group, the SharedEntitlement plugin, icon, launch screen, portrait-only, iPhone-only |
| `native/` | Swift files and entitlements copied into the Xcode project |
| `resources/` | 1024px app icon and launch screen |
| `../codemagic.yaml` | The cloud build: generate project → sign → build → TestFlight |

`ios/`, `www/` and `node_modules/` are generated on every build and aren't committed.

## One-time setup

**Apple Developer** (developer.apple.com → Certificates, Identifiers & Profiles)
1. App Group: `group.au.wisebyte.shared`
2. App ID: `au.wisebyte.wisebyte`, with In-App Purchase and App Groups (tick the group above)

**App Store Connect**
3. New app: iOS, name "Wisebyte", bundle ID `au.wisebyte.wisebyte`, SKU `wisebyte-ios`
4. Copy the app's Apple ID (App Information page) into `APP_STORE_APPLE_ID` in `codemagic.yaml`
5. Users and Access → Integrations → App Store Connect API → generate a key with **App Manager** access. Download the .p8 (only possible once) and note the Issuer ID and Key ID.

**Codemagic** (codemagic.io, sign in with GitHub)
6. Add the `Jacob-Fuller/wisebyte` repo.
7. Team settings → Integrations → App Store Connect → add the key from step 5, named exactly `Wisebyte ASC`.
8. Team settings → Code signing identities → iOS certificates → generate an Apple Distribution certificate from the integration; then iOS provisioning profiles → fetch the App Store profile for `au.wisebyte.wisebyte`.
9. Start the `wisebyte-ios` workflow. The build appears in TestFlight about 15 minutes after it finishes.

## Local test build (optional, needs a Mac)

```
cd ios-app
npm install
npm run prepare-ios
npx cap open ios
```
