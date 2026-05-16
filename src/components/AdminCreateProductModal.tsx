import { useEffect, useId, useState } from "react";
import type { Category, Product } from "../types";
import { CategoryPickerDropdown } from "./CategoryPickerDropdown";
import { formatPrice, productImageUrl } from "../utils";

type Props = {
  categories: Category[];
  currency: string;
  onClose: () => void;
  onCreate: (categorySlug: string, product: Product) => void;
  onReadImage: (file: File) => Promise<string>;
  onError: (message: string) => void;
};

export function AdminCreateProductModal({
  categories,
  currency,
  onClose,
  onCreate,
  onReadImage,
  onError,
}: Props) {
  const imageInputId = useId();
  const [categorySlug, setCategorySlug] = useState(
    () => categories[0]?.slug ?? ""
  );
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [priceLabel, setPriceLabel] = useState(formatPrice(0, currency));
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | undefined>();

  useEffect(() => {
    if (categories.length && !categories.some((c) => c.slug === categorySlug)) {
      setCategorySlug(categories[0]!.slug);
    }
  }, [categories, categorySlug]);

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

  const selectedCategory = categories.find((c) => c.slug === categorySlug);

  const draftProduct: Product = {
    id: 0,
    name: name || "Нова позиція",
    price,
    priceLabel,
    description,
    image,
  };

  const submit = () => {
    if (!categorySlug) {
      onError("Оберіть категорію");
      return;
    }
    if (!name.trim()) {
      onError("Введіть назву товару");
      return;
    }
    onCreate(categorySlug, {
      id: 0,
      name: name.trim(),
      price,
      priceLabel: priceLabel.trim() || formatPrice(price, currency),
      description: description.trim(),
      image,
    });
  };

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
          <h2>Новий товар</h2>
          <p className="admin-edit-modal__hint">
            Заповніть поля та натисніть «Створити картку».
          </p>

          <CategoryPickerDropdown
            label="Категорія"
            categories={categories}
            value={categorySlug}
            onChange={setCategorySlug}
          />

          <label
            htmlFor={imageInputId}
            className="admin-edit-modal__image-picker"
          >
            {selectedCategory ? (
              <img
                src={productImageUrl(draftProduct, selectedCategory)}
                alt=""
                className="admin__preview-img"
              />
            ) : null}
            <span className="admin-edit-modal__image-picker-label">
              Натисніть, щоб обрати фото
            </span>
            <input
              id={imageInputId}
              type="file"
              accept="image/*"
              className="admin-product-card__file"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                void onReadImage(f)
                  .then((url) => setImage(url))
                  .catch((err) =>
                    onError(err instanceof Error ? err.message : "Помилка")
                  );
                e.target.value = "";
              }}
            />
          </label>
          <label>
            URL зображення (необовʼязково)
            <input
              value={image ?? ""}
              placeholder="/images/..."
              onChange={(e) => setImage(e.target.value || undefined)}
            />
          </label>

          <label>
            Назва
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Назва страви"
            />
          </label>
          <label>
            Ціна (число)
            <input
              type="number"
              min={0}
              value={price}
              onChange={(e) => {
                const next = Number(e.target.value) || 0;
                setPrice(next);
                setPriceLabel(formatPrice(next, currency));
              }}
            />
          </label>
          <label>
            Підпис ціни
            <input
              value={priceLabel}
              onChange={(e) => setPriceLabel(e.target.value)}
            />
          </label>
          <label>
            Опис
            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Склад, алергени..."
            />
          </label>

          <button
            type="button"
            className="admin__btn admin-edit-modal__done"
            onClick={submit}
          >
            Створити картку
          </button>
        </div>
      </div>
    </div>
  );
}
