import { useTheme } from "../context/ThemeContext";
import { SITE_LOGO_URL } from "../utils";

type Props = {
  title: string;
  cartCount: number;
  onCartClick: () => void;
};

function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6h15l-1.5 9h-12L6 6z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M6 6L5 3H2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="20" r="1.5" fill="currentColor" />
      <circle cx="18" cy="20" r="1.5" fill="currentColor" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      <path
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 14.5A8.5 8.5 0 1 1 9.5 3.2a7 7 0 1 0 11.5 11.3z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.15"
      />
    </svg>
  );
}

export function SiteHeader({ title, cartCount, onCartClick }: Props) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <>
      <header className="site-topbar">
        <div className="site-topbar__brand">
          <img src={SITE_LOGO_URL} alt="" className="site-topbar__logo" />
          <span className="site-topbar__name">{title}</span>
        </div>
        <div className="site-topbar__actions">
          <button
            type="button"
            className="site-topbar__icon site-topbar__cart"
            onClick={onCartClick}
            aria-label={
              cartCount > 0 ? `Кошик, ${cartCount} товарів` : "Кошик"
            }
          >
            <CartIcon />
            {cartCount > 0 ? (
              <span className="site-topbar__badge" aria-hidden>
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            ) : null}
          </button>
          <button
            type="button"
            className="site-topbar__icon site-topbar__theme"
            onClick={toggleTheme}
            aria-label={isDark ? "Увімкнути світлу тему" : "Увімкнути темну тему"}
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </header>
      <section className="site-brand" aria-label="Бренд">
        <img src={SITE_LOGO_URL} alt="" className="site-brand__logo" />
        <p className="site-brand__title">
          OREGANO
          <br />
          GROUP
        </p>
      </section>
    </>
  );
}
