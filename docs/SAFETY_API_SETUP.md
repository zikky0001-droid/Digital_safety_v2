# Digital Safety API setup (Vercel)

## Files added/changed

- `api/safety/check-link.js` — submits a URL to URLScan.io.
- `api/safety/link-result.js` — retrieves and normalizes a completed URLScan report.
- `api/safety/check-message.js` — adds the private analysis instruction and calls DEVZIKKY AI.
- `src/App.tsx` — connects the existing link checker and the new one-message AI checker.
- `.env.example` — names and example values for server-side environment variables.

## Vercel environment variables

In Vercel → Project → Settings → Environment Variables, add:

- `LINK_URL` = `https://urlscan.io/api/v1/scan/`
- `LINK_URL_APIKEY` = your URLScan.io API key
- `SPAM_URL` = `https://devzikky.onrender.com/api/chat`

These are server-side variables. Do not rename them with a `VITE_` prefix. Redeploy after adding or changing them.

## API routes

- `POST /api/safety/check-link` with `{ "url": "https://example.com", "publicScanConsent": true }`
- `GET /api/safety/link-result?id=<uuid>` (called by the frontend while URLScan processes the submission)
- `POST /api/safety/check-message` with `{ "message": "message text" }`

The browser never receives the URLScan API key. The message-analysis prompt is stored in `api/safety/check-message.js`, not sent from the browser. DEVZIKKY AI receives one combined message and `history: []`.

## URLScan privacy

The current link submission uses URLScan visibility `public`, matching the supplied Termux workflow. The UI requires explicit acknowledgement before submission. Public submissions may expose the scanned URL, page content, and scan details. Do not submit private, authenticated, internal, or personal URLs.

## Message privacy

Submitted message text is sent to the configured DEVZIKKY AI endpoint for analysis. Users should remove names, phone numbers, account details, verification codes, and other private information before submitting. The AI percentage is an indicative model assessment, not a calibrated probability or guarantee. A missing percentage is shown as unavailable rather than invented.

## Deployment and verification

1. Add the changed/new files to the matching paths in the existing repository.
2. Add the three environment variables in Vercel.
3. Redeploy the Vercel project.
4. Test a harmless public URL first and verify the report link opens.
5. Test a fictional message containing no personal information.
6. Check Vercel Function Logs if either provider returns an error.

The Vercel project must deploy from the repository root containing `package.json`, `src/`, and `api/`. Vercel automatically exposes files under `api/` as serverless functions. No separate Express server is required.
