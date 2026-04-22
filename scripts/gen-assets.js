#!/usr/bin/env node
/**
 * Optisphere Asset Generator
 * Uses HuggingFace Inference API (FLUX.1-schnell) — free tier
 *
 * Usage:
 *   node scripts/gen-assets.js              — генерирует все ассеты
 *   node scripts/gen-assets.js hero         — только группу "hero"
 *   node scripts/gen-assets.js textures     — только текстуры
 *
 * Нужно: HF_TOKEN в .env.local
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// Загружаем .env.local
const envPath = path.join(ROOT, ".env.local");
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .forEach((l) => {
      const [k, ...v] = l.split("=");
      process.env[k.trim()] = v.join("=").trim();
    });
}

const HF_TOKEN = process.env.HF_TOKEN;
if (!HF_TOKEN) {
  console.error(
    "❌ HF_TOKEN не найден в .env.local\n" +
    "   Добавь: HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxxxx\n" +
    "   Токен: https://huggingface.co/settings/tokens"
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Модель
// ---------------------------------------------------------------------------
const MODEL = "black-forest-labs/FLUX.1-schnell";
const API_URL = `https://router.huggingface.co/hf-inference/models/${MODEL}`;

// ---------------------------------------------------------------------------
// Ассеты
// ---------------------------------------------------------------------------
// width/height — кратно 8, для FLUX.1-schnell макс 1024×1024
const ASSETS = [
  // ── HERO ────────────────────────────────────────────────────────────────
  {
    group: "hero",
    name: "hero-stars-bg",
    out: "public/images/hero-stars-bg.jpg",
    width: 1920,
    height: 1080,
    steps: 4,
    prompt:
      "deep space starfield, ultra-dense stars, milky way band, dark cosmic void, " +
      "photorealistic, 8k, no planets, no nebula, pure black background #07070F, " +
      "fine star points, subtle star clusters, cinematic astronomy photography",
    negative:
      "planets, nebula, colorful, bright, lens flare, text, watermark",
  },
  {
    group: "hero",
    name: "hero-nebula-overlay",
    out: "public/images/hero-nebula.jpg",
    width: 1024,
    height: 1024,
    steps: 4,
    prompt:
      "subtle dark space nebula, deep navy and indigo, very dark, almost black, " +
      "soft diffuse cosmic dust, minimal glow, perfect for overlay blend-mode, " +
      "no stars, flat ambient light, abstract dark texture",
    negative:
      "bright colors, stars, planets, text, watermark, artifacts",
  },

  // ── ATMOSPHERE TRANSITION ────────────────────────────────────────────────
  {
    group: "transition",
    name: "atmosphere-top",
    out: "public/images/atmo-top.jpg",
    width: 1920,
    height: 1080,
    steps: 4,
    prompt:
      "view from space looking down at earth atmosphere, thin blue atmospheric glow, " +
      "curvature of earth visible, upper stratosphere, dark space above, " +
      "photorealistic satellite view, cinematic, no clouds",
    negative:
      "text, watermark, people, city lights, low quality",
  },
  {
    group: "transition",
    name: "atmosphere-clouds",
    out: "public/images/atmo-clouds.jpg",
    width: 1920,
    height: 1080,
    steps: 4,
    prompt:
      "view from high altitude looking down, dramatic cumulonimbus clouds from above, " +
      "dark sky above, white fluffy clouds below, golden hour rim lighting, " +
      "aerial photography, cinematic, 8k",
    negative:
      "text, watermark, mountains, ocean visible, low quality",
  },

  // ── SITES SECTION ────────────────────────────────────────────────────────
  {
    group: "sites",
    name: "sites-bg",
    out: "public/images/sites-bg.jpg",
    width: 1920,
    height: 1080,
    steps: 4,
    prompt:
      "aerial view of modern dark city at night, city lights grid from above, " +
      "dark moody atmosphere, electric blue accents, ultra wide drone shot, " +
      "minimal, geometric, photorealistic, cinematic grade",
    negative:
      "people, text, watermark, daytime, bright colors",
  },
  {
    group: "sites",
    name: "sites-monitor-glow",
    out: "public/images/sites-monitor.jpg",
    width: 1024,
    height: 768,
    steps: 4,
    prompt:
      "dark sleek laptop screen glowing blue in dark room, code editor visible, " +
      "dramatic moody lighting, electric blue glow, minimal desk setup, " +
      "product photography, dark theme, 8k sharp",
    negative:
      "text on screen readable, watermark, bright background, clutter",
  },

  // ── TOURS SECTION ────────────────────────────────────────────────────────
  {
    group: "tours",
    name: "tours-bg",
    out: "public/images/tours-bg.jpg",
    width: 1920,
    height: 1080,
    steps: 4,
    prompt:
      "professional photographer with 360 camera on tripod in luxury hotel lobby, " +
      "golden ambient light, architectural interior, beautiful space, " +
      "cinematic photography, warm tones, shallow depth of field",
    negative:
      "text, watermark, low quality, distortion",
  },
  {
    group: "tours",
    name: "tours-sphere-preview",
    out: "public/images/tours-sphere.jpg",
    width: 1024,
    height: 1024,
    steps: 4,
    prompt:
      "beautiful luxury hotel lobby interior, 360 panoramic photography style, " +
      "wide equirectangular view, golden hour interior lighting, " +
      "marble floors, high ceilings, photorealistic, 8k",
    negative:
      "text, watermark, people, low quality, dark",
  },

  // ── ORBIT/SUBSCRIPTION SECTION ───────────────────────────────────────────
  {
    group: "orbit",
    name: "orbit-satellite",
    out: "public/images/orbit-satellite.jpg",
    width: 1920,
    height: 1080,
    steps: 4,
    prompt:
      "realistic satellite in orbit above earth, solar panels extended, " +
      "earth visible below with clouds and ocean, dark space, " +
      "photorealistic 3d render, cinematic lighting, 8k, NASA style",
    negative:
      "text, watermark, cartoon, low quality, moon",
  },
  {
    group: "orbit",
    name: "orbit-monitoring",
    out: "public/images/orbit-monitoring.jpg",
    width: 1920,
    height: 1080,
    steps: 4,
    prompt:
      "modern dark dashboard with analytics charts and graphs glowing on multiple monitors, " +
      "dark room, blue and green data visualizations, server room ambient, " +
      "cinematic, tech aesthetic, no text readable",
    negative:
      "text readable, watermark, bright colors, clutter, people",
  },

  // ── TEXTURES ─────────────────────────────────────────────────────────────
  {
    group: "textures",
    name: "tex-star-surface",
    out: "public/images/tex-star.jpg",
    width: 512,
    height: 512,
    steps: 4,
    prompt:
      "close up solar surface texture, hot plasma convection cells, " +
      "granulation pattern, orange yellow white, " +
      "seamless tileable texture, scientific visualization",
    negative:
      "text, watermark, dark, black, cold colors",
  },
  {
    group: "textures",
    name: "tex-noise-dark",
    out: "public/images/tex-noise.jpg",
    width: 512,
    height: 512,
    steps: 4,
    prompt:
      "dark noise grain texture, very subtle, almost black, " +
      "film grain, organic texture, seamless tile, " +
      "pure dark with minimal noise pattern",
    negative:
      "text, bright, colorful, artifacts",
  },
  {
    group: "textures",
    name: "tex-grid-tech",
    out: "public/images/tex-grid.jpg",
    width: 512,
    height: 512,
    steps: 4,
    prompt:
      "dark technical grid pattern, electric blue thin lines on black background, " +
      "isometric perspective grid, cyberpunk aesthetic, seamless tile, " +
      "minimal glowing lines, tech HUD texture",
    negative:
      "text, watermark, bright, colors other than blue",
  },

  // ── PORTFOLIO PLACEHOLDERS ───────────────────────────────────────────────
  {
    group: "portfolio",
    name: "portfolio-hotel",
    out: "public/images/portfolio/hotel.jpg",
    width: 1200,
    height: 800,
    steps: 4,
    prompt:
      "modern luxury hotel website screenshot mockup, dark elegant design, " +
      "minimal UI, large hero image of hotel exterior, " +
      "professional web design, flat design mockup",
    negative:
      "text readable, watermark, low quality, outdated design",
  },
  {
    group: "portfolio",
    name: "portfolio-medical",
    out: "public/images/portfolio/medical.jpg",
    width: 1200,
    height: 800,
    steps: 4,
    prompt:
      "modern medical clinic website mockup, clean white and blue design, " +
      "professional healthcare UI, minimal layout, trust-inspiring, " +
      "flat design screenshot, professional web design",
    negative:
      "text readable, watermark, low quality, dark",
  },
  {
    group: "portfolio",
    name: "portfolio-construction",
    out: "public/images/portfolio/construction.jpg",
    width: 1200,
    height: 800,
    steps: 4,
    prompt:
      "modern construction company website mockup, dark industrial design, " +
      "bold typography, orange and dark gray palette, " +
      "professional web design, flat mockup screenshot",
    negative:
      "text readable, watermark, low quality, dated design",
  },
];

// ---------------------------------------------------------------------------
// Генератор
// ---------------------------------------------------------------------------
async function generate(asset) {
  const outPath = path.join(ROOT, asset.out);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  if (fs.existsSync(outPath)) {
    console.log(`  ⏭  ${asset.name} — уже существует, пропускаем`);
    return;
  }

  console.log(`  ⏳ ${asset.name} (${asset.width}×${asset.height})...`);

  const body = {
    inputs: asset.prompt,
    parameters: {
      negative_prompt: asset.negative || "",
      num_inference_steps: asset.steps || 4,
      width: Math.min(asset.width, 1024),   // FLUX.1-schnell макс 1024
      height: Math.min(asset.height, 1024),
      guidance_scale: 0,                    // schnell работает без guidance
    },
  };

  let attempts = 0;
  while (attempts < 3) {
    attempts++;
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
          "x-use-cache": "false",
        },
        body: JSON.stringify(body),
      });

      if (res.status === 503) {
        // Модель загружается
        const json = await res.json().catch(() => ({}));
        const wait = Math.ceil((json.estimated_time || 20) * 1000);
        console.log(`     ⚠️  Модель загружается, ждём ${Math.ceil(wait / 1000)}с...`);
        await new Promise((r) => setTimeout(r, wait));
        continue;
      }

      if (!res.ok) {
        const text = await res.text();
        console.error(`  ❌ ${asset.name}: HTTP ${res.status} — ${text.slice(0, 200)}`);
        return;
      }

      const buffer = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(outPath, buffer);
      console.log(`  ✅ ${asset.name} → ${asset.out}`);
      return;
    } catch (err) {
      console.error(`  ❌ ${asset.name}: ${err.message}`);
      if (attempts < 3) {
        console.log(`     Повтор ${attempts}/3...`);
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
const filterGroup = process.argv[2] || null;
const toRun = filterGroup
  ? ASSETS.filter((a) => a.group === filterGroup)
  : ASSETS;

if (toRun.length === 0) {
  console.error(`❌ Группа "${filterGroup}" не найдена.`);
  console.log("Доступные группы:", [...new Set(ASSETS.map((a) => a.group))].join(", "));
  process.exit(1);
}

console.log(`\n🚀 Optisphere Asset Generator`);
console.log(`   Модель: ${MODEL}`);
console.log(`   Ассетов: ${toRun.length}${filterGroup ? ` (группа: ${filterGroup})` : ""}\n`);

// Последовательно — не перегружаем free tier
for (const asset of toRun) {
  await generate(asset);
  // Пауза между запросами чтобы не получить rate limit
  await new Promise((r) => setTimeout(r, 1500));
}

console.log("\n✨ Готово!");
console.log("   Все файлы в public/images/");
