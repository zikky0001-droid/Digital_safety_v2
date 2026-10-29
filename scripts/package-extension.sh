#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/public/downloads/digitalsafety-browser-extension.zip"
rm -f "$OUT"
(cd "$ROOT" && zip -qr "$OUT" browser-extension)
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
unzip -q "$OUT" -d "$TMP"
diff -ru "$ROOT/browser-extension" "$TMP/browser-extension"
printf 'Created and verified %s\n' "$OUT"
