
"use client";

import { ShieldCheck, Smartphone } from "lucide-react";
import Link from "next/link";
import { statusButton } from "@/components/feedback/StatusPanel";
import type { CartState } from "@/features/cart/useCart";
import { sumMoney } from "@/lib/money";
import { cn, formatUsd } from "@/lib/utils";

export function CartSummary({ cart }: { cart: CartState }) {
  const payable = cart.lines.filter((l) => l.payable);
  const localCount = cart.lines.filter((l) => l.kind === "LOCAL").length;
  const importedCount = cart.lines.filter((l) => l.kind === "INTERNATIONAL").length;

  // Sous-totaux : affichage uniquement ; le total de référence vient du backend (compte connecté).
  const localTotal = sumMoney(
    payable.filter((l) => l.kind === "LOCAL").map((l) => l.lineTotal),
  );

  const importedTotal = sumMoney(
    payable.filter((l) => l.kind === "INTERNATIONAL").map((l) => l.lineTotal),
  );

  return (
    <aside
      aria-label="Récapitulatif"
      className="rounded-3xl border border-line bg-white p-5 shadow-[0_12px_32px_-22px_rgb(15_17_21/0.3)] lg:sticky lg:top-[calc(var(--header-h)+1rem)]"
    >
      <h2 className="font-display text-lg font-extrabold tracking-tight">
        Récapitulatif
      </h2>

      <dl className="mt-4 space-y-2 text-sm">
        {localCount > 0 && (
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Produits locaux ({localCount})</dt>
            <dd className="font-medium tabular-nums">
              {formatUsd(localTotal)}
            </dd>
          </div>
        )}

        {importedCount > 0 && (
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Produits importés ({importedCount})</dt>
            <dd className="font-medium tabular-nums">
              {formatUsd(importedTotal)}
            </dd>
          </div>
        )}

        <div className="flex items-end justify-between gap-4 border-t border-line pt-3">
          <dt className="font-semibold">
            {cart.totalIsEstimate ? "Total estimé" : "Total"}
          </dt>
          <dd className="font-display text-2xl font-extrabold tabular-nums tracking-tight text-brand-600">
            {formatUsd(cart.total)}
          </dd>
        </div>
      </dl>

      <p className="mt-1 text-xs text-muted">
        {cart.totalIsEstimate
          ? "Estimation : le total officiel est confirmé à la connexion, avant toute commande."
          : "Prix totaux livrés, en dollars US. Seuls les articles payables sont comptés."}
      </p>

      {cart.mode === "account" && cart.unpayableCount > 0 && (
        <p
          role="status"
          className="mt-3 rounded-2xl bg-amber-50 p-3 text-sm text-amber-900"
        >
          {cart.unpayableCount} article
          {cart.unpayableCount > 1 ? "s" : ""} à corriger ou à retirer avant de
          commander.
        </p>
      )}

      <div className="mt-5 space-y-2">
        {cart.mode === "account" ? (
          <>
            {cart.checkoutReady ? (
              <Link href="/checkout" className={cn(statusButton, "w-full")}>
                Passer la commande
              </Link>
            ) : (
              <>
                <button
                  type="button"
                  disabled
                  className="flex h-12 w-full cursor-not-allowed items-center justify-center rounded-full bg-surface px-6 text-sm font-semibold text-muted"
                >
                  Passer la commande
                </button>
                <p className="text-center text-xs text-muted">
                  Corrigez ou retirez les articles signalés pour continuer.
                </p>
              </>
            )}
          </>
        ) : (
          <>
            <Link
              href="/login?next=/cart"
              className={cn(statusButton, "w-full")}
            >
              Se connecter pour commander
            </Link>

            <Link
              href="/register?next=/cart"
              className="flex min-h-11 items-center justify-center text-sm font-semibold text-brand-600 hover:underline"
            >
              Créer un compte
            </Link>

            <p className="text-center text-xs text-muted">
              Votre panier est conservé sur cet appareil et ajouté à votre
              compte à la connexion.
            </p>
          </>
        )}
      </div>

      <ul className="mt-5 space-y-2 border-t border-line pt-4 text-xs text-muted">
        <li className="flex items-center gap-2">
          <Smartphone className="h-4 w-4 text-brand-500" aria-hidden />
          Paiement par Mobile Money
        </li>

        <li className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-brand-500" aria-hidden />
          Prix total livré affiché avant de payer
        </li>
      </ul>
    </aside>
  );
}


