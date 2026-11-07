"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, Home, LayoutGrid, ShoppingCart, User } from "lucide-react";
import { useSession } from "@/features/authentication/session.store";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();
  const authenticated = useSession((s) => s.status === "authenticated");

  const items = [
    { href: "/", label: "Accueil", icon: Home, match: "/" },
    { href: "/products", label: "Catégories", icon: LayoutGrid, match: "/products" },
    { href: "/import", label: "Importer", icon: Globe, match: "/import" },
    { href: "/cart", label: "Panier", icon: ShoppingCart, match: "/cart" },
    { href: authenticated ? "/account" : "/login", label: authenticated ? "Compte" : "Connexion", icon: User, match: "/account" },
  ] as const;

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="grid grid-cols-5">
        {items.map(({ href, label, icon: Icon, match }) => {
          const active = match === "/" ? pathname === "/" : pathname.startsWith(match);
          return (
            <li key={label}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn("flex flex-col items-center gap-0.5 py-2 text-[11px]", active ? "font-semibold text-brand-600" : "text-muted")}
              >
                <Icon className="h-5 w-5" aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}