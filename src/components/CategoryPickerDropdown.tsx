import { useEffect, useRef, useState } from "react";
import type { Category } from "../types";

type Props = {
  categories: Category[];
  value: string;
  onChange: (slug: string) => void;
  onCreateCategory?: (title: string) => string;
  label?: string;
};

export function CategoryPickerDropdown({
  categories,
  value,
  onChange,
  onCreateCategory,
  label = "Категорія",
}: Props) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = categories.find((c) => c.slug === value);

  useEffect(() => {
    if (!open) {
      setCreating(false);
      setNewTitle("");
      return;
    }
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    if (creating && open) inputRef.current?.focus();
  }, [creating, open]);

  const submitNewCategory = () => {
    if (!onCreateCategory) return;
    const slug = onCreateCategory(newTitle);
    if (!slug) return;
    onChange(slug);
    setOpen(false);
    setCreating(false);
    setNewTitle("");
  };

  return (
    <div className="category-dropdown" ref={rootRef}>
      <span className="category-dropdown__label">{label}</span>
      <button
        type="button"
        className="category-dropdown__trigger"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((o) => !o)}
      >
        <span>{selected?.title ?? "Оберіть категорію"}</span>
        <span className="category-dropdown__chevron" aria-hidden>
          ▾
        </span>
      </button>
      {open ? (
        <div className="category-dropdown__panel">
          <ul className="category-dropdown__menu" role="listbox">
            {categories.map((c) => (
              <li key={c.slug} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={c.slug === value}
                  className={
                    c.slug === value
                      ? "category-dropdown__option is-active"
                      : "category-dropdown__option"
                  }
                  onClick={() => {
                    onChange(c.slug);
                    setOpen(false);
                  }}
                >
                  {c.title}
                </button>
              </li>
            ))}
          </ul>
          {onCreateCategory ? (
            <div className="category-dropdown__footer">
              {creating ? (
                <div className="category-dropdown__create-form">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newTitle}
                    placeholder="Назва категорії"
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") submitNewCategory();
                      if (e.key === "Escape") setCreating(false);
                    }}
                  />
                  <button
                    type="button"
                    className="category-dropdown__add-btn"
                    onClick={submitNewCategory}
                  >
                    Додати
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="category-dropdown__create-trigger"
                  onClick={() => setCreating(true)}
                >
                  Створити нову категорію
                </button>
              )}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
