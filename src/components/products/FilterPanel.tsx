"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useCategories, useSubCategories } from "@/features/categories/hooks";
import type { CatalogState } from "@/features/products/useCatalogState";
import { cn } from "@/lib/utils";

interface Props {
  state: CatalogState;
  onChange: (patch: Partial<CatalogState>) => void;
}

const optionClass = (active: boolean) =>
  cn("block w-full rounded-lg px-3 py-2 text-left text-sm", active ? "bg-brand-50 font-semibold text-brand-700" : "hover:bg-surface");

function PriceFilter({
  initialMin,
  initialMax,
  onApply,
}: {
  initialMin: string;
  initialMax: string;
  onApply: (min: string, max: string) => void;
}) {
  const [min, setMin] = useState(initialMin);
  const [max, setMax] = useState(initialMax);
  const [error, setError] = useState<string | null>(null);

  function submit(event: FormEvent) {
    event.preventDefault();
    const a = min === "" ? null : Number(min);
    const b = max === "" ? null : Number(max);
    if ((a !== null && (!Number.isFinite(a) || a < 0)) || (b !== null && (!Number.isFinite(b) || b < 0))) {
      setError("Saisissez des montants valides.");
      return;
    }
    if (a !== null && b !== null && a > b) {
      setError("Le minimum dépasse le maximum.");
      return;
    }
    setError(null);
    onApply(min, max);
  }

  const inputClass = "h-10 w-full rounded-lg border border-line px-3 text-sm outline-none focus:border-brand-500";

  return (
    <form onSubmit={submit} className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="sr-only" htmlFor="price-min">Prix minimum en dollars</label>
        <input id="price-min" type="number" inputMode="decimal" min={0} step="any" placeholder="Min" value={min} onChange={(e) => setMin(e.target.value)} className={inputClass} />
        <span className="text-muted" aria-hidden>–</span>
        <label className="sr-only" htmlFor="price-max">Prix maximum en dollars</label>
        <input id="price-max" type="number" inputMode="decimal" min={0} step="any" placeholder="Max" value={max} onChange={(e) => setMax(e.target.value)} className={inputClass} />
      </div>
      {error && <p role="alert" className="text-xs text-sale">{error}</p>}
      <button type="submit" className="h-10 w-full rounded-lg border border-brand-500 text-sm font-semibold text-brand-600 hover:bg-brand-50">
        Appliquer (en $)
      </button>
    </form>
  );
}

export function FilterPanel({ state, onChange }: Props) {
  const { data: categories } = useCategories();
  const { data: allSubCategories } = useSubCategories();

  const subCategories = useMemo(
    () => (allSubCategories ?? []).filter((s) => s.isActive && s.categoryId === state.categoryId),
    [allSubCategories, state.categoryId],
  );

  return (
    <div className="space-y-6">
      <section aria-labelledby="filter-categories">
        <h2 id="filter-categories" className="mb-2 text-sm font-bold">Catégories</h2>
        <ul className="space-y-0.5">
          <li>
            <button type="button" onClick={() => onChange({ categoryId: "", subCategoryId: "" })} className={optionClass(!state.categoryId)}>
              Toutes les catégories
            </button>
          </li>
          {(categories ?? []).map((category) => (
            <li key={category.id}>
              <button
                type="button"
                onClick={() => onChange({ categoryId: category.id, subCategoryId: "" })}
                aria-pressed={state.categoryId === category.id}
                className={optionClass(state.categoryId === category.id)}
              >
                {category.name}
              </button>
              {state.categoryId === category.id && subCategories.length > 0 && (
                <ul className="ml-3 mt-0.5 space-y-0.5 border-l border-line pl-2">
                  {subCategories.map((sub) => (
                    <li key={sub.id}>
                      <button
                        type="button"
                        onClick={() => onChange({ subCategoryId: state.subCategoryId === sub.id ? "" : sub.id })}
                        aria-pressed={state.subCategoryId === sub.id}
                        className={optionClass(state.subCategoryId === sub.id)}
                      >
                        {sub.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="filter-price">
        <h2 id="filter-price" className="mb-2 text-sm font-bold">Prix</h2>
        <PriceFilter
          key={`${state.minPrice}-${state.maxPrice}`}
          initialMin={state.minPrice}
          initialMax={state.maxPrice}
          onApply={(minPrice, maxPrice) => onChange({ minPrice, maxPrice })}
        />
      </section>
    </div>
  );
}