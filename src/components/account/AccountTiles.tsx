"use client";

import { useQuery } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import Link from "next/link";
import { listMyQuotes } from "@/services/api/quotes";

export function AccountTiles() {
  const { data } = useQuery({ queryKey: ["my-quotes"], queryFn: ({ signal }) => listMyQuotes(signal) });
  const tiles = [{ href: "/account/quotes", label: "Mes devis", icon: FileText, count: data?.length }];
  // Les tuiles « Commandes » (Lot 8) et « Notifications » (Lot 9) s'ajouteront ici.

  return (
    <ul className="grid grid-cols-2 gap-3 md:grid-cols-4" aria-label="Raccourcis">
      {tiles.map(({ href, label, icon: Icon, count }) => (
        <li key={href}>
          <Link href={href} className="flex flex-col items-center gap-1.5 rounded-xl border border-line bg-white p-4 text-center transition-shadow hover:shadow-md">
            <Icon className="h-6 w-6 text-brand-500" aria-hidden />
            <span className="text-2xl font-bold leading-none">{count ?? "–"}</span>
            <span className="text-xs text-muted">{label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}