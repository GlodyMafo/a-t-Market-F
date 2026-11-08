"use client";

import { createElement, useEffect, useMemo, useRef } from "react";
import { useCategories, useSubCategories } from "@/features/categories/hooks";
import type { CatalogState } from "@/features/products/useCatalogState";
import { iconForCategory } from "@/lib/category-icons";
import { prioritizeCategories } from "@/lib/category-priority";
import { cn } from "@/lib/utils";

interface Props {
  state: CatalogState;
  onChange: (patch: Partial<CatalogState>) => void;
}

const chip = (active: boolean) =>
  cn(
    "flex min-h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 text-sm font-medium motion-safe:transition-colors motion-safe:active:scale-95",
    active ? "border-brand-500 bg-brand-500 text-white" : "border-line bg-white hover:border-brand-200",
  );

const subChip = (active: boolean) =>
  cn(
    "flex min-h-10 shrink-0 items-center whitespace-nowrap rounded-full px-3.5 text-sm motion-safe:transition-colors motion-safe:active:scale-95",
    active ? "bg-brand-100 font-semibold text-brand-800" : "bg-brand-50 font-medium text-brand-700 hover:bg-brand-100",
  );

/** Mobile uniquement : accès direct aux catégories (sur desktop, la sidebar remplit ce rôle). */
export function CategoryRail({ state, onChange }: Props) {
  const { data: categories } = useCategories();
  const { data: allSubCategories } = useSubCategories();
  const railRef = useRef<HTMLUListElement>(null);

  const items = useMemo(() => prioritizeCategories(categories ?? []), [categories]);
  const subCategories = useMemo(
    () => (allSubCategories ?? []).filter((s) => s.isActive && s.categoryId === state.categoryId),
    [allSubCategories, state.categoryId],
  );

  // Garde la catégorie active visible dans le rail.
  useEffect(() => {
    const active = railRef.current?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!active) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    active.scrollIntoView({ inline: "center", block: "nearest", behavior: reduce ? "auto" : "smooth" });
  }, [state.categoryId, items.length]);

  if (items.length === 0) return null;

  return (
    <nav aria-label="Catégories" className="mt-3 lg:hidden">
      <ul
        ref={railRef}
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [mask-image:linear-gradient(to_right,#000_calc(100%-28px),transparent)] [scrollbar-width:none]"
      >
        <li className="shrink-0">
          <button type="button" aria-pressed={!state.categoryId} onClick={() => onChange({ categoryId: "", subCategoryId: "" })} className={chip(!state.categoryId)}>
            Tout
          </button>
        </li>
        {items.map(({ item: category, featured }) => {
          const active = state.categoryId === category.id;
          return (
            <li key={category.id} className="shrink-0">
              <button
                type="button"
                aria-pressed={active}
                onClick={() => onChange({ categoryId: category.id, subCategoryId: "" })}
                className={chip(active)}
              >
                {featured && createElement(iconForCategory(category.name), { className: "h-4 w-4", "aria-hidden": true })}
                {category.name}
              </button>
            </li>
          );
        })}
      </ul>

      {subCategories.length > 0 && (
        <ul aria-label="Sous-catégories" className="-mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
          {subCategories.map((sub) => {
            const active = state.subCategoryId === sub.id;
            return (
              <li key={sub.id} className="shrink-0">
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => onChange({ subCategoryId: active ? "" : sub.id })}
                  className={subChip(active)}
                >
                  {sub.name}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </nav>
  );
}