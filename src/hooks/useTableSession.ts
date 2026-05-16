import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { normalizeTableId, TABLE_STORAGE_KEY } from "../utils";

export function useTableSession() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const fromUrl = normalizeTableId(searchParams.get("table"));
    if (!fromUrl) return;
    try {
      sessionStorage.setItem(TABLE_STORAGE_KEY, fromUrl);
    } catch {
      /* ignore */
    }
  }, [searchParams]);

  const tableId = useMemo(() => {
    const fromUrl = normalizeTableId(searchParams.get("table"));
    if (fromUrl) return fromUrl;
    try {
      return normalizeTableId(sessionStorage.getItem(TABLE_STORAGE_KEY));
    } catch {
      return null;
    }
  }, [searchParams]);

  return { tableId };
}
