"use client";

import { useQuery } from "@tanstack/react-query";
import { ExternalLink, FileText } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { QUOTE_STATUS_LABELS } from "@/constants/quotes";
import { IMPORT_MARKETPLACES } from "@/features/international-import/marketplaces";
import { useNow } from "@/hooks/useNow";
import { detectMarketplaceId, safeHost } from "@/lib/marketplace";
import { cn, formatDate, formatUsd } from "@/lib/utils";
import { errorMessage } from "@/services/api/errors";
import { listMyQuotes } from "@/services/api/quotes";
import type { QuoteStatus } from "@/types/enums";

const ACCENT: Record<QuoteStatus, string> = {
  AUTO_APPROVED: "bg-green-500",
  APPROVED: "bg-green-500",
  PENDING_REVIEW: "bg-amber-500",
  REJECTED: "bg-sale",
};

function formatUntil(iso: string): string | null {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" });
}

export function QuotesList() {
  const now = useNow();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["my-quotes"],
    queryFn: ({ signal }) => listMyQuotes(signal),
  });

  return (
    <section aria-labelledby="quotes-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 id="quotes-title" className="font-display text-2xl font-extrabold tracking-tight">
            Mes devis
          </h1>
          {data && data.length > 0 && (
            <p className="mt-0.5 text-sm text-muted">
              {data.length} devis
            </p>
          )}
        </div>
        {data && data.length > 0 && (
          <Link
            href="/import"
            className="inline-flex min-h-11 items-center rounded-full bg-brand-500 px-5 text-sm font-semibold text-white motion-safe:transition hover:bg-brand-600 motion-safe:active:scale-95"
          >
            Importer un produit
          </Link>
        )}
      </div>

      {isLoading && (
        <ul className="mt-4 space-y-3" aria-busy="true" aria-label="Chargement des devis">
          {[0, 1, 2].map((i) => (
            <li key={i} className="skeleton h-32 rounded-2xl" />
          ))}
        </ul>
      )}

      {error && <ErrorState title="Impossible de charger vos devis" message={errorMessage(error)} onRetry={() => refetch()} />}

      {data && data.length === 0 && (
        <EmptyState
          icon={FileText}
          title="Aucun devis pour l'instant"
          message="Collez le lien d'un produit SHEIN, NOON ou 1688 pour obtenir son prix total livré."
        >
          <Link
            href="/import"
            className="mt-2 inline-flex min-h-11 items-center rounded-full bg-brand-500 px-6 text-sm font-semibold text-white motion-safe:transition-colors hover:bg-brand-600 motion-safe:active:scale-95"
          >
            Importer un produit
          </Link>
        </EmptyState>
      )}

      {data && data.length > 0 && (
        <ul className="mt-4 space-y-3">
          {data.map((quote) => {
            const status = QUOTE_STATUS_LABELS[quote.status];
            const host = safeHost(quote.productUrl);
            const marketplaceName = IMPORT_MARKETPLACES.find((m) => m.id === detectMarketplaceId(quote.productUrl))?.name;

            // Avant l'hydratation, `now` vaut 0 : aucun devis n'est marqué expiré à tort.
            const expiresMs = quote.expiresAt ? Date.parse(quote.expiresAt) : NaN;
            const expired = quote.status !== "REJECTED" && now > 0 && Number.isFinite(expiresMs) && expiresMs <= now;
            const until = quote.expiresAt ? formatUntil(quote.expiresAt) : null;

            return (
              <li
                key={quote.id}
                className={cn(
                  "relative overflow-hidden rounded-2xl border border-line p-4 pl-5 md:p-5 md:pl-6",
                  expired ? "bg-surface" : "bg-white shadow-[0_8px_24px_-18px_rgb(15_17_21/0.3)]",
                )}
              >
                <span aria-hidden className={cn("absolute inset-y-0 left-0 w-1.5", expired ? "bg-ink/20" : ACCENT[quote.status])} />

                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {marketplaceName && <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-bold text-brand-700">{marketplaceName}</span>}
                      {host && <span className="truncate text-xs text-muted">{host}</span>}
                    </div>
                    <p className={cn("mt-1.5 line-clamp-2 font-semibold", expired && "text-ink/60")}>{quote.productName ?? "Produit importé"}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    {expired && <span className="rounded-full bg-ink/10 px-2.5 py-1 text-xs font-bold text-ink/70">Expiré</span>}
                    <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", expired ? "bg-white text-muted" : (status?.className ?? "bg-surface text-muted"))}>
                      {status?.label ?? quote.status}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted">Prix total livré</p>
                    <p className={cn("font-display text-2xl font-extrabold tabular-nums tracking-tight", expired ? "text-ink/50" : "text-brand-600")}>
                      {formatUsd(quote.totalPrice)}
                    </p>
                  </div>
                  <p className="text-xs text-muted sm:text-right">
                    Créé le {formatDate(quote.createdAt)}
                    {until && (
                      <>
                        <br />
                        {expired ? `Expiré le ${until}` : `Valable jusqu'au ${until}`}
                      </>
                    )}
                  </p>
                </div>

                {host && (
                  <a
                    href={quote.productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex min-h-11 items-center gap-1 text-sm font-medium text-brand-600 hover:underline"
                  >
                    Voir le produit sur {host} <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}