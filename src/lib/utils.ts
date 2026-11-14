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

/** Chemin de redirection sûr : uniquement un chemin interne, jamais une adresse externe ni une page d'authentification. */
export function safeNext(value: string | null | undefined, fallback = "/account"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  if (value.startsWith("/login") || value.startsWith("/register")) return fallback;
  return value;
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("fr-FR", { dateStyle: "long" });
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" });
}

/** « il y a 5 minutes », « hier », puis la date au-delà d'une semaine. */
export function formatRelative(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  const minutes = Math.round((date.getTime() - Date.now()) / 60_000);
  if (Math.abs(minutes) < 1) return "À l'instant";
  const rtf = new Intl.RelativeTimeFormat("fr", { numeric: "auto" });
  if (Math.abs(minutes) < 60) return rtf.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return rtf.format(hours, "hour");
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 7) return rtf.format(days, "day");
  return date.toLocaleDateString("fr-FR", { dateStyle: "long" });
}