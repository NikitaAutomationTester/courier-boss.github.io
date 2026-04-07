#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

USER="${1:-}"
if [[ -z "$USER" ]]; then
  echo "Usage: $0 <login>"
  echo "Creates or updates ./.htpasswd for Nginx Basic Auth."
  exit 1
fi

if command -v htpasswd >/dev/null 2>&1; then
  if [[ -f .htpasswd ]]; then
    htpasswd .htpasswd "$USER"
  else
    htpasswd -c .htpasswd "$USER"
  fi
  echo "OK: .htpasswd updated."
  exit 0
fi

read -r -s -p "Password for $USER: " PASS
echo ""
read -r -s -p "Again: " PASS2
echo ""
if [[ "$PASS" != "$PASS2" ]]; then
  echo "Passwords do not match." >&2
  exit 1
fi
HASH="$(openssl passwd -apr1 "$PASS")"
if [[ -f .htpasswd ]]; then
  grep -v "^${USER}:" .htpasswd >.htpasswd.tmp || true
  mv .htpasswd.tmp .htpasswd
fi
printf '%s:%s\n' "$USER" "$HASH" >>.htpasswd
echo "OK: .htpasswd updated (openssl). Install apache2-utils for htpasswd if you prefer."
