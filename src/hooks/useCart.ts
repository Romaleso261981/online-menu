import { useCallback, useMemo, useState } from "react";
import type { CartLine } from "../types";

export function useCart() {
  const [lines, setLines] = useState<CartLine[]>([]);

  const add = useCallback(
    (item: Omit<CartLine, "quantity">, qty = 1) => {
      setLines((prev) => {
        const existing = prev.find((l) => l.productId === item.productId);
        if (existing) {
          return prev.map((l) =>
            l.productId === item.productId
              ? { ...l, quantity: l.quantity + qty }
              : l
          );
        }
        return [...prev, { ...item, quantity: qty }];
      });
    },
    []
  );

  const setQuantity = useCallback((productId: number, quantity: number) => {
    setLines((prev) => {
      if (quantity <= 0) {
        return prev.filter((l) => l.productId !== productId);
      }
      return prev.map((l) =>
        l.productId === productId ? { ...l, quantity } : l
      );
    });
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const total = useMemo(
    () => lines.reduce((sum, l) => sum + l.price * l.quantity, 0),
    [lines]
  );

  const count = useMemo(
    () => lines.reduce((sum, l) => sum + l.quantity, 0),
    [lines]
  );

  return { lines, add, setQuantity, clear, total, count };
}
