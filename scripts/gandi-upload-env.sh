#!/usr/bin/env bash
# Upload production env to Gandi persistent volume (survives git deploy).
# Source: .env.local (gitignored). Destination: /lamp0/home/meridian.env via SFTP
# (maps to /srv/data/home/meridian.env at runtime). /lamp0/etc is not writable.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

SECRETS="$ROOT/.secrets/gandi.env"
ENV_LOCAL="$ROOT/.env.local"

if [[ ! -f "$SECRETS" ]]; then
  echo "Missing $SECRETS" >&2
  exit 1
fi
if [[ ! -f "$ENV_LOCAL" ]]; then
  echo "Missing $ENV_LOCAL" >&2
  exit 1
fi

# shellcheck disable=SC1090
source "$SECRETS"

: "${GANDI_USER:?}"
: "${GANDI_TOKEN:?}"
: "${GANDI_SFTP_HOST:?}"

TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT

# Copy runtime secrets only — never upload NextCloud paths or empty placeholders.
python3 - <<'PY' "$ENV_LOCAL" "$TMP"
from pathlib import Path
import sys
src, dst = Path(sys.argv[1]), Path(sys.argv[2])
keep_prefixes = (
  'OPENWEATHER_', 'UNSPLASH_', 'PEXELS_', 'RESEND_', 'SENDGRID_', 'AWS_',
  'SMTP_', 'DATABASE_', 'CRON_', 'ADMIN_', 'NEXT_PUBLIC_', 'GOOGLE_',
  'MERIDIAN_', 'STRIPE_', 'ADFEEE_', 'PLACE_CONTENT_', 'GEMINI_', 'OPENAI_',
  'VAPID_',
)
lines = []
for line in src.read_text().splitlines():
  raw = line.strip()
  if not raw or raw.startswith('#') or '=' not in raw:
    continue
  key, val = raw.split('=', 1)
  key = key.strip()
  # Skip empty values so uploads never wipe live secrets with blanks.
  if not val.strip().strip('"').strip("'"):
    continue
  if any(key.startswith(p) for p in keep_prefixes):
    lines.append(f'{key}={val}')
# Force production app URL + sqlite path on the volume
overrides = {
  'NEXT_PUBLIC_APP_URL': 'https://meridianweather.co.uk',
  'DATABASE_PATH': '/srv/data/home/meridian.db',
  'NODE_ENV': 'production',
}
by_key = {}
for line in lines:
  k, v = line.split('=', 1)
  by_key[k] = v
by_key.update(overrides)
out = [f'{k}={v}' for k, v in sorted(by_key.items())]
dst.write_text('\n'.join(out) + '\n')
print(f'wrote {len(out)} keys')
PY

REMOTE_ENV="/lamp0/home/meridian.env"

upload_with_sshpass() {
  export SSHPASS="$GANDI_TOKEN"
  OUT="$(
    sshpass -e sftp -o StrictHostKeyChecking=accept-new -o PreferredAuthentications=password -o PubkeyAuthentication=no \
      "${GANDI_USER}@${GANDI_SFTP_HOST}" <<EOF
put ${TMP} ${REMOTE_ENV}
bye
EOF
  )"
  printf '%s\n' "$OUT"
  if printf '%s\n' "$OUT" | grep -qi 'Permission denied\|Failure\|No such file'; then
    return 1
  fi
  return 0
}

upload_with_paramiko() {
  python3 - <<PY
from pathlib import Path
import paramiko
payload = Path(${TMP@Q}).read_text()
transport = paramiko.Transport(("${GANDI_SFTP_HOST}", 22))
transport.connect(username="${GANDI_USER}", password="${GANDI_TOKEN}")
sftp = paramiko.SFTPClient.from_transport(transport)
remote = "${REMOTE_ENV}"
with sftp.file(remote, "w") as f:
    f.write(payload)
sftp.close()
transport.close()
print(f"uploaded {remote}")
PY
}

if command -v sshpass >/dev/null 2>&1; then
  upload_with_sshpass || { echo "SFTP upload failed for ${REMOTE_ENV}" >&2; exit 1; }
else
  python3 -c 'import paramiko' 2>/dev/null || {
    echo "sshpass or python3-paramiko is required" >&2
    exit 1
  }
  upload_with_paramiko || { echo "SFTP upload failed for ${REMOTE_ENV}" >&2; exit 1; }
fi

echo "Uploaded persistent env to Gandi (${REMOTE_ENV})."