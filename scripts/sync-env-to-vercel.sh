#!/usr/bin/env bash
# Push a local .env file's variables into a Vercel project.
#
# Prereqs (one-time, interactive — run yourself):
#   npm i -g vercel        # or use `bunx vercel`
#   vercel login
#   cd apps/web && vercel link      # link this dir to its Vercel project
#   cd apps/api && vercel link
#
# Usage:
#   bash scripts/sync-env-to-vercel.sh apps/web/.env.local production
#   bash scripts/sync-env-to-vercel.sh apps/api/.env         production
#
# Target env defaults to "production" (also: preview, development).
# NOTE: never sync SUPABASE_SERVICE_ROLE_KEY / secrets to a *web/mobile* project.
set -euo pipefail

ENV_FILE="${1:?usage: sync-env-to-vercel.sh <env-file> [target]}"
TARGET="${2:-production}"
DIR="$(dirname "$ENV_FILE")"

echo "Syncing $ENV_FILE → Vercel ($TARGET) for project in $DIR"
cd "$DIR"

grep -vE '^\s*#|^\s*$' "$(basename "$ENV_FILE")" | while IFS='=' read -r key val; do
  key="$(echo "$key" | xargs)"
  [ -z "$key" ] && continue
  # strip surrounding quotes
  val="${val%\"}"; val="${val#\"}"
  echo "  + $key"
  # remove existing var (ignore failure), then add
  bunx vercel env rm "$key" "$TARGET" -y >/dev/null 2>&1 || true
  printf '%s' "$val" | bunx vercel env add "$key" "$TARGET" >/dev/null
done

echo "Done. Pull to verify:  bunx vercel env pull .env.vercel.$TARGET"
