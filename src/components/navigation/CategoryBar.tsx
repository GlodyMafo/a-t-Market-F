"use client";

import Link from "next/link";
import { useCategories } from "@/features/categories/hooks";

const linkClass = "block whitespace-nowrap px-3 py-3 hover:text-brand-600";

export function CategoryBar() {
  const { data } = useCategories();
  if (!data || data.length === 0) return null;

  return (
    <nav aria-label="Catégories" className="border-b border-line bg-white">
      <ul className="mx-auto flex max-w-7xl overflow-x-auto px-2 text-sm font-medium [scrollbar-width:none]">
        <li className="shrink-0">
          <Link href="/products?sort=newest" className={`${linkClass} font-bold text-sale`}>
            Nouveautés
          </Link>
        </li>
        <li className="shrink-0">
          <Link href="/import" className={`${linkClass} font-bold text-brand-600`}>
            Importer
          </Link>
        </li>
        {data.map((category) => (
          <li key={category.id} className="shrink-0">
            <Link href={`/products?categoryId=${encodeURIComponent(category.id)}`} className={linkClass}>
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}