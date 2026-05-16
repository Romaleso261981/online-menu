import { useEffect, useRef, useState } from "react";
import type { Category } from "../types";

type Props = {
  categories: Category[];
  value: string;
  onChange: (slug: string) => void;
  label?: string;
};

export function CategoryPickerDropdown({
  categories,
  value,
  onChange,
  label = "Категорія",
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = categories.find((c) => c.slug === value);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

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
      ) : null}
    </div>
  );
}
