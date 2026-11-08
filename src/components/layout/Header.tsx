"use client";

import Link from "next/link";
import { Globe, ShoppingCart, User } from "lucide-react";
import { SearchBox } from "@/components/layout/SearchBox";
import { SupportMenu } from "@/components/layout/SupportMenu";
import { Logo } from "@/components/ui/Logo";
import { useCartCount } from "@/features/cart/useCartCount";
import { useSession } from "@/features/authentication/session.store";
import { cn } from "@/lib/utils";

export function Header() {
  const cartCount = useCartCount();
  const status = useSession((s) => s.status);
  const authenticated = status === "authenticated";

  return (
    <header className="glass-bar sticky top-0 z-40">
      {/* Mobile : logo + recherche + service client. Compte et panier sont dans la barre du bas. */}
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-2 md:gap-4 md:py-3">
        <Logo compact />

        <div className="min-w-0 flex-1 md:max-w-2xl">
          <SearchBox />
        </div>

        <SupportMenu className="md:hidden" />

        <nav aria-label="Compte et panier" className="ml-auto hidden items-center gap-1 md:flex">
          <Link href="/import" className="mr-2 flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-brand-600 hover:bg-brand-50">
            <Globe className="h-4 w-4" aria-hidden /> Importer
          </Link>

          <Link
            href={authenticated ? "/account" : "/login"}
            aria-label={authenticated ? "Mon compte" : "Se connecter"}
            className="rounded-full p-2.5 hover:bg-surface"
          >
            <User className={cn("h-5 w-5", authenticated && "text-brand-500")} aria-hidden />
          </Link>

          <SupportMenu />

          <Link href="/cart" aria-label="Panier" className="relative rounded-full p-2.5 hover:bg-surface">
            <ShoppingCart className="h-5 w-5" aria-hidden />
            {cartCount > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-sale px-1 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}