export type Product = {
  id: number;
  name: string;
  price: number;
  priceLabel: string;
  description: string;
  /** Власне зображення (URL або data URL) */
  image?: string;
};

export type Category = {
  slug: string;
  title: string;
  /** Зображення за замовчуванням для категорії */
  image?: string;
  products: Product[];
};

export type MenuData = {
  restaurantName: string;
  currency: string;
  categories: Category[];
};

export type CartLine = {
  productId: number;
  name: string;
  price: number;
  quantity: number;
};
