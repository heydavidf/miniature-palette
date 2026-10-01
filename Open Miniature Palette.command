#!/bin/zsh
set -eu
cd "$(dirname "$0")"
if ! command -v npm >/dev/null 2>&1; then
  print 'Node.js is needed to open Pigment. Install Node.js 22 or later, then open this file again.'
  read '?Press Return to close.'
  exit 1
fi
if [[ ! -d node_modules ]]; then
  print 'Installing Pigment dependencies…'
  npm ci
fi
palette_page=$(curl -fsS --max-time 2 http://127.0.0.1:5178 2>/dev/null || true)
if [[ "$palette_page" == *'<title>Pigment'* ]]; then
  open http://127.0.0.1:5178
  exit 0
fi
print 'Opening Pigment. Keep this window open while painting. Press Control-C to stop.'
npm run dev -- --strictPort --open
