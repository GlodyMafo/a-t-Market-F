import type { CatalogSort } from "@/types/enums";

export const CATALOG_PAGE_SIZE = 20;

export const SORT_OPTIONS: ReadonlyArray<{ value: CatalogSort; label: string }> = [
  { value: "relevance", label: "Pertinence" },
  { value: "newest", label: "Nouveautés" },
  { value: "price_asc", label: "Prix croissant" },
  { value: "price_desc", label: "Prix décroissant" },
  { value: "name_asc", label: "Nom (A à Z)" },
];

export const CATALOG_SORTS: readonly string[] = SORT_OPTIONS.map((o) => o.value);

/** Affiche « Plus que N en stock » quand le stock est inférieur ou égal à ce seuil (choix d'affichage). */
export const LOW_STOCK_NOTICE = 5;