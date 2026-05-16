/**
 * Build WebP thumbnails (max 176px) for product images referenced in menu.json.
 * Usage: node scripts/generate-thumbs.mjs
 */

import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const publicDir = join(root, "public");
const menu = JSON.parse(readFileSync(join(publicDir, "menu.json"), "utf8"));

const THUMB_WIDTH = 176;
const QUALITY = 72;

function thumbPathFor(imagePath) {
  return imagePath.replace(/\.[^./]+$/i, "-thumb.webp");
}

const paths = new Set();
for (const cat of menu.categories) {
  for (const p of cat.products) {
    if (p.image?.startsWith("/images/")) paths.add(p.image.trim());
  }
}

let created = 0;
let skipped = 0;
let failed = 0;

for (const rel of paths) {
  const src = join(publicDir, rel.replace(/^\//, ""));
  const thumbRel = thumbPathFor(rel);
  const dest = join(publicDir, thumbRel.replace(/^\//, ""));

  if (!existsSync(src)) {
    failed++;
    continue;
  }
  if (existsSync(dest)) {
    skipped++;
    continue;
  }

  try {
    await sharp(src)
      .rotate()
      .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(dest);
    created++;
  } catch (e) {
    failed++;
    console.warn(`  ✗ ${rel}: ${e.message}`);
  }
}

console.log(
  `Thumbnails: ${created} created, ${skipped} existed, ${failed} failed (${paths.size} sources).`
);
