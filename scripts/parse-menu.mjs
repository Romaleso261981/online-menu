import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const source = readFileSync(join(root, "data/source-menu.txt"), "utf8");

const priceRe = /^[\d\s]+₴$/;
const lines = source.split("\n");

let restaurantName = "Меню";
const categories = [];
let currentCategory = null;
let pendingProduct = null;
let id = 1;

function flushProduct() {
  if (!pendingProduct || !currentCategory) return;
  currentCategory.products.push({
    id: pendingProduct.id,
    name: pendingProduct.name,
    price: pendingProduct.price,
    priceLabel: pendingProduct.priceLabel,
    description: pendingProduct.description.trim(),
  });
  pendingProduct = null;
}

for (const raw of lines) {
  const line = raw.trim();
  if (!line) continue;

  if (
    !line.startsWith("#") &&
    categories.length === 0 &&
    !pendingProduct
  ) {
    restaurantName = line;
    continue;
  }

  if (line.startsWith("# ") && !line.startsWith("#### ")) {
    flushProduct();
    const title = line.slice(2).trim();
    currentCategory = { slug: slugify(title), title, products: [] };
    categories.push(currentCategory);
    continue;
  }

  if (line.startsWith("#### ")) {
    flushProduct();
    pendingProduct = {
      id: id++,
      name: line.slice(5).trim(),
      price: 0,
      priceLabel: "",
      description: "",
    };
    continue;
  }

  if (pendingProduct && priceRe.test(line)) {
    pendingProduct.priceLabel = line.replace(/\s/g, " ").trim();
    pendingProduct.price = parseInt(line.replace(/[^\d]/g, ""), 10) || 0;
    continue;
  }

  if (pendingProduct && currentCategory) {
    pendingProduct.description +=
      (pendingProduct.description ? " " : "") + line;
  }
}

flushProduct();

const menu = {
  restaurantName,
  currency: "₴",
  categories: categories.filter((c) => c.products.length > 0),
};

mkdirSync(join(root, "public"), { recursive: true });
writeFileSync(
  join(root, "public/menu.json"),
  JSON.stringify(menu, null, 2),
  "utf8"
);

console.log(
  `Parsed ${menu.categories.length} categories, ${menu.categories.reduce((n, c) => n + c.products.length, 0)} products`
);

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "");
}
