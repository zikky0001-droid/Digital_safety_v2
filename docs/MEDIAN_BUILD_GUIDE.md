# Digital Safety — Median.co build and permission guide

This repository is a React/Vite website with an Android WebView route plan and a user-triggered desktop browser extension. The website alone is **not a device-wide antivirus engine**. Read this guide before publishing or advertising any scan feature.

## Features in this repository

- Responsive website/dashboard, security articles, local URL-pattern review, local pasted-message scam-pattern review, and the Pros & Cons route.
- A permission centre. Nothing requests permission at page load. Location and notifications are user-triggered and optional.
- A cache utility that measures this origin's browser storage where supported, deletes only Cache Storage names prefixed `digital-safety`, and calls Median's WebView cache clear only when that bridge is present.
- A browser extension preview that checks the current browser tab only after a user clicks its toolbar button. It does not upload browsing data.
- Android and PC install instructions. The Android APK link remains disabled until an APK is actually built and uploaded.

## Median App Studio checklist

1. Set the website URL to `https://digitalsafetyv2.vercel.app`.
2. Test the website in a real Android device build, not only in the browser or simulator.
3. Do not add contacts, SMS, call-log, microphone, Wi-Fi or VPN permissions to this version.
4. Location is optional. The website asks only after the user taps the location button. It ignores the returned coordinates and does not send or store them. If the native wrapper requires a location plugin/usage description, configure it only for this optional action.
5. For native push notifications, configure Median's OneSignal plugin, Firebase Cloud Messaging credentials and the app's OneSignal identifier. Disable automatic registration if you want the app to request notifications only after the user taps **Enable notifications**. Follow Median's current consent documentation and test on a physical device. Do not store a OneSignal REST API key in browser JavaScript.
6. The website's service worker can show an example browser notification on supported HTTPS browser contexts. It is not a reliable replacement for native push and does not provide background scanning.
7. Median's `median.webview.clearCache()` is used only if the bridge exists. Test cache and session behavior on each supported platform before relying on it. It is a WebView cache control, not a system-wide cleanup API.
8. Before release, check the actual Android manifest/permissions emitted by Median. Remove any permission not tied to a shipped and disclosed feature.

## Connecting a real Android scan engine

The dashboard looks for a custom bridge at `window.digitalSafetyScanner` with the following contract:

```ts
window.digitalSafetyScanner = {
  getStatus: async () => ({
    available: true,
    paused: false,
    lastScanAt: null,
    nextScanAt: null,
    message: 'Native app-audit engine is ready.'
  }),
  scanInstalledApps: async () => ({
    status: 'completed',
    scanned: 0,
    findings: [],
    message: 'Results from the actual native scanner.'
  }),
  setPaused: async (paused) => { /* persist scanner state */ }
};
```

This is an integration interface only. No such scanner implementation is shipped in this repository. A real implementation must return findings only after an actual scan, explain false positives, and support cancellation. Never return a fabricated “clean” result.

A native scanner needs at least:

- An Android native component that inspects installed-package metadata and, where safe and legally available, application signing information and file hashes.
- A defensible detection method: maintained signatures/reputation data or a proven scanning engine. A name/permission heuristic alone can only flag apps for review; it cannot prove malware.
- A documented privacy model for installed-app inventory. Broad package visibility is restricted on Android 11+ and is considered sensitive data; check current platform/store requirements before requesting `QUERY_ALL_PACKAGES`.
- A review-first remediation flow. Do not automatically delete apps based on name, permission or heuristic matches.
- A native scheduler, pause/resume state, cancellation path, and local notification action. The Pause action must cancel or disable the scheduled scan work, not merely hide the banner.
- An update path for detection definitions. A fully free/no-backend build can bundle definitions with releases, but those definitions become stale until the app is updated.

## Eight-hour schedule

Do not schedule browser JavaScript to claim that it scans while the page is closed. For Android, a native worker (normally Android WorkManager) is needed. WorkManager treats the interval as a minimum and the operating system can defer execution for battery and system constraints; eight hours is not an exact-time guarantee. The worker needs to check that scanning is enabled, run the real scan, store its actual timestamp/results, and post a local notification with a **Pause scans** action.

## APK publishing

1. Build the Android package in Median only after the native scanner scope is clear.
2. Test on a real Android phone, including denied permissions, offline behavior, reboot, battery saver, pause/cancel behavior, and false positive handling.
3. Upload the APK to a stable official URL under your own domain or hosting account.
4. Set Vercel environment variable `VITE_ANDROID_APK_URL` to that exact APK URL and redeploy. The install page will then show the download button.
5. The APK is not included in this ZIP; no fake download link is provided.

## Free scope and trade-offs

No backend is needed for the current URL heuristic, lessons, origin-only cache controls, or extension. Live URL reputation, regularly updated malware definitions, remote push campaigns, or cloud file scanning would need a service/provider and ongoing maintenance. Native periodic scanning can run locally but still requires a correctly engineered native component and updates.
