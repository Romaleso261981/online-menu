import { useEffect } from "react";
import type { CartLine } from "../types";
import { formatOrderMessage, formatPrice, formatTableLabel } from "../utils";

type Props = {
  open: boolean;
  lines: CartLine[];
  total: number;
  tableId: string | null;
  onClose: () => void;
  onQuantity: (productId: number, quantity: number) => void;
  onClear: () => void;
};

export function CartDrawer({
  open,
  lines,
  total,
  tableId,
  onClose,
  onQuantity,
  onClear,
}: Props) {
  const handleCheckout = async () => {
    const text = formatOrderMessage(lines, total, tableId);
    try {
      await navigator.clipboard.writeText(text);
      const tableNote = tableId
        ? `\n\n${formatTableLabel(tableId)} — збережено в тексті замовлення.`
        : "";
      alert(
        `Замовлення скопійовано в буфер обміну.${tableNote}\n\nВставте повідомлення нам у месенджер або надішліть офіціанту.`
      );
    } catch {
      alert(text);
    }
  };
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="cart" role="dialog" aria-modal="true" aria-label="Кошик">
      <button type="button" className="cart__backdrop" onClick={onClose} aria-label="Закрити" />
      <div className="cart__panel">
        <header className="cart__header">
          <div className="cart__header-text">
            <h2>Кошик</h2>
            {tableId ? (
              <p className="cart__table">{formatTableLabel(tableId)}</p>
            ) : null}
          </div>
          <button
            type="button"
            className="cart__close"
            onClick={onClose}
            aria-label="Закрити"
          >
            ×
          </button>
        </header>
        <div className="cart__body">
          {lines.length === 0 ? (
            <p className="cart__empty">Додайте страви з меню</p>
          ) : (
            <ul className="cart__list">
            {lines.map((line) => (
              <li key={line.productId} className="cart__line">
                <div>
                  <strong>{line.name}</strong>
                  <span>{formatPrice(line.price)}</span>
                </div>
                <div className="qty qty--compact">
                  <button
                    type="button"
                    onClick={() => onQuantity(line.productId, line.quantity - 1)}
                    aria-label="Менше"
                  >
                    −
                  </button>
                  <span>{line.quantity}</span>
                  <button
                    type="button"
                    onClick={() => onQuantity(line.productId, line.quantity + 1)}
                    aria-label="Більше"
                  >
                    +
                  </button>
                </div>
              </li>
            ))}
            </ul>
          )}
        </div>
        <footer className="cart__footer">
          <div className="cart__total">
            <span>Разом</span>
            <strong>{formatPrice(total)}</strong>
          </div>
          <button
            type="button"
            className="btn btn--primary"
            disabled={lines.length === 0}
            onClick={() => void handleCheckout()}
          >
            Оформити замовлення
          </button>
          {lines.length > 0 ? (
            <button type="button" className="btn btn--ghost" onClick={onClear}>
              Очистити
            </button>
          ) : null}
        </footer>
      </div>
    </div>
  );
}
