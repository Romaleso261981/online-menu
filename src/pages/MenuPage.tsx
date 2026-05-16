import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CartDrawer } from "../components/CartDrawer";
import { CategoryPicker } from "../components/CategoryPicker";
import { SiteHeader } from "../components/SiteHeader";
import { ProductCard } from "../components/ProductCard";
import { ProductModal } from "../components/ProductModal";
import { useMenu } from "../context/MenuContext";
import { useCart } from "../hooks/useCart";
import type { Product } from "../types";
import {
  findCategoryForProduct,
  findProduct,
  parseProductHash,
} from "../utils";
import "../App.css";

export function MenuPage() {
  const { menu, loading } = useMenu();
  const [activeSlug, setActiveSlug] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const cart = useCart();

  useEffect(() => {
    if (menu && !activeSlug) {
      setActiveSlug(menu.categories[0]?.slug ?? "");
    }
  }, [menu, activeSlug]);

  const selectedProduct = useMemo(
    () => (menu && selectedId ? findProduct(menu, selectedId) ?? null : null),
    [menu, selectedId]
  );

  const selectedCategory = useMemo(
    () =>
      menu && selectedId
        ? findCategoryForProduct(menu, selectedId) ?? null
        : null,
    [menu, selectedId]
  );

  const openProduct = useCallback((id: number) => {
    setSelectedId(id);
    window.history.replaceState(null, "", `#product-${id}`);
  }, []);

  const closeProduct = useCallback(() => {
    setSelectedId(null);
    const path = window.location.pathname + window.location.search;
    window.history.replaceState(null, "", path);
  }, []);

  useEffect(() => {
    const syncHash = () => {
      const id = parseProductHash(window.location.hash);
      if (id) setSelectedId(id);
    };
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  useEffect(() => {
    if (!menu) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id.startsWith("cat-")) {
          setActiveSlug(visible.target.id.replace("cat-", ""));
        }
      },
      { rootMargin: "-120px 0px -55% 0px", threshold: [0, 0.2, 0.5] }
    );
    menu.categories.forEach((c) => {
      const el = sectionRefs.current[c.slug];
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [menu]);

  const scrollToCategory = (slug: string) => {
    setActiveSlug(slug);
    sectionRefs.current[slug]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleAdd = (product: Product, quantity: number) => {
    cart.add({
      productId: product.id,
      name: product.name,
      price: product.price,
    }, quantity);
    setCartOpen(true);
  };

  if (loading || !menu) {
    return (
      <div className="app app--loading">
        <p>Завантаження меню…</p>
      </div>
    );
  }

  return (
    <div className="app app--with-category-bar">
      <div className="site-shell">
        <SiteHeader title={menu.restaurantName} />

        <main className="menu-sections">
          {menu.categories.map((category) => (
            <section
              key={category.slug}
              id={`cat-${category.slug}`}
              ref={(el) => {
                sectionRefs.current[category.slug] = el;
              }}
              className="menu-section"
            >
              <h2>{category.title}</h2>
              <div className="product-grid">
                {category.products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    category={category}
                    onOpen={openProduct}
                  />
                ))}
              </div>
            </section>
          ))}
        </main>
      </div>

      <ProductModal
        product={selectedProduct}
        category={selectedCategory}
        onClose={closeProduct}
        onAdd={handleAdd}
      />

      <CategoryPicker
        categories={menu.categories}
        activeSlug={activeSlug}
        open={categoryPickerOpen}
        onOpen={() => setCategoryPickerOpen(true)}
        onClose={() => setCategoryPickerOpen(false)}
        onSelect={scrollToCategory}
      />

      <CartDrawer
        open={cartOpen}
        lines={cart.lines}
        total={cart.total}
        onClose={() => setCartOpen(false)}
        onQuantity={cart.setQuantity}
        onClear={cart.clear}
      />

      {cart.count > 0 ? (
        <button
          type="button"
          className="cart-fab"
          onClick={() => setCartOpen(true)}
        >
          <span>Кошик</span>
          <strong>
            {cart.count} · {cart.total.toLocaleString("uk-UA")} ₴
          </strong>
        </button>
      ) : null}
    </div>
  );
}
