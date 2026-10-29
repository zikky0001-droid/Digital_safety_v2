# Native scanning requirements — not implemented yet

## Goals

The proposed Android scanner should be transparent, user-pausable, and conservative. It should flag suspicious apps for review and must not claim to detect all trojans, spyware, adware or ransomware.

## Scan flow

1. Read the locally saved pause preference. If paused, stop and report `paused`.
2. Request only the permissions justified by the exact feature. Do not request contacts, call logs, SMS, VPN, Wi-Fi or location for app scanning.
3. Query only the app inventory scope approved for the distribution channel. Android 11+ filters installed package visibility by default; `QUERY_ALL_PACKAGES` is sensitive and may require a Play declaration/approval. A sideloaded app still has to obey Android runtime/platform restrictions.
4. Record minimum metadata needed for the scan: package name, version, installer/source where visible, signing-certificate digest, declared dangerous permissions and relevant APK hashes if the platform permits safe access.
5. Compare with local maintained detection definitions. Do not treat “sideloaded”, “requests accessibility”, “has overlay permission”, or “unknown publisher” as proof of malware; treat them as explainable risk signals.
6. Return findings with source/reason, confidence, timestamp and next action. Never delete an app automatically; send the user to Android Settings or the official app store to review it.
7. Store the last actual scan time. A result of zero findings means “no listed signatures/heuristics matched”, not “the device is clean”.

## Eight-hour periodic work

A native Android worker should be scheduled using a persistent scheduler such as WorkManager, with the app's pause state checked both before scheduling and at execution time. Android may defer periodic work; do not promise an exact eight-hour execution time. Recheck pause state after every app launch and after the user uses the notification's Pause action. When paused, cancel the unique periodic work and suppress future scan notifications.

## Frontend bridge contract

See `MEDIAN_BUILD_GUIDE.md` for the JavaScript contract expected by the current dashboard. The bridge must not be registered until backed by a tested native implementation. If unavailable, the UI correctly disables Scan Now.

## Call/SMS spam analysis is out of scope

The first release deliberately avoids call logs, SMS and contacts. These are high-sensitivity permissions; Google Play restricts them to defined core-functionality/default-handler scenarios and narrow exceptions. Use built-in phone spam protection or a separately reviewed caller-ID design rather than adding a permission merely because it exists.
