"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronRight, FileText } from "lucide-react";
import Link from "next/link";
import { listMyQuotes } from "@/services/api/quotes";

/** Desktop uniquement : sur mobile, le menu en dessous (avec son compteur) joue ce rôle. */
export function AccountTiles() {
  const { data } = useQuery({ queryKey: ["my-quotes"], queryFn: ({ signal }) => listMyQuotes(signal) });
  const tiles = [{ href: "/account/quotes", label: "Mes devis", icon: FileText, count: data?.length }];
  // Les tuiles « Commandes » (Lot 8) et « Notifications » (Lot 9) s'ajouteront ici.

  return (
    <ul className="hidden gap-3 md:grid md:grid-cols-2 xl:grid-cols-3" aria-label="Raccourcis">
      {tiles.map(({ href, label, icon: Icon, count }) => (
        <li key={href}>
          <Link
            href={href}
            className="group flex items-center gap-4 rounded-2xl border border-line bg-white p-4 motion-safe:transition motion-safe:hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-18px_rgb(15_17_21/0.35)]"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Icon className="h-6 w-6" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-display text-2xl font-extrabold leading-none tabular-nums tracking-tight">{count ?? "–"}</span>
              <span className="mt-1 block text-sm text-muted">{label}</span>
            </span>
            <ChevronRight className="h-4 w-4 text-muted motion-safe:transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </li>
      ))}
    </ul>
  );
}