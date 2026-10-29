# Digital Safety Android build guide

This directory is a native Android WebView wrapper around the HTTPS Digital Safety dashboard. The wrapper uses package id `com.digitalsafety.app`, preserves the existing routes by loading `https://digitalsafetyv2.vercel.app/`, handles Android back navigation, blocks cleartext traffic, and shows a retry state when the dashboard cannot load. A debug APK and release AAB were compiled successfully in the review environment; runtime testing on a physical device/emulator remains required.

## Build with Android Studio

1. Install the current stable Android Studio and its Android SDK Platform 35 / Build Tools.
2. Open this `android/` directory as an existing Gradle project.
3. Let Android Studio download the Android Gradle Plugin and Gradle dependencies.
4. Connect an Android device or start an emulator with Android 6.0/API 23 or newer.
5. Run the `app` configuration.
6. For a release artifact, use **Build > Generate Signed Bundle / APK** and create or select your own signing key.

## Command-line build

From this directory, on a machine with a JDK, Android SDK, and Gradle 8.7+:

```bash
gradle assembleDebug
# output: app/build/outputs/apk/debug/app-debug.apk

gradle bundleRelease
# output: app/build/outputs/bundle/release/app-release.aab
```

A Gradle wrapper is not included in this ZIP. The verified build used Gradle 8.7 with Android SDK Platform 35. Before publishing or handing the project to another developer, run `gradle wrapper --gradle-version 8.7` and commit the generated wrapper files for reproducible builds.

## Permissions

| Permission | Status | Reason |
|---|---|---|
| `android.permission.INTERNET` | Requested | Load the HTTPS dashboard and its static assets. |
| Contacts, call log, SMS, microphone, camera, location, VPN, Wi-Fi, storage | Not requested | No implemented feature requires them. |
| Notifications | Not requested natively | The website may request supported browser/WebView notification capability only after the user chooses it; native push setup is not included. |

Cleartext HTTP is disabled through the manifest and `network_security_config.xml`. Do not add broad permissions for a future scanner without a documented feature, consent flow, platform review, and tests.

## Feature matrix

| Feature | Status in this project | Notes |
|---|---|---|
| Existing website routes | Implemented; native wrapper compiled | Loaded from the HTTPS Vercel dashboard; route runtime still needs device/browser testing. |
| Branding/icon/theme | Source implemented; device rendering not tested here | Launcher vector icon and dark theme included. |
| Back-button navigation | Implemented in Java | Goes back in WebView history, then exits at root. |
| Offline/load error state | Implemented in Java | Main-frame errors show a retry view. No fake result is generated. |
| HTTPS-only networking | Implemented in manifest/WebView policy | Cleartext traffic disabled. |
| URL review/message review/lessons | Implemented by website | Local frontend features; not native malware scanning. |
| Installed-app malware scan | Unavailable | No native detection engine or maintained definitions are supplied. |
| Exact eight-hour scan schedule | Unavailable | No WorkManager scanner is implemented; Android cannot guarantee an exact time. |
| Native push notifications | Unavailable | Requires a deliberately configured native provider/plugin. |
| Debug APK | Compiled and signature-verified | `app/build/outputs/apk/debug/app-debug.apk`; debug-signed and not a production release. |
| Release AAB | Compiled and test-signed copy verified | The supplied test-signed AAB is for validation only; replace its temporary signing identity with the publisher's key before Play distribution. |

## Updating the dashboard

The APK loads the URL in `MainActivity.java`. If the production domain changes, update `DASHBOARD_URL`, rebuild, and test every route on a real device. Alternatively, keep the stable domain and deploy frontend changes normally. The APK does not bundle the React source, so offline use is limited to whatever the WebView/service worker can cache after a successful online visit.

The deliverable folder contains a debug APK plus test-signed release APK/AAB copies. The release signing key was temporary and is deliberately not included. Do not publish the test-signed artifacts as the final Play Store release; generate a new publisher-controlled key and sign through your normal release process.

## Release checklist

- Build debug and signed release APK/AAB. The supplied debug APK is compile/signature verified; the release AAB still needs signing and device testing before publication.
- Test first launch, reload, airplane mode, permission denial, rotation, Android back, external links, all routes, long pages, and WebView storage.
- Verify the final HTTPS certificate/domain.
- Confirm no unneeded permissions appear in the generated merged manifest.
- Publish the signed APK only at an official HTTPS URL, then set `VITE_ANDROID_APK_URL` for the website.
- Never describe this wrapper as antivirus until a separate native scanner with real detection results exists.
