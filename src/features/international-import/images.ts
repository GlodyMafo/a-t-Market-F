const MAX_IMAGES = 24;
const LIST_KEYS = ["imageUrls", "images", "imageList", "gallery", "photos"] as const;

function toUrl(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    for (const key of ["url", "imageUrl", "src"]) {
      if (typeof record[key] === "string") return record[key] as string;
    }
  }
  return null;
}

/**
 * Toutes les photos du devis, sans doublon, en https uniquement.
 * Le contrat typé ne déclare que `imageUrl` : les listes sont lues si le backend les renvoie.
 */
export function collectQuoteImages(preview: object): string[] {
  const record = preview as Record<string, unknown>;
  const raw: unknown[] = [record.imageUrl];
  for (const key of LIST_KEYS) {
    const list = record[key];
    if (Array.isArray(list)) raw.push(...list);
  }

  const seen = new Set<string>();
  const urls: string[] = [];
  for (const item of raw) {
    let url = toUrl(item)?.trim();
    if (!url) continue;
    if (url.startsWith("//")) url = `https:${url}`;
    if (!url.startsWith("https://") || seen.has(url)) continue;
    seen.add(url);
    urls.push(url);
    if (urls.length >= MAX_IMAGES) break;
  }
  return urls;
}