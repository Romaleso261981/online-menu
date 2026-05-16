import { useEffect, useId, useState } from "react";
import type { Category, Product } from "../types";
import { formatPrice, productImageUrl } from "../utils";

type Props = {
  category: Category;
  product: Product;
  categories: Category[];
  currency: string;
  onClose: () => void;
  onUpdateProduct: (patch: Partial<Product>) => void;
  onUpdateCategory: (patch: Partial<Category>) => void;
  onMoveProduct: (toCategorySlug: string) => void;
  onAddCategoryWithProduct: (title: string) => void;
  onAddEmptyCategory: (title: string) => void;
  onReadImage: (file: File) => Promise<string>;
  onError: (message: string) => void;
};

export function AdminProductEditModal({
  category,
  product,
  categories,
  currency,
  onClose,
  onUpdateProduct,
  onUpdateCategory,
  onMoveProduct,
  onAddCategoryWithProduct,
  onAddEmptyCategory,
  onReadImage,
  onError,
}: Props) {
  const previewInputId = useId();
  const [newCategoryTitle, setNewCategoryTitle] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="modal admin-edit-modal" role="dialog" aria-modal="true">
      <button
        type="button"
        className="modal__backdrop"
        onClick={onClose}
        aria-label="Закрити"
      />
      <div className="modal__sheet admin-edit-modal__sheet">
        <button
          type="button"
          className="modal__close"
          onClick={onClose}
          aria-label="Закрити"
        >
          ×
        </button>
        <div className="admin-edit-modal__content">
          <h2>Редагування</h2>
          <p className="admin-edit-modal__hint">Товар ID {product.id}</p>

          <label>
            Категорія товару
            <select
              value={category.slug}
              onChange={(e) => onMoveProduct(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.title}
                </option>
              ))}
            </select>
          </label>

          <fieldset className="admin-edit-modal__new-category">
            <legend>Нова категорія</legend>
            <label>
              Назва нової категорії
              <input
                value={newCategoryTitle}
                placeholder="Наприклад: Запечені роли"
                onChange={(e) => setNewCategoryTitle(e.target.value)}
              />
            </label>
            <div className="admin-edit-modal__new-category-actions">
              <button
                type="button"
                className="admin__btn"
                onClick={() => {
                  onAddCategoryWithProduct(newCategoryTitle);
                  setNewCategoryTitle("");
                }}
              >
                Додати і перенести сюди товар
              </button>
              <button
                type="button"
                className="admin__btn admin__btn--ghost"
                onClick={() => {
                  onAddEmptyCategory(newCategoryTitle);
                  setNewCategoryTitle("");
                }}
              >
                Лише додати категорію
              </button>
            </div>
          </fieldset>

          <label
            htmlFor={previewInputId}
            className="admin-edit-modal__image-picker"
          >
            <img
              src={productImageUrl(product, category)}
              alt=""
              className="admin__preview-img"
            />
            <span className="admin-edit-modal__image-picker-label">
              Натисніть, щоб замінити фото
            </span>
            <input
              id={previewInputId}
              type="file"
              accept="image/*"
              className="admin-product-card__file"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                void onReadImage(f)
                  .then((url) => onUpdateProduct({ image: url }))
                  .catch((err) =>
                    onError(err instanceof Error ? err.message : "Помилка")
                  );
                e.target.value = "";
              }}
            />
          </label>

          <details className="admin-edit-modal__details">
            <summary>Налаштування поточної категорії «{category.title}»</summary>
            <label>
              Назва категорії
              <input
                value={category.title}
                onChange={(e) => onUpdateCategory({ title: e.target.value })}
              />
            </label>
            <label>
              Фото категорії (URL)
              <input
                value={category.image ?? ""}
                placeholder="/images/..."
                onChange={(e) =>
                  onUpdateCategory({ image: e.target.value || undefined })
                }
              />
            </label>
            <label>
              Завантажити фото категорії
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  void onReadImage(f)
                    .then((url) => onUpdateCategory({ image: url }))
                    .catch((err) =>
                      onError(err instanceof Error ? err.message : "Помилка")
                    );
                  e.target.value = "";
                }}
              />
            </label>
          </details>

          <label>
            Назва
            <input
              value={product.name}
              onChange={(e) => onUpdateProduct({ name: e.target.value })}
            />
          </label>
          <label>
            Ціна (число)
            <input
              type="number"
              min={0}
              value={product.price}
              onChange={(e) => {
                const price = Number(e.target.value) || 0;
                onUpdateProduct({
                  price,
                  priceLabel: formatPrice(price, currency),
                });
              }}
            />
          </label>
          <label>
            Підпис ціни
            <input
              value={product.priceLabel}
              onChange={(e) => onUpdateProduct({ priceLabel: e.target.value })}
            />
          </label>
          <label>
            Опис
            <textarea
              rows={5}
              value={product.description}
              onChange={(e) => onUpdateProduct({ description: e.target.value })}
            />
          </label>
          <label>
            Фото товару (URL)
            <input
              value={product.image ?? ""}
              placeholder="/images/..."
              onChange={(e) =>
                onUpdateProduct({ image: e.target.value || undefined })
              }
            />
          </label>
          <label>
            Завантажити фото товару
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                void onReadImage(f)
                  .then((url) => onUpdateProduct({ image: url }))
                  .catch((err) =>
                    onError(err instanceof Error ? err.message : "Помилка")
                  );
                e.target.value = "";
              }}
            />
          </label>
          <button
            type="button"
            className="admin__btn admin__btn--ghost"
            onClick={() => onUpdateProduct({ image: undefined })}
          >
            Прибрати власне фото товару
          </button>

          <button
            type="button"
            className="admin__btn admin-edit-modal__done"
            onClick={onClose}
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
}
