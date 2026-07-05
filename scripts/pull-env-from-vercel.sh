#!/usr/bin/env bash
# Regenerate local .env files from Vercel (source of truth).
# Use this on a fresh clone / new PC instead of hand-writing .env.
#
# Prereqs (one-time per machine, interactive):
#   bunx vercel login
#   cd apps/web && bunx vercel link   # link each app dir to its Vercel project
#   cd apps/api && bunx vercel link
#
# Usage:
#   bash scripts/pull-env-from-vercel.sh [environment]   # default: development
set -euo pipefail

ENVIRONMENT="${1:-development}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

pull() {
  local dir="$1" out="$2"
  if [ -d "$ROOT/$dir/.vercel" ]; then
    echo "↓ $dir  →  $out"
    (cd "$ROOT/$dir" && bunx vercel env pull "$out" --environment "$ENVIRONMENT" --yes)
  else
    echo "⚠ $dir 미연결 — 먼저 'cd $dir && bunx vercel link' 하세요. 건너뜀."
  fi
}

# Next reads .env.local; Nest/Expo read .env
pull "apps/web" ".env.local"
pull "apps/api" ".env"
pull "apps/mobile" ".env"

echo "완료. Kakao 등 Vercel에 없는 키는 각 .env에 수동 보완."
