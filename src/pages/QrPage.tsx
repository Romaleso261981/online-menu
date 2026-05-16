import QRCode from "qrcode";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "../qr.css";

function resolveMenuUrl() {
  const fromEnv = import.meta.env.VITE_MENU_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "") + "/";
  return `${window.location.origin}/`;
}

export function QrPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pngUrl, setPngUrl] = useState("");
  const menuUrl = useMemo(() => resolveMenuUrl(), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    QRCode.toCanvas(canvas, menuUrl, {
      width: 300,
      margin: 2,
      color: { dark: "#111111", light: "#ffffff" },
    })
      .then(() => {
        if (!cancelled) setPngUrl(canvas.toDataURL("image/png"));
      })
      .catch(() => {
        if (!cancelled) setPngUrl("");
      });
    return () => {
      cancelled = true;
    };
  }, [menuUrl]);

  return (
    <div className="qr-page">
      <div className="qr-page__card">
        <h1>QR-код меню</h1>
        <p className="qr-page__hint">
          Відскануйте камерою телефону — відкриється онлайн-меню.
        </p>
        <canvas ref={canvasRef} className="qr-page__canvas" aria-hidden />
        <p className="qr-page__url">
          <a href={menuUrl}>{menuUrl}</a>
        </p>
        {pngUrl ? (
          <a className="qr-page__download btn btn--primary" href={pngUrl} download="menu-qr.png">
            Завантажити PNG
          </a>
        ) : null}
        <Link className="qr-page__back" to="/">
          ← До меню
        </Link>
      </div>
    </div>
  );
}
