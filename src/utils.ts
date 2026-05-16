import type { Category, MenuData, Product } from "./types";

export const PIZZA_IMAGE_URL =
  "/images/607ed818-b82d-4252-bb46-1dd1ce303ee6_image.webp";

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

export function productImageUrl(
  productId: number,
  category?: { slug: string; title: string }
): string {
  if (category && isPizzaCategory(category)) {
    return PIZZA_IMAGE_URL;
  }
  return `https://picsum.photos/seed/menu-${productId}/600/400`;
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
