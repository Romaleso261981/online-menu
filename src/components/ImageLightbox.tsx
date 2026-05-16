import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  src: string;
  alt: string;
  onClose: () => void;
};

const ZOOM = 1.45;

export function ImageLightbox({ src, alt, onClose }: Props) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [grabbing, setGrabbing] = useState(false);
  const dragRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  });
  const limitsRef = useRef({ x: 160, y: 160 });

  const clampOffset = useCallback((x: number, y: number) => {
    const { x: maxX, y: maxY } = limitsRef.current;
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    };
  }, []);

  useEffect(() => {
    setOffset({ x: 0, y: 0 });
  }, [src]);

  useEffect(() => {
    const updateLimits = () => {
      limitsRef.current = {
        x: Math.max(80, window.innerWidth * 0.22),
        y: Math.max(80, window.innerHeight * 0.18),
      };
    };
    updateLimits();
    window.addEventListener("resize", updateLimits);
    return () => window.removeEventListener("resize", updateLimits);
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      originX: offset.x,
      originY: offset.y,
    };
    setGrabbing(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setOffset(
      clampOffset(dragRef.current.originX + dx, dragRef.current.originY + dy)
    );
  };

  const endDrag = () => {
    dragRef.current.active = false;
    setGrabbing(false);
  };

  return (
    <div
      className="image-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Перегляд зображення"
    >
      <button
        type="button"
        className="image-lightbox__backdrop"
        onClick={onClose}
        aria-label="Закрити"
      />
      <button
        type="button"
        className="image-lightbox__close"
        onClick={onClose}
        aria-label="Закрити"
      >
        ×
      </button>
      <div
        className={`image-lightbox__stage${grabbing ? " is-grabbing" : ""}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          style={{
            transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${ZOOM})`,
          }}
        />
      </div>
    </div>
  );
}
