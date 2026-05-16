import { useEffect, useId } from "react";
import type { Category } from "../types";

type Props = {
  categories: Category[];
  activeSlug: string;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onSelect: (slug: string) => void;
};

function ChevronDown() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CategoryPicker({
  categories,
  activeSlug,
  open,
  onOpen,
  onClose,
  onSelect,
}: Props) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const handleSelect = (slug: string) => {
    onSelect(slug);
    onClose();
  };

  return (
    <>
      <button
        type="button"
        className="category-picker-bar"
        onClick={onOpen}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <span className="category-picker-bar__label">Виберіть категорію меню</span>
        <span className="category-picker-bar__chevron">
          <ChevronDown />
        </span>
      </button>

      {open ? (
        <div
          className="category-picker"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <button
            type="button"
            className="category-picker__backdrop"
            onClick={onClose}
            aria-label="Закрити"
          />
          <div className="category-picker__sheet">
            <header className="category-picker__header">
              <h2 id={titleId} className="category-picker__title">
                Категорії меню
              </h2>
              <button
                type="button"
                className="category-picker__close"
                onClick={onClose}
                aria-label="Закрити"
              >
                ×
              </button>
            </header>
            <ul className="category-picker__list">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <button
                    type="button"
                    className={`category-picker__item${
                      activeSlug === cat.slug ? " is-active" : ""
                    }`}
                    onClick={() => handleSelect(cat.slug)}
                  >
                    {cat.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  );
}
