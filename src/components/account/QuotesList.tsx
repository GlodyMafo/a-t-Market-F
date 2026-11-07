"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ErrorState } from "@/components/feedback/ErrorState";
import { QUOTE_STATUS_LABELS } from "@/constants/quotes";
import { cn, formatDate, formatUsd } from "@/lib/utils";
import { errorMessage } from "@/services/api/errors";
import { listMyQuotes } from "@/services/api/quotes";

function hostOf(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.hostname : null;
  } catch {
    return null;
  }
}

export function QuotesList() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["my-quotes"],
    queryFn: ({ signal }) => listMyQuotes(signal),
  });

  return (
    <section aria-labelledby="quotes-title">
      <h1 id="quotes-title" className="text-xl font-bold">Mes devis</h1>

      {isLoading && (
        <ul className="mt-4 space-y-3" aria-busy="true" aria-label="Chargement des devis">
          {[0, 1, 2].map((i) => (
            <li key={i} className="h-24 animate-pulse rounded-xl bg-surface" />
          ))}
        </ul>
      )}

      {error && <ErrorState title="Impossible de charger vos devis" message={errorMessage(error)} onRetry={() => refetch()} />}

      {data && data.length === 0 && (
        <Link href="/import" className="sr-only">Importer un produit</Link>
      )}
      {data && data.length === 0 && <EmptyQuotes />}

      {data && data.length > 0 && (
        <ul className="mt-4 space-y-3">
          {data.map((quote) => {
            const status = QUOTE_STATUS_LABELS[quote.status];
            const host = hostOf(quote.productUrl);
            return (
              <li key={quote.id} className="rounded-xl border border-line p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{quote.productName ?? "Produit importé"}</p>
                    {host && <p className="text-xs text-muted">{host}</p>}
                  </div>
                  <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold", status?.className ?? "bg-surface text-muted")}>
                    {status?.label ?? quote.status}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-end justify-between gap-2 text-sm">
                  <p>
                    <span className="text-muted">Prix total livré : </span>
                    <span className="text-lg font-bold text-brand-600">{formatUsd(quote.totalPrice)}</span>
                  </p>
                  <p className="text-xs text-muted">
                    Créé le {formatDate(quote.createdAt)}
                    {quote.expiresAt ? ` · valable jusqu'au ${formatDate(quote.expiresAt)}` : ""}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function EmptyQuotes() {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <p className="font-semibold">Aucun devis pour l&apos;instant</p>
      <p className="text-sm text-muted">Collez le lien d&apos;un produit SHEIN, NOON ou 1688 pour obtenir son prix total livré.</p>
      <Link href="/import" className="mt-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600">
        Importer un produit
      </Link>
    </div>
  );
}