#!/bin/bash
set -e

echo "→ git pull"
git pull

echo "→ npm run build"
npm run build

echo "→ copy static assets"
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public

echo "→ rebuild native modules for Node $(node -v)"
cd .next/standalone && npm rebuild better-sqlite3 && cd ../..

echo "→ pm2 restart (ecosystem)"
pm2 startOrRestart ecosystem.config.js
pm2 save

echo "✓ Deploy complete"
