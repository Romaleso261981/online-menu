export function useMenuBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_MENU_URL?.trim();
  if (fromEnv) {
    return fromEnv.endsWith("/") ? fromEnv : `${fromEnv}/`;
  }
  return `${window.location.origin}/`;
}
