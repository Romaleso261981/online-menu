import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AdminProductEditModal } from "../components/AdminProductEditModal";
import { CategoryNav } from "../components/CategoryNav";
import { AdminProductCard } from "../components/AdminProductCard";
import { useMenu } from "../context/MenuContext";
import type { Category, MenuData, Product } from "../types";
import { nextProductId, uniqueCategorySlug } from "../utils";
import { AdminCreateProductModal } from "../components/AdminCreateProductModal";
import "../App.css";
import "../admin.css";

function readImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.size > 900_000) {
      reject(
        new Error(
          "Файл завеликий (макс. ~900 КБ). Краще покласти в /public/images/ і вказати шлях."
        )
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Не вдалося прочитати файл"));
    reader.readAsDataURL(file);
  });
}

type EditingTarget = {
  categorySlug: string;
  productId: number;
};

export function AdminPage() {
  const { menu, loading, isCustom, setMenu, saveMenu, resetToDefault, exportMenu } =
    useMenu();
  const [activeSlug, setActiveSlug] = useState("");
  const [editing, setEditing] = useState<EditingTarget | null>(null);
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [status, setStatus] = useState("");
  const [importError, setImportError] = useState("");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    if (menu && !activeSlug) {
      setActiveSlug(menu.categories[0]?.slug ?? "");
    }
  }, [menu, activeSlug]);

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
      { rootMargin: "-140px 0px -55% 0px", threshold: [0, 0.2, 0.5] }
    );
    menu.categories.forEach((c) => {
      const el = sectionRefs.current[c.slug];
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [menu]);

  const editingContext = useMemo(() => {
    if (!menu || !editing) return null;
    const category = menu.categories.find((c) => c.slug === editing.categorySlug);
    const product = category?.products.find((p) => p.id === editing.productId);
    if (!category || !product) return null;
    return { category, product };
  }, [menu, editing]);

  const patchMenu = (updater: (draft: MenuData) => MenuData) => {
    if (!menu) return;
    setMenu(updater(menu));
    setStatus("Є незбережені зміни");
  };

  const updateCategory = (slug: string, patch: Partial<Category>) => {
    patchMenu((m) => ({
      ...m,
      categories: m.categories.map((c) =>
        c.slug === slug ? { ...c, ...patch } : c
      ),
    }));
  };

  const updateProduct = (
    catSlug: string,
    id: number,
    patch: Partial<Product>
  ) => {
    patchMenu((m) => ({
      ...m,
      categories: m.categories.map((c) =>
        c.slug !== catSlug
          ? c
          : {
              ...c,
              products: c.products.map((p) =>
                p.id === id ? { ...p, ...patch } : p
              ),
            }
      ),
    }));
  };

  const moveProductToCategory = (
    fromSlug: string,
    productId: number,
    toSlug: string
  ) => {
    if (fromSlug === toSlug) return;
    patchMenu((m) => {
      let moved: Product | undefined;
      const without = m.categories.map((c) => {
        if (c.slug !== fromSlug) return c;
        const found = c.products.find((p) => p.id === productId);
        if (!found) return c;
        moved = found;
        return {
          ...c,
          products: c.products.filter((p) => p.id !== productId),
        };
      });
      if (!moved) return m;
      return {
        ...m,
        categories: without.map((c) =>
          c.slug === toSlug
            ? { ...c, products: [...c.products, moved!] }
            : c
        ),
      };
    });
    setEditing({ categorySlug: toSlug, productId });
    setActiveSlug(toSlug);
  };

  const addCategoryAndMoveProduct = (
    title: string,
    fromSlug: string,
    productId: number
  ) => {
    if (!menu) return;
    const trimmed = title.trim();
    if (!trimmed) {
      setImportError("Введіть назву нової категорії");
      return;
    }
    const slug = uniqueCategorySlug(menu.categories, trimmed);
    patchMenu((m) => {
      let moved: Product | undefined;
      const categories = m.categories.map((c) => {
        if (c.slug !== fromSlug) return c;
        const found = c.products.find((p) => p.id === productId);
        if (!found) return c;
        moved = found;
        return {
          ...c,
          products: c.products.filter((p) => p.id !== productId),
        };
      });
      if (!moved) return m;
      return {
        ...m,
        categories: [
          ...categories,
          {
            slug,
            title: trimmed,
            products: [moved],
          },
        ],
      };
    });
    setEditing({ categorySlug: slug, productId });
    setActiveSlug(slug);
    setImportError("");
  };

  const addEmptyCategory = (title: string): string => {
    if (!menu) return "";
    const trimmed = title.trim();
    if (!trimmed) {
      setImportError("Введіть назву нової категорії");
      return "";
    }
    const slug = uniqueCategorySlug(menu.categories, trimmed);
    patchMenu((m) => ({
      ...m,
      categories: [...m.categories, { slug, title: trimmed, products: [] }],
    }));
    setActiveSlug(slug);
    setImportError("");
    return slug;
  };

  const createProduct = (categorySlug: string, draft: Product) => {
    if (!menu) return;
    const id = nextProductId(menu);
    const product: Product = { ...draft, id };
    patchMenu((m) => ({
      ...m,
      categories: m.categories.map((c) =>
        c.slug === categorySlug
          ? { ...c, products: [...c.products, product] }
          : c
      ),
    }));
    setCreatingProduct(false);
    setEditing({ categorySlug, productId: id });
    setActiveSlug(categorySlug);
    setStatus("Товар створено — збережіть зміни");
    requestAnimationFrame(() => {
      sectionRefs.current[categorySlug]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const handleSave = () => {
    saveMenu();
    setStatus("Збережено в браузері");
  };

  const handleImport = async (file: File) => {
    setImportError("");
    try {
      const text = await file.text();
      const data = JSON.parse(text) as MenuData;
      if (!data.categories?.length) throw new Error("Невірний формат menu.json");
      setMenu(data);
      setStatus("Імпортовано — натисніть «Зберегти»");
    } catch (e) {
      setImportError(e instanceof Error ? e.message : "Помилка імпорту");
    }
  };

  const scrollToCategory = (slug: string) => {
    setActiveSlug(slug);
    sectionRefs.current[slug]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  if (loading || !menu) {
    return (
      <div className="admin admin--loading">
        <p>Завантаження…</p>
      </div>
    );
  }

  return (
    <div className="admin">
      <header className="admin__header admin__header--compact">
        <div>
          <h1>Адмінка</h1>
          <p className="admin__meta">
            Натисніть картку, щоб редагувати ·{" "}
            {isCustom ? "збережена версія" : "menu.json"}
            {status ? ` · ${status}` : ""}
          </p>
        </div>
        <div className="admin__header-actions">
          <Link to="/" className="admin__btn admin__btn--ghost">
            На сайт
          </Link>
          <button
            type="button"
            className="admin__btn"
            onClick={() => setCreatingProduct(true)}
          >
            Додати товар
          </button>
          <button type="button" className="admin__btn" onClick={handleSave}>
            Зберегти
          </button>
          <button
            type="button"
            className="admin__btn admin__btn--ghost"
            onClick={exportMenu}
          >
            JSON
          </button>
          <button
            type="button"
            className="admin__btn admin__btn--ghost"
            onClick={() =>
              void resetToDefault().then(() => setStatus("Скинуто"))
            }
          >
            Скинути
          </button>
        </div>
      </header>

      <details className="admin__toolbar-collapsible">
        <summary>Налаштування закладу та імпорт</summary>
        <div className="admin__toolbar">
          <label>
            Назва закладу
            <input
              value={menu.restaurantName}
              onChange={(e) =>
                patchMenu((m) => ({ ...m, restaurantName: e.target.value }))
              }
            />
          </label>
          <label>
            Імпорт menu.json
            <input
              type="file"
              accept="application/json,.json"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleImport(f);
                e.target.value = "";
              }}
            />
          </label>
          {importError ? <p className="admin__error">{importError}</p> : null}
        </div>
      </details>

      <div className="app admin__menu-preview">
        <div className="sticky-bar">
          <CategoryNav
            categories={menu.categories}
            activeSlug={activeSlug}
            onSelect={scrollToCategory}
          />
        </div>

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
                  <AdminProductCard
                    key={product.id}
                    product={product}
                    category={category}
                    onEdit={() =>
                      setEditing({
                        categorySlug: category.slug,
                        productId: product.id,
                      })
                    }
                    onImageReplace={(file) =>
                      void readImageFile(file)
                        .then((url) =>
                          updateProduct(category.slug, product.id, { image: url })
                        )
                        .catch((err) =>
                          setImportError(
                            err instanceof Error ? err.message : "Помилка"
                          )
                        )
                    }
                    onImageError={setImportError}
                  />
                ))}
              </div>
            </section>
          ))}
        </main>
      </div>

      {creatingProduct ? (
        <AdminCreateProductModal
          categories={menu.categories}
          currency={menu.currency}
          onClose={() => setCreatingProduct(false)}
          onCreate={createProduct}
          onCreateCategory={addEmptyCategory}
          onReadImage={readImageFile}
          onError={setImportError}
        />
      ) : null}

      {editingContext ? (
        <AdminProductEditModal
          category={editingContext.category}
          product={editingContext.product}
          categories={menu.categories}
          currency={menu.currency}
          onClose={() => setEditing(null)}
          onUpdateProduct={(patch) =>
            updateProduct(
              editingContext.category.slug,
              editingContext.product.id,
              patch
            )
          }
          onUpdateCategory={(patch) =>
            updateCategory(editingContext.category.slug, patch)
          }
          onMoveProduct={(toSlug) =>
            moveProductToCategory(
              editingContext.category.slug,
              editingContext.product.id,
              toSlug
            )
          }
          onCreateCategory={addEmptyCategory}
          onAddCategoryWithProduct={(title) =>
            addCategoryAndMoveProduct(
              title,
              editingContext.category.slug,
              editingContext.product.id
            )
          }
          onAddEmptyCategory={addEmptyCategory}
          onReadImage={readImageFile}
          onError={setImportError}
        />
      ) : null}
    </div>
  );
}
