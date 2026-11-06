"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Globe, Search, ShoppingCart, User } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { useCartCount } from "@/features/cart/useCartCount";

export function Header() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const cartCount = useCartCount();

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const q = query.trim();
    router.push(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2 md:flex-nowrap md:py-3">
        <div className="order-1">
          <Logo />
        </div>

        <nav aria-label="Compte et panier" className="order-2 ml-auto flex items-center gap-1 md:order-3">
          <Link href="/import" className="mr-2 hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-brand-600 hover:bg-brand-50 md:flex">
            <Globe className="h-4 w-4" aria-hidden /> Importer
          </Link>
          <Link href="/login" aria-label="Mon compte" className="rounded-full p-2.5 hover:bg-surface">
            <User className="h-5 w-5" aria-hidden />
          </Link>
          <Link href="/cart" aria-label="Panier" className="relative rounded-full p-2.5 hover:bg-surface">
            <ShoppingCart className="h-5 w-5" aria-hidden />
            {cartCount > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-sale px-1 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>
        </nav>

        <form role="search" onSubmit={onSubmit} className="order-3 w-full md:order-2 md:max-w-2xl md:flex-1">
          <label htmlFor="site-search" className="sr-only">
            Rechercher un produit
          </label>
          <div className="flex h-11 overflow-hidden rounded-full border-2 border-ink/80 focus-within:border-brand-500">
            <input
              id="site-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              maxLength={100}
              placeholder="Rechercher un produit"
              className="min-w-0 flex-1 bg-transparent px-4 text-sm outline-none"
            />
            <button type="submit" aria-label="Lancer la recherche" className="flex w-14 items-center justify-center bg-brand-500 text-white hover:bg-brand-600">
              <Search className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </form>
      </div>
    </header>
  );
}