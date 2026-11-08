"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ArrowRight, ArrowUpRight, Loader2, Search, X, type LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useId, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useCategories } from "@/features/categories/hooks";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { iconForCategory } from "@/lib/category-icons";
import { prioritizeCategories } from "@/lib/category-priority";
import { cn, formatUsd, normalizeText, resolveImageUrl } from "@/lib/utils";
import { listProducts } from "@/services/api/catalog";

type Group = "query" | "category" | "product";

interface Option {
  key: string;
  group: Group;
  label: string;
  hint?: string;
  image?: string | null;
  icon?: LucideIcon;
  href: string;
}

const DEFAULT_HINT = "Rechercher un produit…";

function headingFor(option: Option, previous: Option | undefined, searching: boolean): string | null {
  if (option.group === "query" || option.group === previous?.group) return null;
  if (option.group === "category") return searching ? "Catégories" : "Catégories populaires";
  return "Produits";
}

export function SearchBox() {
  const router = useRouter();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [hintIndex, setHintIndex] = useState(0);

  const term = query.trim();
  const debounced = useDebouncedValue(term, 300);
  const enabled = debounced.length >= 2;

  const { data, isFetching } = useQuery({
    queryKey: ["suggest", debounced],
    queryFn: ({ signal }) => listProducts({ q: debounced, limit: 6 }, signal),
    enabled,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });
  const { data: categories } = useCategories();

  const popular = useMemo(() => prioritizeCategories(categories ?? []).slice(0, 6).map((x) => x.item), [categories]);

  const matchedCategories = useMemo(() => {
    if (!enabled || !categories) return [];
    const needle = normalizeText(debounced);
    return categories.filter((c) => normalizeText(c.name).includes(needle)).slice(0, 2);
  }, [enabled, categories, debounced]);

  const options = useMemo<Option[]>(() => {
    // Champ vide : on propose les catégories les plus utiles plutôt qu'un menu vide.
    if (term.length === 0) {
      return popular.map(
        (c): Option => ({
          key: `c-${c.id}`,
          group: "category",
          label: c.name,
          icon: iconForCategory(c.name),
          href: `/products?categoryId=${encodeURIComponent(c.id)}`,
        }),
      );
    }
    if (term.length < 2) return [];

    const list: Option[] = [{ key: "all", group: "query", label: `Rechercher « ${term} »`, icon: Search, href: `/products?q=${encodeURIComponent(term)}` }];
    for (const c of matchedCategories) {
      list.push({ key: `c-${c.id}`, group: "category", label: c.name, icon: iconForCategory(c.name), href: `/products?categoryId=${encodeURIComponent(c.id)}` });
    }
    for (const p of data?.items ?? []) {
      list.push({
        key: `p-${p.id}`,
        group: "product",
        label: p.name,
        hint: formatUsd(p.price),
        image: resolveImageUrl(p.images[0]?.imageUrl),
        href: `/products/${encodeURIComponent(p.id)}`,
      });
    }
    return list;
  }, [term, popular, matchedCategories, data]);

  const showList = open && options.length > 0;

  // Le placeholder alterne entre une invite générale et des catégories réelles (jamais de produits inventés).
  const hints = useMemo(() => [DEFAULT_HINT, ...popular.slice(0, 3).map((c) => `Essayez « ${c.name} »`)], [popular]);
  useEffect(() => {
    if (query || open || hints.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setHintIndex((i) => (i + 1) % hints.length), 3000);
    return () => clearInterval(timer);
  }, [query, open, hints.length]);
  const placeholder = hints[hintIndex % hints.length] ?? DEFAULT_HINT;

  // Raccourci « / » pour placer le curseur dans la recherche (hors champs de saisie).
  useEffect(() => {
    function onKey(event: globalThis.KeyboardEvent) {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
      event.preventDefault();
      inputRef.current?.focus();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function go(href: string) {
    setOpen(false);
    setActive(-1);
    router.push(href);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const chosen = active >= 0 ? options[active] : undefined;
    go(chosen?.href ?? (term ? `/products?q=${encodeURIComponent(term)}` : "/products"));
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!showList) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => (i + 1) % options.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => (i <= 0 ? options.length - 1 : i - 1));
    } else if (event.key === "Escape") {
      setOpen(false);
      setActive(-1);
    }
  }

  const searching = term.length > 0;

  return (
    <div
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <form role="search" onSubmit={onSubmit}>
        <label htmlFor="site-search" className="sr-only">
          Rechercher un produit
        </label>

        {/* Liseré fin au repos ; au focus il devient un dégradé de marque (le dégradé a ici une fonction : signaler le focus). */}
        <div className="rounded-full bg-ink/10 p-[1.5px] shadow-[0_6px_20px_-10px_rgb(15_17_21/0.35)] motion-safe:transition focus-within:bg-linear-to-r focus-within:from-brand-300 focus-within:via-brand-500 focus-within:to-brand-700 focus-within:shadow-[0_10px_32px_-10px_rgb(61_100_175/0.55)]">
          <div className="flex h-11 items-center gap-2 rounded-full bg-white pl-3.5 pr-1 md:h-12 md:pl-4">
            <Search className="h-[18px] w-[18px] shrink-0 text-muted" aria-hidden />

            <input
              ref={inputRef}
              id="site-search"
              type="search"
              role="combobox"
              aria-expanded={showList}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
              autoComplete="off"
              value={query}
              maxLength={100}
              placeholder={placeholder}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(-1);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={onKeyDown}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted/80 [&::-webkit-search-cancel-button]:hidden"
            />

            {enabled && isFetching && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-brand-500" aria-hidden />}

            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setActive(-1);
                  inputRef.current?.focus();
                }}
                aria-label="Effacer la recherche"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted hover:bg-surface hover:text-ink"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            ) : (
              <kbd aria-hidden className="hidden h-6 min-w-6 shrink-0 items-center justify-center rounded-md border border-line bg-surface px-1.5 font-sans text-xs font-semibold text-muted md:inline-flex">
                /
              </kbd>
            )}

            <button
              type="submit"
              aria-label="Lancer la recherche"
              className="flex h-9 w-9 shrink-0 items-center justify-center gap-1.5 rounded-full bg-brand-500 text-sm font-semibold text-white motion-safe:transition-colors hover:bg-brand-600 motion-safe:active:scale-95 md:h-10 md:w-auto md:px-5"
            >
              <span className="hidden md:inline">Rechercher</span>
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      </form>

      {showList && (
        <div className="glass-strong absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-3xl">
          <ul
            id={listId}
            role="listbox"
            aria-label="Suggestions"
            onMouseDown={(e) => e.preventDefault()}
            className="max-h-[70dvh] overflow-y-auto p-2"
          >
            {options.map((option, i) => {
              const heading = headingFor(option, options[i - 1], searching);
              const OptionIcon = option.icon;
              return (
                <Fragment key={option.key}>
                  {heading && (
                    <li role="presentation" className="px-3 pb-1 pt-3 text-[11px] font-bold uppercase tracking-wider text-muted first:pt-1">
                      {heading}
                    </li>
                  )}
                  <li id={`${listId}-${i}`} role="option" aria-selected={i === active}>
                    <Link
                      href={option.href}
                      tabIndex={-1}
                      onClick={() => {
                        setOpen(false);
                        setActive(-1);
                      }}
                      className={cn("flex items-center gap-3 rounded-2xl px-2.5 py-2 text-sm motion-safe:transition-colors", i === active ? "bg-brand-50" : "hover:bg-surface")}
                    >
                      {option.image ? (
                        <Image src={option.image} alt="" width={48} height={48} unoptimized className="h-12 w-12 shrink-0 rounded-xl object-cover" />
                      ) : option.group === "product" ? (
                        <span aria-hidden className="h-12 w-12 shrink-0 rounded-xl bg-surface" />
                      ) : (
                        OptionIcon && (
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                            <OptionIcon className="h-5 w-5" aria-hidden />
                          </span>
                        )
                      )}
                      <span className="min-w-0 flex-1 truncate font-medium">{option.label}</span>
                      {option.hint ? (
                        <span className="shrink-0 font-bold tabular-nums text-brand-600">{option.hint}</span>
                      ) : (
                        <ArrowUpRight className="h-4 w-4 shrink-0 text-muted" aria-hidden />
                      )}
                    </Link>
                  </li>
                </Fragment>
              );
            })}

            {enabled && isFetching && (
              <li role="presentation" className="px-3 py-2 text-xs text-muted">
                Recherche en cours…
              </li>
            )}
            {enabled && !isFetching && data && data.items.length === 0 && matchedCategories.length === 0 && (
              <li role="presentation" className="px-3 py-2 text-xs text-muted">
                Aucun produit trouvé.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}