"use client";

import Link from "next/link";
import { createElement } from "react";
import { useCategories } from "@/features/categories/hooks";
import { iconForCategory } from "@/lib/category-icons";

export function CategoryShortcuts() {
  const { data } = useCategories();
  if (!data || data.length === 0) return null;

  return (
    <section aria-label="Catégories populaires" className="mx-auto max-w-7xl px-4 pt-6">
      <ul className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] md:gap-6">
        {data.map((category) => (
          <li key={category.id} className="shrink-0">
            <Link
              href={`/products?categoryId=${encodeURIComponent(category.id)}`}
              className="group flex w-20 flex-col items-center gap-2 text-center md:w-24"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-500 group-hover:text-white md:h-20 md:w-20">
                {createElement(iconForCategory(category.name), { className: "h-7 w-7 md:h-8 md:w-8", "aria-hidden": true })}
              </span>
              <span className="line-clamp-2 text-xs font-medium md:text-sm">{category.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}