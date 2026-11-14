"use client";

import { Copy, ExternalLink } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { ErrorState } from "@/components/feedback/ErrorState";
import { orderReference } from "@/features/checkout/orderState";
import { useToPurchase } from "@/features/admin/hooks";
import { readSnapshot } from "@/features/admin/snapshot";
import { formatDateTime, formatUsd } from "@/lib/utils";
import { errorMessage } from "@/services/api/errors";

async function copyLink(url: string) {
  try {
    await navigator.clipboard.writeText(url);
    toast.success("Lien copié.");
  } catch {
    toast.error("Copie impossible : ouvrez le lien directement.");
  }
}

export function PurchasesList() {
  const { data, isLoading, error, refetch } = useToPurchase();

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">Produits à acheter</h1>
      <p className="mt-1 text-sm text-muted">
        Commandes payées dont les articles importés restent à acheter, les plus anciennes d&apos;abord (100 au maximum). Une fois l&apos;achat fait, passez le suivi à « Produit acheté » depuis la commande.
      </p>

      {isLoading && <div className="skeleton mt-5 h-60 rounded-3xl bg-ink/[0.06]" aria-busy="true" aria-label="Chargement" />}
      {error && <ErrorState title="Impossible de charger la liste" message={errorMessage(error)} onRetry={() => refetch()} />}
      {data && data.length === 0 && <p className="mt-6 rounded-3xl bg-white p-8 text-center text-sm text-muted">Rien à acheter pour le moment.</p>}

      <ul className="mt-5 space-y-4">
        {data?.map((order) => (
          <li key={order.id} className="rounded-3xl border border-line bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display text-lg font-extrabold tracking-tight">{orderReference(order.id)}</p>
                <p className="text-xs text-muted">Payée le {formatDateTime(order.createdAt)}</p>
                <p className="mt-1 text-sm">
                  {order.user.email}
                  {order.user.phone && <span className="text-muted"> · {order.user.phone}</span>}
                </p>
              </div>
              <Link
                href={`/admin/orders/${encodeURIComponent(order.id)}`}
                className="inline-flex min-h-11 items-center rounded-full bg-brand-500 px-5 text-sm font-semibold text-white hover:bg-brand-600"
              >
                Ouvrir la commande
              </Link>
            </div>

            <ul className="mt-4 divide-y divide-line">
              {order.items.map((item) => {
                const snapshot = readSnapshot(item.quoteSnapshot);
                return (
                  <li key={item.id} className="flex flex-wrap items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0 flex-1 text-sm">
                      <p className="font-semibold">{snapshot.name}</p>
                      {snapshot.options && <p className="text-xs font-semibold text-ink/80">Options : {snapshot.options}</p>}
                      <p className="text-xs text-muted">Quantité : {item.quantity}</p>
                      {snapshot.url && snapshot.host && (
                        <div className="mt-1.5 flex flex-wrap gap-2">
                          <a
                            href={snapshot.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-9 items-center gap-1 rounded-full bg-surface px-3 text-xs font-semibold text-brand-700 hover:bg-brand-50"
                          >
                            Ouvrir chez {snapshot.host} <ExternalLink className="h-3 w-3" aria-hidden />
                          </a>
                          <button
                            type="button"
                            onClick={() => copyLink(snapshot.url!)}
                            className="inline-flex min-h-9 items-center gap-1 rounded-full bg-surface px-3 text-xs font-semibold text-muted hover:bg-brand-50"
                          >
                            <Copy className="h-3 w-3" aria-hidden /> Copier le lien
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-bold tabular-nums">{formatUsd(item.price)}</p>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}