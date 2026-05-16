import { useEffect, useRef } from "react";
import type { Category } from "../types";

type Props = {
  categories: Category[];
  activeSlug: string;
  onSelect: (slug: string) => void;
};

export function CategoryNav({ categories, activeSlug, onSelect }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const isFirstScroll = useRef(true);

  useEffect(() => {
    const track = trackRef.current;
    const chip = chipRefs.current[activeSlug];
    if (!track || !chip) return;

    const targetLeft =
      chip.offsetLeft - track.clientWidth / 2 + chip.offsetWidth / 2;
    const maxScroll = track.scrollWidth - track.clientWidth;
    const left = Math.max(0, Math.min(targetLeft, maxScroll));

    track.scrollTo({
      left,
      behavior: isFirstScroll.current ? "auto" : "smooth",
    });
    isFirstScroll.current = false;
  }, [activeSlug, categories]);

  return (
    <nav className="category-nav" aria-label="Категорії меню">
      <div ref={trackRef} className="category-nav__track">
        {categories.map((cat) => (
          <button
            key={cat.slug}
            ref={(el) => {
              chipRefs.current[cat.slug] = el;
            }}
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
