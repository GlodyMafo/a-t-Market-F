"use client";

import Link from "next/link";
import { Globe, ShoppingCart, User } from "lucide-react";
import { SearchBox } from "@/components/layout/SearchBox";
import { Logo } from "@/components/ui/Logo";
import { useCartCount } from "@/features/cart/useCartCount";
import { useSession } from "@/features/authentication/session.store";
import { cn } from "@/lib/utils";

export function Header() {
  const cartCount = useCartCount();
  const status = useSession((s) => s.status);
  const authenticated = status === "authenticated";

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


          <Link
            href={authenticated ? "/account" : "/login"}
            aria-label={authenticated ? "Mon compte" : "Se connecter"}
            className="rounded-full p-2.5 hover:bg-surface"
          >
            <User className={cn("h-5 w-5", authenticated && "text-brand-500")} aria-hidden />
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

        <div className="order-3 w-full md:order-2 md:max-w-2xl md:flex-1">
          <SearchBox />
        </div>
      </div>
    </header>
  );
}