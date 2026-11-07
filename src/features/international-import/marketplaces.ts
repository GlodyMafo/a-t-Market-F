import type { MarketplaceId } from "@/lib/marketplace";

export const IMPORT_MARKETPLACES: ReadonlyArray<{ id: MarketplaceId; name: string; tip: string }> = [
  { id: "shein", name: "SHEIN", tip: "Ouvrez la fiche du produit, puis copiez son lien (bouton Partager ou barre d'adresse)." },
  { id: "noon", name: "NOON", tip: "Ouvrez la fiche du produit, puis copiez son lien (bouton Partager ou barre d'adresse)." },
  { id: "1688", name: "1688", tip: "Utilisez le lien d'une fiche produit, de la forme detail.1688.com/offer/….html" },
];

export function parseMarketplaceId(value: string | null): MarketplaceId | null {
  return IMPORT_MARKETPLACES.find((m) => m.id === value)?.id ?? null;
}