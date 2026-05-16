import type { MenuData } from "../types";

export const MENU_STORAGE_KEY = "online-menu-data-v1";

export async function fetchDefaultMenu(): Promise<MenuData> {
  const res = await fetch("/menu.json");
  if (!res.ok) throw new Error("Не вдалося завантажити menu.json");
  return res.json() as Promise<MenuData>;
}

export function readStoredMenu(): MenuData | null {
  const raw = localStorage.getItem(MENU_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as MenuData;
  } catch {
    return null;
  }
}

export async function loadMenu(): Promise<MenuData> {
  return readStoredMenu() ?? fetchDefaultMenu();
}

export function saveMenuToStorage(menu: MenuData): void {
  localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(menu));
}

export function clearStoredMenu(): void {
  localStorage.removeItem(MENU_STORAGE_KEY);
}

export function downloadMenuJson(menu: MenuData, filename = "menu.json"): void {
  const blob = new Blob([JSON.stringify(menu, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
