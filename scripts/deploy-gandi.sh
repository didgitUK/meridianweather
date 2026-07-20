#!/usr/bin/env bash
# Deploy meridian to Gandi Web Hosting (Node.js / default.git).
# Credentials: .secrets/gandi.env (gitignored). Never pass tokens on the CLI history if avoidable.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

SECRETS="$ROOT/.secrets/gandi.env"
if [[ ! -f "$SECRETS" ]]; then
  echo "Missing $SECRETS — create it before deploying." >&2
  exit 1
fi

# shellcheck disable=SC1090
source "$SECRETS"

: "${GANDI_USER:?}"
: "${GANDI_TOKEN:?}"
: "${GANDI_GIT_HOST:?}"

REMOTE_URL="git+ssh://${GANDI_USER}@${GANDI_GIT_HOST}/default.git"
# Gandi deploy defaults to master; local branch is usually main.
BRANCH="${1:-master}"
LOCAL_REF="${2:-HEAD}"

if ! command -v git >/dev/null 2>&1; then
  echo "git is required." >&2
  exit 1
fi

if ! command -v sshpass >/dev/null 2>&1; then
  echo "sshpass is required for token auth." >&2
  exit 1
fi

export SSHPASS="$GANDI_TOKEN"
SSH_CMD=(sshpass -e ssh -o StrictHostKeyChecking=accept-new -o PreferredAuthentications=password -o PubkeyAuthentication=no)

if ! git remote get-url gandi >/dev/null 2>&1; then
  git remote add gandi "$REMOTE_URL"
else
  git remote set-url gandi "$REMOTE_URL"
fi

echo "Pushing ${LOCAL_REF} → gandi/${BRANCH}…"
GIT_SSH_COMMAND="${SSH_CMD[*]}" git push gandi "${LOCAL_REF}:refs/heads/${BRANCH}"

echo "Running remote deploy (branch=${BRANCH})…"
"${SSH_CMD[@]}" "${GANDI_USER}@${GANDI_GIT_HOST}" "deploy default.git ${BRANCH}"

echo "Done. Check https://${GANDI_DOMAIN:-meridianweather.co.uk} and /srv/data/var/log/www/nodejs.log if needed."
