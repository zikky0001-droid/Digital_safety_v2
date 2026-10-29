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
- `/install/android` — Median APK publishing instructions
- `/install/desktop` — browser extension installation instructions
- `/privacy` — privacy and incident-response guidance

## Desktop extension

The included source is in `browser-extension/`; a ZIP package is provided at `public/downloads/digitalsafety-browser-extension.zip`. It checks the current tab only after the visitor clicks it. Install instructions are in `browser-extension/README.md`.

## Important scope limit

This is not yet a full antivirus engine. Browser code cannot inspect all installed apps or scan the PC's filesystem. Android installed-app scanning and reliable eight-hour background scans require a custom native component, a defensible detection source, a persistent scheduler and testing. See `docs/MEDIAN_BUILD_GUIDE.md`, `docs/NATIVE_SCANNER_SPEC.md`, and `docs/PRODUCT_SCOPE.md` before describing or publishing the product.

The APK itself is not included in the repository. After creating and testing a real Median build, set the Vercel environment variable `VITE_ANDROID_APK_URL` to the official APK URL so the Android install page can show the download button.

## Validation note

The source was syntax-checked with TypeScript transpilation, and the browser extension JavaScript, service worker, and manifest JSON were checked. A full Vite production build still needs to be run after `npm install`; dependency installation could not complete in the editing environment because npm registry resolution timed out.
