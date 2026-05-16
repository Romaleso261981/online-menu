import { useId, useRef } from "react";
import type { Category, Product } from "../types";
import { excerpt, formatPrice, productImageUrl } from "../utils";

type Props = {
  product: Product;
  category: Category;
  onEdit: () => void;
  onImageReplace: (file: File) => void;
  onImageError: (message: string) => void;
};

export function AdminProductCard({
  product,
  category,
  onEdit,
  onImageReplace,
  onImageError,
}: Props) {
  const inputId = useId();
  const replacingRef = useRef(false);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    replacingRef.current = true;
    try {
      onImageReplace(file);
    } catch (e) {
      onImageError(e instanceof Error ? e.message : "Помилка завантаження");
    } finally {
      replacingRef.current = false;
    }
  };

  return (
    <article className="product-card admin-product-card" id={`product-${product.id}`}>
      <div className="product-card__hit admin-product-card__hit">
        <button type="button" className="product-card__body" onClick={onEdit}>
          <h3>{product.name}</h3>
          <span className="product-card__price">
            {product.priceLabel || formatPrice(product.price)}
          </span>
          {product.description ? (
            <p>{excerpt(product.description, 72)}</p>
          ) : null}
          <span className="admin-product-card__edit-hint">Редагувати текст →</span>
        </button>
        <div className="product-card__media admin-product-card__media">
          <img
            src={productImageUrl(product, category)}
            alt=""
            loading="lazy"
            decoding="async"
          />
          <label
            htmlFor={inputId}
            className="admin-product-card__image-replace"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              id={inputId}
              type="file"
              accept="image/*"
              className="admin-product-card__file"
              disabled={replacingRef.current}
              onChange={(e) => {
                handleFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            Змінити фото
          </label>
        </div>
      </div>
    </article>
  );
}
