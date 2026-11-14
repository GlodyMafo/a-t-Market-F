"use client";

import { Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CartState } from "@/features/cart/useCart";
import { formatUsd } from "@/lib/utils";

export function CheckoutSummary({ cart }: { cart: CartState }) {
  return (
    <aside
      aria-label="Récapitulatif de la commande"
      className="rounded-3xl border border-line bg-white p-5 shadow-[0_12px_32px_-22px_rgb(15_17_21/0.3)] lg:sticky lg:top-[calc(var(--header-h)+1rem)]"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-extrabold tracking-tight">Votre commande</h2>
        <Link href="/cart" className="text-sm font-semibold text-brand-600 hover:underline">
          Modifier
        </Link>
      </div>

      <ul className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
        {cart.lines.map((line) => (
          <li key={line.key} className="flex items-center gap-3">
            <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-surface">
              {line.imageUrl ? (
                <Image src={line.imageUrl} alt="" fill unoptimized referrerPolicy="no-referrer" sizes="48px" className="object-contain p-0.5" />
              ) : (
                <span className="flex h-full items-center justify-center text-muted">
                  <Package className="h-4 w-4" aria-hidden />
                </span>
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="line-clamp-1 text-sm font-medium">{line.name}</span>
              <span className="text-xs text-muted">Quantité : {line.quantity}</span>
            </span>
            <span className="text-sm font-semibold tabular-nums">{formatUsd(line.lineTotal)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-end justify-between gap-4 border-t border-line pt-4">
        <span className="font-semibold">Total à payer</span>
        <span className="font-display text-2xl font-extrabold tabular-nums tracking-tight text-brand-600">{formatUsd(cart.total)}</span>
      </div>
      <p className="mt-1 text-xs text-muted">Prix total livré, en dollars US.</p>
    </aside>
  );
}