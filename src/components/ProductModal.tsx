import { useEffect, useMemo, useState } from "react";
import type { Category, Product } from "../types";
import {
  formatPrice,
  isPizzaCategory,
  productImageUrl,
  splitProductDescription,
} from "../utils";
import { ImageLightbox } from "./ImageLightbox";

type Props = {
  product: Product | null;
  category: Pick<Category, "slug" | "title"> | null;
  onClose: () => void;
  onAdd: (product: Product, quantity: number) => void;
};

export function ProductModal({ product, category, onClose, onAdd }: Props) {
  const [qty, setQty] = useState(1);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const descriptionParts = useMemo(
    () =>
      product?.description
        ? splitProductDescription(product.description)
        : { body: "", allergens: null },
    [product?.description]
  );

  useEffect(() => {
    setQty(1);
    setLightboxOpen(false);
  }, [product?.id]);

  useEffect(() => {
    if (!product) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (lightboxOpen) setLightboxOpen(false);
      else onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [product, onClose, lightboxOpen]);

  if (!product) return null;

  const pizzaImage = category ? isPizzaCategory(category) : false;
  const imageSrc = productImageUrl(product.id, category ?? undefined);

  return (
    <div
      className="modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-title"
    >
      <button
        type="button"
        className="modal__backdrop"
        onClick={onClose}
        aria-label="Закрити"
      />
      <div className="modal__sheet">
        <div
          className={`modal__media${pizzaImage ? " modal__media--contain modal__media--large" : " modal__media--zoomable"}`}
        >
          <button
            type="button"
            className="modal__media-open"
            onClick={() => setLightboxOpen(true)}
            aria-label="Відкрити зображення на весь екран"
          >
            <img src={imageSrc} alt={product.name} />
          </button>
          <button
            type="button"
            className="modal__close"
            onClick={onClose}
            aria-label="Закрити"
          >
            ×
          </button>
        </div>
        <div className="modal__content">
          <h2 id="product-title">{product.name}</h2>
          <p className="modal__price">
            {product.priceLabel || formatPrice(product.price)}
          </p>
          {descriptionParts.body ? (
            <p className="modal__desc">{descriptionParts.body}</p>
          ) : null}
          {descriptionParts.allergens ? (
            <p className="modal__allergens">{descriptionParts.allergens}</p>
          ) : null}
          <div className="modal__actions">
            <div className="qty">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Менше"
              >
                −
              </button>
              <span>{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => q + 1)}
                aria-label="Більше"
              >
                +
              </button>
            </div>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                onAdd(product, qty);
                onClose();
              }}
            >
              Додати · {formatPrice(product.price * qty)}
            </button>
          </div>
        </div>
      </div>
      {lightboxOpen ? (
        <ImageLightbox
          src={imageSrc}
          alt={product.name}
          onClose={() => setLightboxOpen(false)}
        />
      ) : null}
    </div>
  );
}
