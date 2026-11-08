"use client";

import { ChevronDown, SearchX, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { CategoryRail } from "@/components/products/CategoryRail";
import { FilterDrawer } from "@/components/products/FilterDrawer";
import { FilterPanel } from "@/components/products/FilterPanel";
import { Pagination } from "@/components/products/Pagination";
import { ProductCard } from "@/components/products/ProductCard";
import { CATALOG_GRID_CLASS, ProductGridSkeleton } from "@/components/products/ProductGrid";
import { CATALOG_PAGE_SIZE, SORT_OPTIONS } from "@/constants/catalog";
import { useCategories, useSubCategories } from "@/features/categories/hooks";
import { useProducts } from "@/features/products/hooks";
import { toListParams, useCatalogState, type CatalogState } from "@/features/products/useCatalogState";
import { prioritizeCategories } from "@/lib/category-priority";
import { cn, formatUsd } from "@/lib/utils";
import { ApiError, errorMessage } from "@/services/api/errors";
import type { CatalogSort } from "@/types/enums";

interface Chip {
  key: string;
  label: string;
  clear: Partial<CatalogState>;
}

function SortSelect({ id, value, onChange, className }: { id: string; value: CatalogSort; onChange: (value: CatalogSort) => void; className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <label className="sr-only" htmlFor={id}>Trier par</label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as CatalogSort)}
        className="h-11 w-full appearance-none rounded-full border border-line bg-white pl-4 pr-10 text-sm font-medium outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
    </div>
  );
}

export function CatalogView() {
  const { state, update, reset } = useCatalogState();
  const params = useMemo(() => toListParams(state), [state]);
  const { data, error, isLoading, isPlaceholderData, refetch } = useProducts(params);
  const { data: categories } = useCategories();
  const { data: subCategories } = useSubCategories();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const suggestions = useMemo(() => prioritizeCategories(categories ?? []).slice(0, 4).map((x) => x.item), [categories]);

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
    if (isLoading) return <ProductGridSkeleton count={CATALOG_PAGE_SIZE} className={CATALOG_GRID_CLASS} />;

    if (error) {
      const invalid = error instanceof ApiError && error.kind === "validation";
      return invalid ? (
        <EmptyState icon={SlidersHorizontal} title="Filtres invalides" message={errorMessage(error)} actionLabel="Réinitialiser les filtres" onAction={reset} />
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
          icon={SearchX}
          title="Aucun produit trouvé"
          message="Essayez d'autres mots-clés ou retirez certains filtres."
          actionLabel={chips.length > 0 ? "Réinitialiser les filtres" : undefined}
          onAction={chips.length > 0 ? reset : undefined}
        >
          {suggestions.length > 0 && (
            <div className="mt-4 w-full">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Parcourir une catégorie</p>
              <ul className="mt-2 flex flex-wrap justify-center gap-2">
                {suggestions.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/products?categoryId=${encodeURIComponent(c.id)}`}
                      className="inline-flex min-h-11 items-center rounded-full bg-brand-50 px-4 text-sm font-medium text-brand-700 hover:bg-brand-100"
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </EmptyState>
      );
    }

    return (
      <>
        <div className={cn(CATALOG_GRID_CLASS, isPlaceholderData && "opacity-60", "motion-safe:transition-opacity")} aria-busy={isPlaceholderData}>
          {data.items.map((product, i) => (
            <ProductCard key={product.id} product={product} priority={i < 4} />
          ))}
        </div>
        <Pagination page={state.page} totalPages={totalPages} onChange={changePage} />
      </>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 md:py-6">
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">{title}</h1>
          {total !== undefined && (
            <p className="mt-0.5 text-sm text-muted" aria-live="polite">
              {total} produit{total > 1 ? "s" : ""}
            </p>
          )}
        </div>
        <SortSelect id="catalog-sort" value={sortValue} onChange={(sort) => update({ sort })} className="hidden w-56 shrink-0 lg:block" />
      </div>

      <CategoryRail state={state} onChange={update} />

      {/* Mobile : barre collante sous le header, toujours à portée du pouce */}
      <div className="glass-bar sticky top-[var(--header-h)] z-30 -mx-4 mt-3 flex items-center gap-2 px-4 py-2 lg:hidden">
        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-line bg-white text-sm font-semibold motion-safe:active:scale-[0.99]"
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden />
          Filtres
          {filterCount > 0 && <span className="rounded-full bg-brand-500 px-1.5 text-xs font-bold text-white">{filterCount}</span>}
        </button>
        <SortSelect id="catalog-sort-mobile" value={sortValue} onChange={(sort) => update({ sort })} className="flex-1" />
      </div>

      {chips.length > 0 && (
        <ul className="mt-3 flex flex-wrap items-center gap-2" aria-label="Filtres actifs">
          {chips.map((chip) => (
            <li key={chip.key}>
              <button
                type="button"
                onClick={() => update(chip.clear)}
                aria-label={`Retirer le filtre ${chip.label}`}
                className="flex min-h-9 items-center gap-1.5 rounded-full bg-brand-50 px-3.5 text-sm font-medium text-brand-700 motion-safe:transition-colors hover:bg-brand-100"
              >
                {chip.label}
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            </li>
          ))}
          <li>
            <button type="button" onClick={reset} className="min-h-9 px-2 text-sm font-medium text-muted underline">
              Tout effacer
            </button>
          </li>
        </ul>
      )}

      <div className="mt-4 grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* Desktop : la sidebar reste visible pendant le défilement */}
        <aside className="hidden lg:block" aria-label="Filtres">
          <div className="sticky top-[calc(var(--header-h)+1rem)] max-h-[calc(100dvh-var(--header-h)-2rem)] overflow-y-auto rounded-2xl border border-line bg-white p-4">
            <FilterPanel state={state} onChange={update} />
          </div>
        </aside>
        <div>{renderResults()}</div>
      </div>

      <FilterDrawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        onReset={reset}
        canReset={chips.length > 0}
        resultsLabel={total !== undefined ? `Voir ${total} produit${total > 1 ? "s" : ""}` : "Voir les produits"}
      >
        <FilterPanel state={state} onChange={update} />
      </FilterDrawer>
    </div>
  );
}