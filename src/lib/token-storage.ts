const KEY = "atm.token";
let memoryToken: string | null = null;

export const tokenStorage = {
  get(): string | null {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem(KEY) ?? memoryToken;
    } catch {
      return memoryToken; // stockage bloqué (navigation privée, etc.)
    }
  },
  set(token: string): void {
    memoryToken = token;
    try {
      window.localStorage.setItem(KEY, token);
    } catch {
      /* repli en mémoire */
    }
  },
  clear(): void {
    memoryToken = null;
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      /* ignoré */
    }
  },
};