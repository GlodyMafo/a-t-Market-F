"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, Globe, Sparkles } from "lucide-react";
import { createElement, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCategories } from "@/features/categories/hooks";
import { iconForCategory } from "@/lib/category-icons";
import { prioritizeCategories } from "@/lib/category-priority";
import { cn } from "@/lib/utils";

const pill = "flex min-h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-sm font-semibold motion-safe:transition-colors";

export function CategoryBar() {
  const { data } = useCategories();
  const listRef = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ left: false, right: false });
  // L'ordre reste celui de l'utilité commerciale (vêtements en premier), mais toutes les catégories ont le même style.
  const items = useMemo(() => prioritizeCategories(data ?? []), [data]);

  const update = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    const left = el.scrollLeft > 4;
    const right = el.scrollLeft + el.clientWidth < el.scrollWidth - 4;
    setEdges((prev) => (prev.left === left && prev.right === right ? prev : { left, right }));
  }, []);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [update, items.length]);

  function scrollByPage(direction: 1 | -1) {
    const el = listRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: direction * el.clientWidth * 0.75, behavior: reduce ? "auto" : "smooth" });
  }

  if (items.length === 0) return null;

  return (
    <nav aria-label="Catégories" className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-7xl items-center gap-1 px-2 py-1">
        {/* Fixes */}
        <ul className="flex shrink-0 items-center gap-1.5 pl-1">
          <li>
            <Link href="/products?sort=newest" className={cn(pill, "bg-brand-50 text-brand-700 hover:bg-brand-100")}>
              <Sparkles className="h-4 w-4" aria-hidden /> Nouveautés
            </Link>
          </li>
          <li>
            <Link href="/import" className={cn(pill, "bg-brand-500 text-white hover:bg-brand-600")}>
              <Globe className="h-4 w-4" aria-hidden /> Importer
            </Link>
          </li>
        </ul>
        <span aria-hidden className="mx-1 h-5 w-px shrink-0 bg-line" />

        {/* Défilantes : même style pour toutes les catégories */}
        <div className="relative min-w-0 flex-1">
          <ul ref={listRef} className="flex items-center overflow-x-auto [scrollbar-width:none]">
            {items.map(({ item: category }) => (
              <li key={category.id} className="shrink-0">
                <Link
                  href={`/products?categoryId=${encodeURIComponent(category.id)}`}
                  className="flex min-h-11 items-center gap-1.5 whitespace-nowrap px-3 text-sm font-medium text-ink hover:text-brand-600"
                >
                  {/* Pour que l'icône prenne la même couleur que le texte, remplace "text-brand-500" par "text-current" */}
                  {createElement(iconForCategory(category.name), { className: "h-4 w-4 text-brand-500", "aria-hidden": true })}
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>

          {edges.left && (
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex w-14 items-center bg-linear-to-r from-white from-40% to-transparent">
              <button
                type="button"
                onClick={() => scrollByPage(-1)}
                aria-label="Catégories précédentes"
                className="glass pointer-events-auto hidden h-8 w-8 items-center justify-center rounded-full md:flex"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden />
              </button>
            </div>
          )}
          {edges.right && (
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 flex w-14 items-center justify-end bg-linear-to-l from-white from-40% to-transparent">
              <button
                type="button"
                onClick={() => scrollByPage(1)}
                aria-label="Catégories suivantes"
                className="glass pointer-events-auto hidden h-8 w-8 items-center justify-center rounded-full md:flex"
              >
                <ChevronRight className="h-4 w-4" aria-hidden />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}