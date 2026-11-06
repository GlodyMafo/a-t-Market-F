"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { FilterDrawer } from "@/components/products/FilterDrawer";
import { FilterPanel } from "@/components/products/FilterPanel";
import { Pagination } from "@/components/products/Pagination";
import { ProductCard } from "@/components/products/ProductCard";
import { PRODUCT_GRID_CLASS, ProductGridSkeleton } from "@/components/products/ProductGrid";
import { CATALOG_PAGE_SIZE, SORT_OPTIONS } from "@/constants/catalog";
import { useCategories, useSubCategories } from "@/features/categories/hooks";
import { useProducts } from "@/features/products/hooks";
import { toListParams, useCatalogState, type CatalogState } from "@/features/products/useCatalogState";
import { formatUsd } from "@/lib/utils";
import { ApiError, errorMessage } from "@/services/api/errors";
import type { CatalogSort } from "@/types/enums";

interface Chip {
  key: string;
  label: string;
  clear: Partial<CatalogState>;
}

export function CatalogView() {
  const { state, update, reset } = useCatalogState();
  const params = useMemo(() => toListParams(state), [state]);
  const { data, error, isLoading, isPlaceholderData, refetch } = useProducts(params);
  const { data: categories } = useCategories();
  const { data: subCategories } = useSubCategories();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const category = categories?.find((c) => c.id === state.categoryId);
  const subCategory = subCategories?.find((s) => s.id === state.subCategoryId);

  const chips: Chip[] = [];
  if (state.q) chips.push({ key: "q", label: `« ${state.q} »`, clear: { q: "" } });
  if (category) chips.push({ key: "category", label: category.name, clear: { categoryId: "", subCategoryId: "" } });
  if (subCategory) chips.push({ key: "sub", label: subCategory.name, clear: { subCategoryId: "" } });
  if (state.minPrice || state.maxPrice) {
    const min = state.minPrice ? formatUsd(Number(state.minPrice)) : null;
    const max = state.maxPrice ? formatUsd(Number(state.maxPrice)) : null;
    const label = min && max ? `${min} – ${max}` : min ? `À partir de ${min}` : `Jusqu'à ${max}`;
    chips.push({ key: "price", label, clear: { minPrice: "", maxPrice: "" } });
  }
  const filterCount = chips.filter((c) => c.key !== "q").length;

  const title = state.q ? `Résultats pour « ${state.q} »` : (category?.name ?? "Tous les produits");
  const total = data?.meta?.total;
  const totalPages = data?.meta?.totalPages ?? 1;
  const sortValue: CatalogSort = state.sort || (state.q ? "relevance" : "newest");

  function changePage(page: number) {
    update({ page });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderResults() {
    if (isLoading) return <ProductGridSkeleton count={CATALOG_PAGE_SIZE} />;

    if (error) {
      const invalid = error instanceof ApiError && error.kind === "validation";
      return invalid ? (
        <EmptyState title="Filtres invalides" message={errorMessage(error)} actionLabel="Réinitialiser les filtres" onAction={reset} />
      ) : (
        <ErrorState title="Impossible de charger les produits" message={errorMessage(error)} onRetry={() => refetch()} />
      );
    }

    if (!data || data.items.length === 0) {
      if (state.page > 1) {
        return <EmptyState title="Cette page n'existe pas" actionLabel="Revenir à la première page" onAction={() => update({ page: 1 })} />;
      }
      return (
        <EmptyState
          title="Aucun produit trouvé"
          message="Essayez d'autres mots-clés ou retirez certains filtres."
          actionLabel={chips.length > 0 ? "Réinitialiser les filtres" : undefined}
          onAction={chips.length > 0 ? reset : undefined}
        />
      );
    }

    return (
      <>
        <div className={`${PRODUCT_GRID_CLASS} lg:grid-cols-4 xl:grid-cols-5 ${isPlaceholderData ? "opacity-60 transition-opacity" : ""}`} aria-busy={isPlaceholderData}>
          {data.items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <Pagination page={state.page} totalPages={totalPages} onChange={changePage} />
      </>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 md:py-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold md:text-2xl">{title}</h1>
          {total !== undefined && (
            <p className="text-sm text-muted" aria-live="polite">
              {total} produit{total > 1 ? "s" : ""}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="flex h-10 items-center gap-1.5 rounded-lg border border-line px-3 text-sm font-medium lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden />
            Filtres{filterCount > 0 ? ` (${filterCount})` : ""}
          </button>
          <label className="sr-only" htmlFor="catalog-sort">Trier par</label>
          <select
            id="catalog-sort"
            value={sortValue}
            onChange={(e) => update({ sort: e.target.value as CatalogSort })}
            className="h-10 rounded-lg border border-line bg-white px-3 text-sm outline-none focus:border-brand-500"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {chips.length > 0 && (
        <ul className="mt-3 flex flex-wrap items-center gap-2" aria-label="Filtres actifs">
          {chips.map((chip) => (
            <li key={chip.key}>
              <button
                type="button"
                onClick={() => update(chip.clear)}
                aria-label={`Retirer le filtre ${chip.label}`}
                className="flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 hover:bg-brand-100"
              >
                {chip.label}
                <X className="h-3 w-3" aria-hidden />
              </button>
            </li>
          ))}
          <li>
            <button type="button" onClick={reset} className="px-2 text-xs font-medium text-muted underline">
              Tout effacer
            </button>
          </li>
        </ul>
      )}

      <div className="mt-4 grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block" aria-label="Filtres">
          <FilterPanel state={state} onChange={update} />
        </aside>
        <div>{renderResults()}</div>
      </div>

      <FilterDrawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        resultsLabel={total !== undefined ? `Voir ${total} produit${total > 1 ? "s" : ""}` : "Voir les produits"}
      >
        <FilterPanel state={state} onChange={update} />
      </FilterDrawer>
    </div>
  );
}