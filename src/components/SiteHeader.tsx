import { SITE_LOGO_URL } from "../utils";

type Props = {
  title: string;
};

export function SiteHeader({ title }: Props) {
  return (
    <>
      <header className="site-topbar">
        <div className="site-topbar__brand">
          <img src={SITE_LOGO_URL} alt="" className="site-topbar__logo" />
          <span className="site-topbar__name">{title}</span>
        </div>
        <div className="site-topbar__actions" aria-hidden>
          <span className="site-topbar__icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path
                d="M20 20L16.5 16.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="site-topbar__icon site-topbar__icon--sun">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="4" fill="currentColor" />
              <path
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
              />
            </svg>
          </span>
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
