"use client";

import Link from "next/link";
import { createElement, useMemo } from "react";
import { useCategories } from "@/features/categories/hooks";
import { iconForCategory } from "@/lib/category-icons";
import { prioritizeCategories } from "@/lib/category-priority";

/** Mobile uniquement : sur desktop, la barre de catégories remplit ce rôle. */
export function CategoryShortcuts() {
  const { data } = useCategories();
  const items = useMemo(() => prioritizeCategories(data ?? []).slice(0, 8), [data]);
  if (items.length === 0) return null;

  return (
    <section aria-label="Catégories populaires" className="mx-auto max-w-7xl px-4 pt-6 md:hidden">
      <ul className="flex snap-x gap-3 overflow-x-auto pb-2 [scrollbar-width:none]">
        {items.map(({ item: category }) => (
          <li key={category.id} className="shrink-0 snap-start">
            <Link
              href={`/products?categoryId=${encodeURIComponent(category.id)}`}
              className="group flex w-[4.75rem] flex-col items-center gap-2 text-center motion-safe:transition-transform motion-safe:active:scale-95"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-[1.35rem] bg-brand-50 text-brand-600 ring-1 ring-brand-100 motion-safe:transition-colors group-hover:bg-brand-500 group-hover:text-white">
                {createElement(iconForCategory(category.name), { className: "h-7 w-7", "aria-hidden": true })}
              </span>
              <span className="line-clamp-2 text-xs font-medium">{category.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}