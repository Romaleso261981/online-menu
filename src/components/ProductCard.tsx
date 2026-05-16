import type { Category, Product } from "../types";
import { excerpt, formatPrice, productImageUrl } from "../utils";

type Props = {
  product: Product;
  category: Pick<Category, "slug" | "title">;
  onOpen: (id: number) => void;
};

export function ProductCard({ product, category, onOpen }: Props) {
  return (
    <article className="product-card" id={`product-${product.id}`}>
      <button
        type="button"
        className="product-card__hit"
        onClick={() => onOpen(product.id)}
      >
        <div className="product-card__media">
          <img
            src={productImageUrl(product.id, category)}
            alt=""
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="product-card__body">
          <h3>{product.name}</h3>
          <span className="product-card__price">
            {product.priceLabel || formatPrice(product.price)}
          </span>
          {product.description ? (
            <p>{excerpt(product.description, 72)}</p>
          ) : null}
        </div>
      </button>
    </article>
  );
}
