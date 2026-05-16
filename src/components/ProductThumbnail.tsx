import { useState } from "react";
import { MENU_PLACEHOLDER_URL } from "../utils";

type Props = {
  src: string;
  fullSrc: string;
  alt?: string;
  className?: string;
};

export function ProductThumbnail({
  src,
  fullSrc,
  alt = "",
  className = "",
}: Props) {
  const [phase, setPhase] = useState<"loading" | "loaded" | "error">("loading");
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleError = () => {
    if (currentSrc === src && fullSrc !== src) {
      setCurrentSrc(fullSrc);
      setPhase("loading");
      return;
    }
    if (currentSrc !== MENU_PLACEHOLDER_URL) {
      setCurrentSrc(MENU_PLACEHOLDER_URL);
      setPhase("loading");
      return;
    }
    setPhase("error");
  };

  return (
    <div
      className={`product-thumb${phase === "loaded" ? " product-thumb--loaded" : ""}${className ? ` ${className}` : ""}`}
    >
      {phase !== "loaded" && phase !== "error" ? (
        <span className="product-thumb__skeleton" aria-hidden />
      ) : null}
      <img
        src={currentSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        fetchPriority="low"
        onLoad={() => setPhase("loaded")}
        onError={handleError}
      />
    </div>
  );
}
