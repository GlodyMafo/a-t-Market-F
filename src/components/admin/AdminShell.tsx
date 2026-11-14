
"use client";

import {
  Bell,
  FileCheck2,
  LayoutDashboard,
  LogOut,
  ReceiptText,
  ShoppingBag,
  Store,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { statusButton } from "@/components/feedback/StatusPanel";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { Logo } from "@/components/ui/Logo";
import { useSession } from "@/features/authentication/session.store";
import { useLogout } from "@/features/authentication/useLogout";
import { useAdminDashboard } from "@/features/admin/hooks";
import type { AdminDashboard } from "@/types/admin";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  badge?: keyof AdminDashboard;
}

// D'autres entrées (produits, stock, catégories, réglages) s'ajoutent ici dans la Partie B.
const NAV: NavItem[] = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Commandes", icon: ReceiptText },
  { href: "/admin/purchases", label: "À acheter", icon: ShoppingBag, badge: "internationalToPurchase" },
  { href: "/admin/quotes", label: "Devis à valider", icon: FileCheck2, badge: "quotesPendingReview" },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
];

function Frame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const user = useSession((s) => s.user);
  const logout = useLogout();
  const { data: counters } = useAdminDashboard();

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  const badge = (item: NavItem) =>
    item.badge && counters ? counters[item.badge] : 0;

  const Badge = ({ count }: { count: number }) =>
    count > 0 ? (
      <span className="ml-auto rounded-full bg-sale px-1.5 text-[11px] font-bold text-white">
        {count > 99 ? "99+" : count}
      </span>
    ) : null;

  return (
    <div className="min-h-dvh bg-surface lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      {/* Barre latérale (ordinateur) */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-line bg-white p-4 lg:flex">
        <div className="flex items-center justify-between gap-2">
          <Logo />
          <NotificationBell
            allHref="/admin/notifications"
            align="left"
          />
        </div>

        <p className="mt-1 text-xs font-bold uppercase tracking-wider text-muted">
          Administration
        </p>

        <nav
          aria-label="Administration"
          className="mt-6 flex-1 space-y-1"
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item) ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-2xl px-3 text-sm font-semibold motion-safe:transition-colors",
                isActive(item)
                  ? "bg-brand-50 text-brand-700"
                  : "text-ink/80 hover:bg-surface",
              )}
            >
              <item.icon className="h-4 w-4" aria-hidden />
              {item.label}
              <Badge count={badge(item)} />
            </Link>
          ))}
        </nav>

        <div className="space-y-1 border-t border-line pt-4 text-sm">
          <Link
            href="/"
            className="flex min-h-11 items-center gap-3 rounded-2xl px-3 font-semibold text-ink/80 hover:bg-surface"
          >
            <Store className="h-4 w-4" aria-hidden />
            Voir la boutique
          </Link>

          <button
            type="button"
            onClick={logout}
            className="flex min-h-11 w-full items-center gap-3 rounded-2xl px-3 text-left font-semibold text-ink/80 hover:bg-surface"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Se déconnecter
          </button>

          <p className="truncate px-3 pt-2 text-xs text-muted">
            {user?.email}
          </p>
        </div>
      </aside>

      <div className="min-w-0">
        {/* Barre supérieure (mobile et tablette) */}
        <header className="sticky top-0 z-30 border-b border-line bg-white lg:hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-2">
            <Logo />

            <div className="flex items-center gap-3">
              <NotificationBell allHref="/admin/notifications" />

              <Link
                href="/"
                className="text-sm font-semibold text-brand-600"
              >
                Boutique
              </Link>
            </div>
          </div>

          <nav
            aria-label="Administration"
            className="flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none]"
          >
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item) ? "page" : undefined}
                className={cn(
                  "flex min-h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-semibold",
                  isActive(item)
                    ? "bg-brand-500 text-white"
                    : "bg-surface text-ink/80",
                )}
              >
                {item.label}

                {badge(item) > 0 && (
                  <span className="rounded-full bg-sale px-1.5 text-[11px] font-bold text-white">
                    {badge(item)}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </header>

        <main className="mx-auto max-w-6xl p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

/** Protection d'interface : la vraie protection est celle du backend (rôle administrateur sur chaque route). */
export function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const status = useSession((s) => s.status);
  const role = useSession((s) => s.user?.role);

  useEffect(() => {
    if (status === "anonymous") {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [status, router, pathname]);

  if (status !== "authenticated") {
    return (
      <p className="p-10 text-center text-sm text-muted" aria-busy="true">
        Chargement…
      </p>
    );
  }

  if (role !== "ADMIN") {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-extrabold tracking-tight">
          Accès réservé
        </h1>

        <p className="mt-2 text-sm text-muted">
          Cette section est réservée à l&apos;équipe A&amp;T Market.
        </p>

        <Link href="/" className={cn(statusButton, "mt-6")}>
          Retour à la boutique
        </Link>
      </div>
    );
  }

  return <Frame>{children}</Frame>;
}
