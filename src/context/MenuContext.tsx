import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  clearStoredMenu,
  downloadMenuJson,
  fetchDefaultMenu,
  loadMenu,
  MENU_STORAGE_KEY,
  saveMenuToStorage,
} from "../storage/menuStorage";
import type { MenuData } from "../types";

type MenuContextValue = {
  menu: MenuData | null;
  loading: boolean;
  isCustom: boolean;
  setMenu: (menu: MenuData) => void;
  saveMenu: () => void;
  resetToDefault: () => Promise<void>;
  exportMenu: () => void;
  reload: () => Promise<void>;
};

const MenuContext = createContext<MenuContextValue | null>(null);

export function MenuProvider({ children }: { children: ReactNode }) {
  const [menu, setMenuState] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCustom, setIsCustom] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await loadMenu();
      setMenuState(data);
      setIsCustom(!!localStorage.getItem(MENU_STORAGE_KEY));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const setMenu = useCallback((next: MenuData) => {
    setMenuState(next);
    setIsCustom(true);
  }, []);

  const saveMenu = useCallback(() => {
    if (!menu) return;
    saveMenuToStorage(menu);
    setIsCustom(true);
  }, [menu]);

  const resetToDefault = useCallback(async () => {
    clearStoredMenu();
    const data = await fetchDefaultMenu();
    setMenuState(data);
    setIsCustom(false);
  }, []);

  const exportMenu = useCallback(() => {
    if (menu) downloadMenuJson(menu);
  }, [menu]);

  const value = useMemo(
    () => ({
      menu,
      loading,
      isCustom,
      setMenu,
      saveMenu,
      resetToDefault,
      exportMenu,
      reload,
    }),
    [menu, loading, isCustom, setMenu, saveMenu, resetToDefault, exportMenu, reload]
  );

  return (
    <MenuContext.Provider value={value}>{children}</MenuContext.Provider>
  );
}

export function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error("useMenu must be used within MenuProvider");
  return ctx;
}
