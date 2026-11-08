"use client";

import { ChevronLeft, FileText, LogOut, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLogout } from "@/features/authentication/useLogout";
import { cn } from "@/lib/utils";

const items = [
  { href: "/account", label: "Mon profil", icon: User },
  { href: "/account/quotes", label: "Mes devis", icon: FileText },
] as const;

export function AccountNav() {
  const pathname = usePathname();
  const logout = useLogout();
  const link = "flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm motion-safe:transition-colors";

  return (
    <>
      {/* Mobile : retour vers le menu du compte depuis une sous-page */}
      {pathname !== "/account" && (
        <Link
          href="/account"
          className="inline-flex min-h-11 w-fit items-center gap-1 justify-self-start rounded-full bg-brand-50 pl-3 pr-4 text-sm font-semibold text-brand-700 motion-safe:active:scale-95 md:hidden"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden /> Mon compte
        </Link>
      )}

      {/* Desktop : carte collante */}
      <nav aria-label="Mon compte" className="hidden md:sticky md:top-[calc(var(--header-h)+1rem)] md:block">
        <ul className="rounded-2xl border border-line bg-white p-2">
          {items.map(({ href, label, icon: Icon }) => {
            const active = href === "/account" ? pathname === href : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    link,
                    active ? "bg-brand-50 font-semibold text-brand-700 shadow-[inset_3px_0_0_var(--color-brand-500)]" : "hover:bg-surface",
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden /> {label}
                </Link>
              </li>
            );
          })}
          <li className="mt-1 border-t border-line pt-1">
            <button type="button" onClick={logout} className={cn(link, "text-muted hover:bg-surface hover:text-sale")}>
              <LogOut className="h-4 w-4" aria-hidden /> Se déconnecter
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}