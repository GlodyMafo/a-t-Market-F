"use client";

import { ChevronRight, FileText, LogOut } from "lucide-react";
import Link from "next/link";
import { useLogout } from "@/features/authentication/useLogout";

const rows = [{ href: "/account/quotes", label: "Mes devis", icon: FileText }];
// Commandes, adresses, profil, sécurité et notifications s'ajouteront ici au fil des lots.

export function MenuRows() {
  const logout = useLogout();
  const row = "flex w-full items-center gap-3 px-4 py-3.5 text-left text-sm";
  return (
    <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-white md:hidden">
      {rows.map(({ href, label, icon: Icon }) => (
        <li key={href}>
          <Link href={href} className={row}>
            <Icon className="h-5 w-5 text-brand-500" aria-hidden />
            <span className="flex-1 font-medium">{label}</span>
            <ChevronRight className="h-4 w-4 text-muted" aria-hidden />
          </Link>
        </li>
      ))}
      <li>
        <button type="button" onClick={logout} className={`${row} text-sale`}>
          <LogOut className="h-5 w-5" aria-hidden />
          <span className="flex-1 font-medium">Se déconnecter</span>
        </button>
      </li>
    </ul>
  );
}