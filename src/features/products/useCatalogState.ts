"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { CATALOG_PAGE_SIZE, CATALOG_SORTS } from "@/constants/catalog";
import type { ProductListParams } from "@/services/api/catalog";
import type { CatalogSort } from "@/types/enums";

export interface CatalogState {
  q: string;
  categoryId: string;
  subCategoryId: string;
  minPrice: string;
  maxPrice: string;
  sort: CatalogSort | "";
  page: number;
}

const toNumber = (value: string): number | undefined => {
  if (value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
};

export function toListParams(state: CatalogState): ProductListParams {
  return {
    q: state.q || undefined,
    categoryId: state.categoryId || undefined,
    subCategoryId: state.subCategoryId || undefined,
    minPrice: toNumber(state.minPrice),
    maxPrice: toNumber(state.maxPrice),
    sort: state.sort || undefined,
    page: state.page,
    limit: CATALOG_PAGE_SIZE,
  };
}

/** L'URL est la source de vérité : liens partageables, bouton « précédent » fonctionnel. */
export function useCatalogState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const state = useMemo<CatalogState>(() => {
    const sort = searchParams.get("sort") ?? "";
    const page = Number.parseInt(searchParams.get("page") ?? "1", 10);
    return {
      q: (searchParams.get("q") ?? "").trim().slice(0, 100),
      categoryId: searchParams.get("categoryId") ?? "",
      subCategoryId: searchParams.get("subCategoryId") ?? "",
      minPrice: searchParams.get("minPrice") ?? "",
      maxPrice: searchParams.get("maxPrice") ?? "",
      sort: CATALOG_SORTS.includes(sort) ? (sort as CatalogSort) : "",
      page: Number.isInteger(page) && page > 0 ? page : 1,
    };
  }, [searchParams]);

  const update = useCallback(
    (patch: Partial<CatalogState>) => {
      const next: CatalogState = { ...state, ...patch };
      if (!("page" in patch)) next.page = 1; // tout changement de filtre revient à la page 1
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(next)) {
        if (value === "" || (key === "page" && value === 1)) continue;
        params.set(key, String(value));
      }
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [state, router, pathname],
  );

  const reset = useCallback(() => router.push(pathname, { scroll: false }), [router, pathname]);

  return { state, update, reset };
}