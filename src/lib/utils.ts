import { env } from "./env";

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** Affichage uniquement : le backend reste seul responsable de tout calcul. */
export function formatUsd(amount: string | number | null | undefined): string {
  if (amount === null || amount === undefined || amount === "") return "—";
  const n = typeof amount === "number" ? amount : Number(amount);
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "USD" }).format(n);
}

/** Le backend peut renvoyer un chemin relatif (stockage local du MVP) : on le complète avec l'URL de l'API. */
export function resolveImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${env.apiUrl}${url.startsWith("/") ? "" : "/"}${url}`;
}

/** Minuscules sans accents, pour comparer des textes. */
export function normalizeText(value: string): string {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}