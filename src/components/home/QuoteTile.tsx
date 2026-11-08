import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { sideTiles } from "@/constants/banners";

const tile = sideTiles[1];
const rows = ["Produit", "Transport", "Douane"];

export function QuoteTile() {
  return (
    <Link
      href={tile.href}
      className="group flex min-h-[132px] items-center gap-4 overflow-hidden rounded-2xl bg-ink p-4 text-white motion-safe:transition-transform motion-safe:active:scale-[0.99] lg:min-h-0"
    >
      <div className="min-w-0 flex-1">
        <p className="font-display text-lg font-extrabold tracking-tight">{tile.title}</p>
        <p className="mt-1 line-clamp-2 text-sm text-white/70">{tile.text}</p>
        <span className="mt-2 inline-flex items-center gap-1.5 py-1 text-sm font-semibold text-brand-200">
          {tile.cta}
          <ArrowRight className="h-4 w-4 motion-safe:transition-transform group-hover:translate-x-0.5" aria-hidden />
        </span>
      </div>

      {/* Aperçu décoratif de la structure d'un devis (aucun montant : les prix sont calculés par le backend) */}
      <div aria-hidden className="glass-dark w-[40%] shrink-0 rounded-xl px-3 py-2 text-[10px]">
        {rows.map((row) => (
          <div key={row} className="flex items-center justify-between gap-2 py-0.5">
            <span className="text-white/70">{row}</span>
            <span className="h-1.5 w-7 rounded-full bg-white/25" />
          </div>
        ))}
        <div className="mt-1 flex items-center justify-between gap-2 border-t border-white/20 pt-1.5 font-semibold">
          <span>Total livré</span>
          <span className="h-2 w-9 rounded-full bg-brand-300" />
        </div>
      </div>
    </Link>
  );
}