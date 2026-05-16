/**
 * Fetch menu from menu.ps.me, download product images to public/images/<category-slug>/,
 * write public/menu.json with local image paths.
 *
 * Usage: node scripts/scrape-menu-ps.mjs [url]
 * Default url: https://menu.ps.me/e0cjLcsqP5g
 */

import { createWriteStream, existsSync, mkdirSync, writeFileSync } from "fs";
import { dirname, join, basename } from "path";
import { fileURLToPath } from "url";
import { pipeline } from "stream/promises";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const publicDir = join(root, "public");
const imagesDir = join(publicDir, "images");

const MENU_URL = process.argv[2]?.trim() || "https://menu.ps.me/e0cjLcsqP5g";
const CONCURRENCY = 6;

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "");
}

function extractJson(html, scriptId) {
  const re = new RegExp(
    `<script id="${scriptId}"[^>]*>([\\s\\S]*?)</script>`,
    "i"
  );
  const m = html.match(re);
  if (!m) throw new Error(`Missing <script id="${scriptId}"> in HTML`);
  return JSON.parse(m[1]);
}

function safeBasename(url) {
  try {
    const u = new URL(url);
    const name = basename(u.pathname);
    return name.replace(/[^a-zA-Z0-9._-]+/g, "-") || "image.jpg";
  } catch {
    return `image-${Date.now()}.jpg`;
  }
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "online-menu-scraper/1.0" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

async function downloadToFile(url, filePath) {
  if (existsSync(filePath)) return false;
  const res = await fetch(url, {
    headers: { "User-Agent": "online-menu-scraper/1.0" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  mkdirSync(dirname(filePath), { recursive: true });
  await pipeline(res.body, createWriteStream(filePath));
  return true;
}

async function mapPool(items, limit, fn) {
  const results = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => worker())
  );
  return results;
}

async function main() {
  console.log(`Fetching ${MENU_URL}…`);
  const html = await fetchText(MENU_URL);
  const settings = extractJson(html, "settings-data");
  const rawProducts = extractJson(html, "menu-data");

  const categoryOrder = [];
  const categoryMap = new Map();

  for (const row of rawProducts) {
    const title = row.categoryName?.trim() || "Інше";
    if (!categoryMap.has(title)) {
      const slug = slugify(title);
      const cat = { slug, title, products: [] };
      categoryMap.set(title, cat);
      categoryOrder.push(cat);
    }
  }

  let nextId = 1;
  const downloadJobs = [];

  for (const row of rawProducts) {
    const title = row.categoryName?.trim() || "Інше";
    const category = categoryMap.get(title);
    const price = Number(row.price) || 0;
    const product = {
      id: nextId++,
      name: row.name?.trim() || "Без назви",
      price,
      priceLabel: `${price} ₴`,
      description: (row.description || "").replace(/\n/g, " ").trim(),
    };

    if (row.photo?.trim()) {
      const catSlug = category.slug;
      const fileName = safeBasename(row.photo);
      const relPath = `/images/${catSlug}/${fileName}`;
      const absPath = join(publicDir, relPath.replace(/^\//, ""));
      product.image = relPath;
      downloadJobs.push({ url: row.photo.trim(), absPath });
    }

    category.products.push(product);
  }

  console.log(
    `Menu: ${settings.shopName || "Меню"}, ${categoryOrder.length} categories, ${rawProducts.length} products`
  );
  console.log(`Downloading ${downloadJobs.length} images…`);

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  await mapPool(downloadJobs, CONCURRENCY, async (job) => {
    try {
      const isNew = await downloadToFile(job.url, job.absPath);
      if (isNew) downloaded++;
      else skipped++;
    } catch (e) {
      failed++;
      console.warn(`  ✗ ${job.url}: ${e.message}`);
    }
  });

  const menu = {
    restaurantName: settings.shopName?.trim() || "oregano delivery",
    currency: settings.currency?.symbol?.trim() || "₴",
    categories: categoryOrder.filter((c) => c.products.length > 0),
  };

  writeFileSync(
    join(publicDir, "menu.json"),
    JSON.stringify(menu, null, 2),
    "utf8"
  );

  console.log(
    `Done. Images: ${downloaded} new, ${skipped} already existed, ${failed} failed.`
  );
  console.log(`Wrote ${join(publicDir, "menu.json")}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
