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

# next build пересоздаёт .next/standalone с нуля, поэтому серверный env
# (всё, что не задано в ecosystem.config.js) должен копироваться сюда
# заново на каждом деплое — иначе переживший прошлую выкладку .env.local
# молча исчезает и фичи вроде /api/albamed/prices падают с ошибкой конфигурации.
echo "→ copy .env.local into standalone"
if [ -f .env.local ]; then
  cp .env.local .next/standalone/.env.local
  chmod 600 .next/standalone/.env.local
else
  echo "  ⚠ .env.local не найден в корне приложения — пропускаю копирование"
fi

echo "→ pm2 restart (ecosystem)"
pm2 startOrRestart ecosystem.config.js
pm2 save

echo "✓ Deploy complete"
