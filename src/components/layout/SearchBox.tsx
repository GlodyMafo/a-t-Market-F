"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useMemo, useState, type FormEvent, type KeyboardEvent } from "react";
import { Search } from "lucide-react";
import { useCategories } from "@/features/categories/hooks";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { cn, formatUsd, normalizeText, resolveImageUrl } from "@/lib/utils";
import { listProducts } from "@/services/api/catalog";

interface Option {
  key: string;
  label: string;
  hint?: string;
  image?: string | null;
  href: string;
}

export function SearchBox() {
  const router = useRouter();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

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

  const matchedCategories = useMemo(() => {
    if (!enabled || !categories) return [];
    const needle = normalizeText(debounced);
    return categories.filter((c) => normalizeText(c.name).includes(needle)).slice(0, 2);
  }, [enabled, categories, debounced]);

  const options = useMemo<Option[]>(() => {
    if (term.length < 2) return [];
    const list: Option[] = [{ key: "all", label: `Rechercher « ${term} »`, href: `/products?q=${encodeURIComponent(term)}` }];
    for (const c of matchedCategories) {
      list.push({ key: `c-${c.id}`, label: c.name, hint: "Catégorie", href: `/products?categoryId=${encodeURIComponent(c.id)}` });
    }
    for (const p of data?.items ?? []) {
      list.push({
        key: `p-${p.id}`,
        label: p.name,
        hint: formatUsd(p.price),
        image: resolveImageUrl(p.images[0]?.imageUrl),
        href: `/products/${encodeURIComponent(p.id)}`,
      });
    }
    return list;
  }, [term, matchedCategories, data]);

  const showList = open && options.length > 0;

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
        <div className="flex h-11 overflow-hidden rounded-full border-2 border-ink/80 focus-within:border-brand-500">
          <input
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
            placeholder="Rechercher un produit"
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(-1);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            className="min-w-0 flex-1 bg-transparent px-4 text-sm outline-none"
          />
          <button type="submit" aria-label="Lancer la recherche" className="flex w-14 items-center justify-center bg-brand-500 text-white hover:bg-brand-600">
            <Search className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </form>

      {showList && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Suggestions"
          onMouseDown={(e) => e.preventDefault()}
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[70dvh] overflow-y-auto rounded-xl border border-line bg-white py-1 shadow-lg"
        >
          {options.map((option, i) => (
            <li key={option.key} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
              <Link
                href={option.href}
                tabIndex={-1}
                onClick={() => {
                  setOpen(false);
                  setActive(-1);
                }}
                className={cn("flex items-center gap-3 px-3 py-2 text-sm", i === active ? "bg-brand-50" : "hover:bg-surface")}
              >
                {option.image ? (
                  <Image src={option.image} alt="" width={40} height={40} unoptimized className="h-10 w-10 shrink-0 rounded object-cover" />
                ) : option.key === "all" ? (
                  <Search className="h-5 w-5 shrink-0 text-muted" aria-hidden />
                ) : null}
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
                {option.hint && <span className="shrink-0 text-xs font-semibold text-muted">{option.hint}</span>}
              </Link>
            </li>
          ))}
          {isFetching && <li className="px-3 py-2 text-xs text-muted">Recherche en cours…</li>}
          {!isFetching && data && data.items.length === 0 && matchedCategories.length === 0 && (
            <li className="px-3 py-2 text-xs text-muted">Aucun produit trouvé.</li>
          )}
        </ul>
      )}
    </div>
  );
}