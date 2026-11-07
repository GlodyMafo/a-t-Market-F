export type MarketplaceId = "shein" | "noon" | "1688";

const DOMAINS: Array<[MarketplaceId, string]> = [
  ["shein", "shein.com"],
  ["noon", "noon.com"],
  ["1688", "1688.com"],
];

/** Premier lien trouvé dans un texte collé (les partages ajoutent souvent des mots autour du lien). */
export function extractUrl(value: string): string {
  const match = value.match(/https?:\/\/[^\s<>"']+/i);
  return match ? match[0] : value.trim();
}

/** Détection pour l'interface uniquement : c'est le backend qui décide si un lien est accepté. */
export function detectMarketplaceId(raw: string): MarketplaceId | null {
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== "https:") return null;
    const host = url.hostname.toLowerCase().replace(/\.$/, "");
    for (const [id, domain] of DOMAINS) {
      if (host === domain || host.endsWith(`.${domain}`)) return id;
    }
  } catch {
    /* lien non valide */
  }
  return null;
}

export function isHttpsUrl(raw: string): boolean {
  try {
    return new URL(raw).protocol === "https:";
  } catch {
    return false;
  }
}

export function safeHost(raw: string): string | null {
  try {
    const url = new URL(raw);
    return url.protocol === "https:" ? url.hostname : null;
  } catch {
    return null;
  }
}