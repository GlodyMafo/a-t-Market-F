"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, Home, LayoutGrid, ShoppingCart, User } from "lucide-react";
import { useCartCount } from "@/features/cart/useCartCount";
import { useSession } from "@/features/authentication/session.store";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();
  const authenticated = useSession((s) => s.status === "authenticated");
  const cartCount = useCartCount();

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
      className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 md:hidden"
    >
      <ul className="glass-strong grid grid-cols-5 gap-0.5 rounded-[1.75rem] p-1.5">
        {items.map(({ href, label, icon: Icon, match }) => {
          const active = match === "/" ? pathname === "/" : pathname.startsWith(match);
          const badge = href === "/cart" ? cartCount : 0;
          return (
            <li key={label}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-[1.25rem] text-[11px] motion-safe:transition-colors motion-safe:active:scale-95",
                  active ? "bg-brand-500/10 font-semibold text-brand-600" : "text-muted",
                )}
              >
                <span className="relative">
                  <Icon className="h-5 w-5" aria-hidden />
                  {badge > 0 && (
                    <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-sale px-1 text-[10px] font-bold text-white">
                      {badge}
                    </span>
                  )}
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}