"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronRight, FileText, LogOut } from "lucide-react";
import Link from "next/link";
import { useLogout } from "@/features/authentication/useLogout";
import { listMyQuotes } from "@/services/api/quotes";

const row = "flex min-h-14 w-full items-center gap-3 px-4 text-left text-sm motion-safe:transition-colors active:bg-surface";

export function MenuRows() {
  const logout = useLogout();
  const { data } = useQuery({ queryKey: ["my-quotes"], queryFn: ({ signal }) => listMyQuotes(signal) });

  const rows = [{ href: "/account/quotes", label: "Mes devis", icon: FileText, count: data?.length }];
  // Commandes, adresses, profil, sécurité et notifications s'ajouteront ici au fil des lots.

  return (
    <div className="space-y-3 md:hidden">
      <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
        {rows.map(({ href, label, icon: Icon, count }) => (
          <li key={href}>
            <Link href={href} className={row}>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="flex-1 font-medium">{label}</span>
              {count !== undefined && (
                <span className="min-w-6 rounded-full bg-brand-50 px-2 py-0.5 text-center text-xs font-bold tabular-nums text-brand-700">{count}</span>
              )}
              <ChevronRight className="h-4 w-4 text-muted" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>

      <button type="button" onClick={logout} className={`${row} rounded-2xl border border-line bg-white text-sale`}>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50">
          <LogOut className="h-5 w-5" aria-hidden />
        </span>
        <span className="flex-1 font-medium">Se déconnecter</span>
      </button>
    </div>
  );
}