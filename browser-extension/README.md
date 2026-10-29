# Digital Safety — Browser Extension (Preview)

A free Chrome/Edge-compatible Manifest V3 extension that runs a user-triggered review of the current tab's URL and up to 200 visible links. It uses local URL-format heuristics and does not send browser data to a server.

## Install locally
1. Extract `digitalsafety-browser-extension.zip`.
2. In Chrome, open `chrome://extensions`; in Edge, open `edge://extensions`.
3. Enable Developer mode.
4. Select **Load unpacked** and choose the extracted `browser-extension` folder.
5. Pin the extension. Open an ordinary website and click the extension, then **Review current page**.

## Current scope
- User-triggered only; the user must click the extension.
- Checks page URL and visible links for a limited set of warning signs such as non-HTTPS URLs, punycode labels, embedded URL credentials, raw IP hosts, excessive subdomain levels, link shorteners, and mismatched visible host text.
- No external API, server, or analytics requests.
- It does not block navigation, inspect downloaded files, check live threat reputation, scan installed Windows/macOS applications, or certify websites as safe.

Before publishing to the Chrome Web Store or Edge Add-ons, review required store declarations, permissions, screenshots, privacy disclosures and current policies. Do not describe this preview as a full antivirus.
