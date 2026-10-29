# Digital Safety — DEVZIKKY

A responsive cybersecurity-awareness website with local URL and pasted-message warning-pattern reviews, occasional in-app safety notes, an optional permission centre, an origin-only cache utility, platform install guidance, and a user-triggered Chromium browser-extension preview.

## Run locally

```bash
npm install
npm run dev
```

## Build and check

```bash
npm run typecheck
npm run build
```

## Routes

- `/` — home
- `/learn` — learning exercises
- `/threat-library` — threat lessons
- `/safety-check` — personal safety checklist
- `/device-protection` — dashboard, local URL and suspicious-message reviews, optional permission centre, origin cache controls, and occasional in-app safety notes
- `/pros-cons` — platform features, trade-offs and honest limits
- `/install/android` — website/PWA installation, native wrapper, and APK publishing instructions
- `/install/desktop` — browser extension installation instructions
- `/privacy` — privacy and incident-response guidance

## Desktop extension

The included source is in `browser-extension/`; a ZIP package is provided at `public/downloads/digitalsafety-browser-extension.zip`. It checks the current tab only after the visitor clicks it. Install instructions are in `browser-extension/README.md`.

## Android project
The `android/` directory contains a native Java WebView wrapper for the HTTPS dashboard. It uses package id `com.digitalsafety.app`, includes a launcher icon and splash theme, handles back navigation and load errors, and requests only `INTERNET`. It does not implement an antivirus scanner or fabricate scan results. Build it with Android Studio or a machine with Android SDK and Gradle; see `android/BUILD_GUIDE.md`.

## Important scope limit

This is not yet a full antivirus engine. Browser code cannot inspect all installed apps or scan the PC's filesystem. Android installed-app scanning and reliable eight-hour background scans require a custom native component, a defensible detection source, a persistent scheduler and testing. See `docs/MEDIAN_BUILD_GUIDE.md`, `docs/NATIVE_SCANNER_SPEC.md`, and `docs/PRODUCT_SCOPE.md` before describing or publishing the product.

No tested APK is included in this source package. After building and testing the native project in `android/`, upload the signed APK to an official HTTPS location and set the Vercel environment variable `VITE_ANDROID_APK_URL` to that URL so the Android install page can show the download button.

## Validation note

The web project was validated with `npm run typecheck` and `npm run build`. The browser extension JavaScript, service worker, manifest JSON, PWA manifest, and nested extension ZIP were checked. The Android project is buildable source but was not compiled here because this environment has no Android SDK, Gradle installation, or emulator; follow `android/BUILD_GUIDE.md` on an Android build machine before treating an APK/AAB as tested.
