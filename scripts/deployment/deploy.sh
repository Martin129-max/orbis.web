#!/usr/bin/env bash

set -e

if ! pnpm exec vercel whoami </dev/null >/dev/null 2>&1; then
  echo "🔑 Logging in to Vercel..."
  pnpm exec vercel login
fi

echo "🚀 Deploying to Vercel..."
pnpm exec vercel deploy --prod "$@"
