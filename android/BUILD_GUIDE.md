# Digital Safety Android build guide

This directory is a native Android WebView wrapper around the HTTPS Digital Safety dashboard. It is source code, not a tested APK. The wrapper uses package id `com.digitalsafety.app`, preserves the existing routes by loading `https://digitalsafetyv2.vercel.app/`, handles Android back navigation, blocks cleartext traffic, and shows a retry state when the dashboard cannot load.

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

A Gradle wrapper is not included because the review environment had Java but no Android SDK, Gradle installation, or wrapper distribution. Android Studio can generate/use the wrapper after opening the project. Before publishing, run `gradle wrapper --gradle-version 8.7` and commit the generated wrapper files.

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
| Existing website routes | Source implemented; native wrapper not compiled here | Loaded from the HTTPS Vercel dashboard. |
| Branding/icon/theme | Source implemented; device rendering not tested here | Launcher vector icon and dark theme included. |
| Back-button navigation | Implemented in Java | Goes back in WebView history, then exits at root. |
| Offline/load error state | Implemented in Java | Main-frame errors show a retry view. No fake result is generated. |
| HTTPS-only networking | Implemented in manifest/WebView policy | Cleartext traffic disabled. |
| URL review/message review/lessons | Implemented by website | Local frontend features; not native malware scanning. |
| Installed-app malware scan | Unavailable | No native detection engine or maintained definitions are supplied. |
| Exact eight-hour scan schedule | Unavailable | No WorkManager scanner is implemented; Android cannot guarantee an exact time. |
| Native push notifications | Unavailable | Requires a deliberately configured native provider/plugin. |
| APK/AAB | Not tested in this environment | Build on a machine with Android SDK/Gradle and sign before distribution. |

## Updating the dashboard

The APK loads the URL in `MainActivity.java`. If the production domain changes, update `DASHBOARD_URL`, rebuild, and test every route on a real device. Alternatively, keep the stable domain and deploy frontend changes normally. The APK does not bundle the React source, so offline use is limited to whatever the WebView/service worker can cache after a successful online visit.

## Release checklist

- Build debug and signed release APK/AAB.
- Test first launch, reload, airplane mode, permission denial, rotation, Android back, external links, all routes, long pages, and WebView storage.
- Verify the final HTTPS certificate/domain.
- Confirm no unneeded permissions appear in the generated merged manifest.
- Publish the signed APK only at an official HTTPS URL, then set `VITE_ANDROID_APK_URL` for the website.
- Never describe this wrapper as antivirus until a separate native scanner with real detection results exists.
