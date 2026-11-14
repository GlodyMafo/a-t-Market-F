"use client";

import { ExternalLink } from "lucide-react";
import { useState } from "react";
import { ApproveDialog, HistoryDialog, RejectDialog } from "@/components/admin/QuoteDialogs";
import { ErrorState } from "@/components/feedback/ErrorState";
import { usePendingQuotes } from "@/features/admin/hooks";
import { safeHost } from "@/lib/marketplace";
import { formatDateTime, formatUsd } from "@/lib/utils";
import { errorMessage } from "@/services/api/errors";
import type { PendingQuote } from "@/types/admin";

export function QuotesReview() {
  const { data, isLoading, error, refetch } = usePendingQuotes();
  const [approving, setApproving] = useState<PendingQuote | null>(null);
  const [rejecting, setRejecting] = useState<PendingQuote | null>(null);
  const [history, setHistory] = useState<PendingQuote | null>(null);

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">Devis à valider</h1>
      <p className="mt-1 text-sm text-muted">
        Les devis dont le poids est inconnu ou le montant élevé. Tant qu&apos;un devis n&apos;est pas approuvé, le client ne peut pas le payer.
      </p>

      {isLoading && <div className="skeleton mt-5 h-60 rounded-3xl bg-ink/[0.06]" aria-busy="true" aria-label="Chargement" />}
      {error && <ErrorState title="Impossible de charger les devis" message={errorMessage(error)} onRetry={() => refetch()} />}
      {data && data.length === 0 && <p className="mt-6 rounded-3xl bg-white p-8 text-center text-sm text-muted">Aucun devis en attente.</p>}

      <ul className="mt-5 space-y-4">
        {data?.map((quote) => {
          const host = safeHost(quote.productUrl);
          const provisional = quote.productWeight === null;
          return (
            <li key={quote.id} className="rounded-3xl border border-line bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-display text-lg font-extrabold leading-snug tracking-tight">{quote.productName ?? "Produit importé"}</p>
                  {quote.options && <p className="text-sm font-semibold text-ink/80">Options : {quote.options}</p>}
                  <p className="mt-1 text-xs text-muted">
                    {quote.user.email}
                    {quote.user.phone ? ` · ${quote.user.phone}` : ""} · demandé le {formatDateTime(quote.createdAt)}
                  </p>
                  {host && (
                    <a href={quote.productUrl} target="_blank" rel="noopener noreferrer" className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline">
                      Ouvrir chez {host} <ExternalLink className="h-3 w-3" aria-hidden />
                    </a>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted">{provisional ? "Total provisoire (hors transport)" : "Total du devis"}</p>
                  <p className="font-display text-2xl font-extrabold tabular-nums tracking-tight text-brand-600">{formatUsd(quote.totalPrice)}</p>
                </div>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-4">
                <div>
                  <dt className="text-xs text-muted">Prix du produit</dt>
                  <dd className="font-medium tabular-nums">{formatUsd(quote.productPrice)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Transport et douane</dt>
                  <dd className="font-medium tabular-nums">{provisional ? "À calculer" : formatUsd(quote.shippingCost)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Poids</dt>
                  <dd className="font-medium">
                    {quote.productWeight ? `${quote.productWeight} kg` : "Inconnu"}
                    {quote.weightSource ? <span className="text-xs text-muted"> ({quote.weightSource})</span> : null}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Catégorie</dt>
                  <dd className="font-medium">{quote.subCategory?.name ?? "—"}</dd>
                </div>
              </dl>
              {quote.adminNotes && <p className="mt-3 rounded-2xl bg-amber-50 p-3 text-sm text-amber-900">{quote.adminNotes}</p>}

              <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
                <button type="button" onClick={() => setApproving(quote)} className="min-h-11 rounded-full bg-brand-500 px-5 text-sm font-semibold text-white motion-safe:transition hover:bg-brand-600 motion-safe:active:scale-95">
                  Approuver
                </button>
                <button type="button" onClick={() => setRejecting(quote)} className="min-h-11 rounded-full border border-red-200 px-5 text-sm font-semibold text-sale hover:bg-red-50">
                  Rejeter
                </button>
                <button type="button" onClick={() => setHistory(quote)} className="min-h-11 rounded-full px-5 text-sm font-semibold text-muted hover:bg-surface">
                  Historique
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <ApproveDialog quote={approving} onClose={() => setApproving(null)} />
      <RejectDialog quote={rejecting} onClose={() => setRejecting(null)} />
      <HistoryDialog quote={history} onClose={() => setHistory(null)} />
    </div>
  );
}