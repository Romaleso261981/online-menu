import type { CartLine, Category, MenuData, Product } from "./types";

export const TABLE_STORAGE_KEY = "online-menu-table";

export function normalizeTableId(raw: string | null | undefined): string | null {
  const t = raw?.trim();
  return t ? t : null;
}

export function formatTableLabel(tableId: string): string {
  if (/^(столик|стіл)\s*/i.test(tableId)) return tableId;
  return `Столик №${tableId}`;
}

export function buildMenuUrl(baseUrl: string, tableId: string | null): string {
  const url = new URL(baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);
  const id = normalizeTableId(tableId);
  if (id) url.searchParams.set("table", id);
  return url.toString();
}

export function formatOrderMessage(
  lines: CartLine[],
  total: number,
  tableId: string | null
): string {
  const parts: string[] = ["Замовлення з онлайн-меню"];
  if (tableId) parts.push(formatTableLabel(tableId));
  parts.push("");
  for (const line of lines) {
    parts.push(
      `${line.name} × ${line.quantity} — ${formatPrice(line.price * line.quantity)}`
    );
  }
  parts.push("");
  parts.push(`Разом: ${formatPrice(total)}`);
  return parts.join("\n");
}

export const SITE_LOGO_URL =
  "/images/logo/5cad0bc8-8bd4-429e-a7b6-4074d5f5c12b_image.webp";

export const PIZZA_IMAGE_URL =
  "/images/607ed818-b82d-4252-bb46-1dd1ce303ee6_image.webp";

export const ONIGIRI_IMAGE_URL =
  "/images/55e0c511-bef1-495b-b898-92339b879525_image.webp";

export const MAKI_IMAGE_URL =
  "/images/70fc18c0-dfb2-4184-88d5-07113ec18298_image.webp";

export const PHILADELPHIA_IMAGE_URL =
  "/images/889213_1668018973.8619_original.webp";

export const FIRM_ROLLS_IMAGE_URL = "/images/firmovi-roli.jpeg";

export const MENU_PLACEHOLDER_URL = "/images/placeholder.svg";

/** WebP preview for cards (see scripts/generate-thumbs.mjs). */
export function productThumbnailUrl(fullUrl: string): string | null {
  if (!fullUrl.startsWith("/images/")) return null;
  if (fullUrl.endsWith(".svg")) return null;
  return fullUrl.replace(/\.[^./]+$/i, "-thumb.webp");
}

export function slugifyCategoryTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "");
}

export function uniqueCategorySlug(
  categories: { slug: string }[],
  title: string
): string {
  const base = slugifyCategoryTitle(title) || "kategoriya";
  if (!categories.some((c) => c.slug === base)) return base;
  let n = 2;
  while (categories.some((c) => c.slug === `${base}-${n}`)) n++;
  return `${base}-${n}`;
}

export function formatPrice(amount: number, currency = "₴"): string {
  return `${amount.toLocaleString("uk-UA")} ${currency}`;
}

export function isPizzaCategory(category: {
  slug: string;
  title: string;
}): boolean {
  return (
    category.slug.startsWith("pizza-") || /^pizza\b/i.test(category.title)
  );
}

export function isOnigiriCategory(category: {
  slug: string;
  title: string;
}): boolean {
  return (
    category.slug.includes("онігір") ||
    /онігірі/i.test(category.title)
  );
}

export function isMakiCategory(category: {
  slug: string;
  title: string;
}): boolean {
  return (
    category.slug.includes("макі") || /макі\s*рол/i.test(category.title)
  );
}

export function isPhiladelphiaCategory(category: {
  slug: string;
  title: string;
}): boolean {
  return (
    category.slug.includes("філадельф") ||
    /філадельфія/i.test(category.title)
  );
}

export function isFirmRollsCategory(category: {
  slug: string;
  title: string;
}): boolean {
  return (
    category.slug.includes("фірмові-рол") ||
    /фірмові\s*рол/i.test(category.title)
  );
}

export function hasCategoryImage(category: {
  slug: string;
  title: string;
}): boolean {
  return (
    isPizzaCategory(category) ||
    isOnigiriCategory(category) ||
    isMakiCategory(category) ||
    isPhiladelphiaCategory(category) ||
    isFirmRollsCategory(category)
  );
}

export function productImageUrl(
  product: Pick<Product, "id" | "image">,
  category?: Pick<Category, "slug" | "title" | "image">
): string {
  if (product.image?.trim()) return product.image.trim();
  if (category?.image?.trim()) return category.image.trim();
  if (category && isPizzaCategory(category)) {
    return PIZZA_IMAGE_URL;
  }
  if (category && isOnigiriCategory(category)) {
    return ONIGIRI_IMAGE_URL;
  }
  if (category && isMakiCategory(category)) {
    return MAKI_IMAGE_URL;
  }
  if (category && isPhiladelphiaCategory(category)) {
    return PHILADELPHIA_IMAGE_URL;
  }
  if (category && isFirmRollsCategory(category)) {
    return FIRM_ROLLS_IMAGE_URL;
  }
  return `https://picsum.photos/seed/menu-${product.id}/600/400`;
}

/** Smaller image for list cards; modal/lightbox should use productImageUrl. */
export function productCardImageUrl(
  product: Pick<Product, "id" | "image">,
  category?: Pick<Category, "slug" | "title" | "image">
): string {
  const full = productImageUrl(product, category);
  return productThumbnailUrl(full) ?? full;
}

export function nextProductId(menu: MenuData): number {
  let max = 0;
  for (const category of menu.categories) {
    for (const product of category.products) {
      if (product.id > max) max = product.id;
    }
  }
  return max + 1;
}

export function flattenProducts(menu: MenuData): Product[] {
  return menu.categories.flatMap((c) => c.products);
}

export function findProduct(menu: MenuData, id: number): Product | undefined {
  return flattenProducts(menu).find((p) => p.id === id);
}

export function findCategoryForProduct(
  menu: MenuData,
  productId: number
): Category | undefined {
  return menu.categories.find((c) =>
    c.products.some((p) => p.id === productId)
  );
}

export function parseProductHash(hash: string): number | null {
  const m = hash.match(/^#?product-(\d+)$/);
  return m ? Number(m[1]) : null;
}

export function excerpt(text: string, max = 88): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}…`;
}

export function splitProductDescription(description: string): {
  body: string;
  allergens: string | null;
} {
  const match = description.match(/^([\s\S]*?)(\s*Алергени\s*:.*)$/i);
  if (!match) {
    return { body: description.trim(), allergens: null };
  }
  return {
    body: match[1].trim(),
    allergens: match[2].trim(),
  };
}
