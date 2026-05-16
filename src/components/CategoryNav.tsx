import type { Category } from "../types";

type Props = {
  categories: Category[];
  activeSlug: string;
  onSelect: (slug: string) => void;
};

export function CategoryNav({ categories, activeSlug, onSelect }: Props) {
  return (
    <nav className="category-nav" aria-label="Категорії меню">
      <div className="category-nav__track">
        {categories.map((cat) => (
          <button
            key={cat.slug}
            type="button"
            className={`category-nav__chip${activeSlug === cat.slug ? " is-active" : ""}`}
            onClick={() => onSelect(cat.slug)}
          >
            {cat.title}
          </button>
        ))}
      </div>
    </nav>
  );
}
