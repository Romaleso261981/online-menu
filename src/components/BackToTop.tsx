import { useEffect, useState } from "react";

type Props = {
  raised?: boolean;
};

export function BackToTop({ raised }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 360);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      className={`back-to-top${raised ? " back-to-top--raised" : ""}`}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
    >
      <span className="back-to-top__icon" aria-hidden>
        ↑
      </span>
      <span className="back-to-top__label">Back to Top</span>
    </button>
  );
}
