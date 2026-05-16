import QRCode from "qrcode";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMenuBaseUrl } from "../hooks/useMenuBaseUrl";
import { buildMenuUrl, formatTableLabel } from "../utils";
import "../qr.css";

export function QrPage() {
  const baseUrl = useMenuBaseUrl();
  const [searchParams] = useSearchParams();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pngUrl, setPngUrl] = useState("");
  const [tableId, setTableId] = useState(
    () => searchParams.get("table")?.trim() || "1"
  );

  const menuUrl = useMemo(
    () => buildMenuUrl(baseUrl, tableId),
    [baseUrl, tableId]
  );

  const tableLabel = useMemo(() => {
    const id = tableId.trim();
    return id ? formatTableLabel(id) : null;
  }, [tableId]);

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

  const downloadName = tableId.trim()
    ? `menu-${tableId.trim().replace(/[^\p{L}\p{N}]+/gu, "-")}-qr.png`
    : "menu-qr.png";

  return (
    <div className="qr-page">
      <div className="qr-page__card">
        <h1>QR-код для столика</h1>
        <p className="qr-page__hint">
          Вкажіть номер столика — у QR буде посилання з параметром{" "}
          <code>table</code>. Клієнт відкриє меню, а в замовленні з’явиться
          цей столик.
        </p>
        <label className="qr-page__field">
          <span>Номер або назва столика</span>
          <input
            type="text"
            value={tableId}
            onChange={(e) => setTableId(e.target.value)}
            placeholder="1"
            autoComplete="off"
          />
        </label>
        {tableLabel ? (
          <p className="qr-page__table-preview">{tableLabel}</p>
        ) : null}
        <canvas ref={canvasRef} className="qr-page__canvas" aria-hidden />
        <p className="qr-page__url">
          <a href={menuUrl}>{menuUrl}</a>
        </p>
        {pngUrl ? (
          <a
            className="qr-page__download btn btn--primary"
            href={pngUrl}
            download={downloadName}
          >
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
