import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { sideTiles } from "@/constants/banners";
import { FinanceSpark } from "./FinanceSpark";

const tile = sideTiles[1];

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

      <FinanceSpark />
    </Link>
  );
}