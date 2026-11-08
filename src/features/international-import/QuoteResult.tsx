
"use client";

import { AlertTriangle, ChevronDown, Clock, ExternalLink, Info, RefreshCw } from "lucide-react";
import { AddToCartButton } from "@/components/products/AddToCartButton";
import { useNow } from "@/hooks/useNow";
import { detectMarketplaceId, safeHost } from "@/lib/marketplace";
import { cn, formatUsd } from "@/lib/utils";
import type { QuotePreviewResult } from "@/types/domain";
import { IMPORT_MARKETPLACES } from "./marketplaces";
import { collectQuoteImages } from "./images";
import { QuoteGallery } from "./QuoteGallery";
import { TicketDivider } from "./TicketDivider";

interface Props {
  data: QuotePreviewResult;
  onRefresh: () => void;
  onReset: () => void;
}

function formatUntil(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" });
}

/** Temps restant lisible ; null au-delà de 48 h (la date suffit alors). */
function formatRemaining(ms: number): string | null {
  const minutes = Math.max(1, Math.ceil(ms / 60_000));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours >= 48) return null;
  const rest = minutes % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${String(rest).padStart(2, "0")}`;
}

export function QuoteResult({ data, onRefresh, onReset }: Props) {
  const { preview } = data;
  const now = useNow();

  const expiresMs = Date.parse(preview.expiresAt);
  const validDate = Number.isFinite(expiresMs);
  const expired = now > 0 && validDate && expiresMs <= now;
  const remaining = now > 0 && validDate && !expired ? formatRemaining(expiresMs - now) : null;
  const endingSoon = now > 0 && validDate && !expired && expiresMs - now < 3_600_000;
  const provisional = preview.isProvisional || preview.status === "PENDING_REVIEW";

  const marketplaceId = detectMarketplaceId(preview.productUrl);
  const marketplaceName = IMPORT_MARKETPLACES.find((m) => m.id === marketplaceId)?.name;
  const host = safeHost(preview.productUrl);
  const images = collectQuoteImages(preview);

  // La douane est incluse dans le transport côté backend : une ligne « Douane 0 $ » prêterait à confusion.
  const customsIncluded = Number(preview.customsCost) === 0;
  const lines: Array<{ label: string; value: string; unknown?: boolean }> = [
    { label: "Prix du produit", value: preview.productPrice },
    { label: customsIncluded ? "Transport et douane" : "Transport", value: preview.shippingCost, unknown: provisional },
    ...(customsIncluded ? [] : [{ label: "Douane", value: preview.customsCost }]),
    { label: "Commission A&T", value: preview.commissionCost },
    ...(Number(preview.fixedFee) > 0 ? [{ label: "Frais fixes", value: preview.fixedFee }] : []),
  ];

  const untilLabel = formatUntil(preview.expiresAt);
  const validityShort = expired ? "Devis expiré" : remaining ? `Valable encore ${remaining}` : `Valable jusqu'au ${untilLabel}`;
  const validityFull = expired ? "Devis expiré" : `Valable jusqu'au ${untilLabel}`;

  return (
    <section
      aria-labelledby="quote-title"
      className="overflow-hidden rounded-3xl bg-surface shadow-[0_12px_32px_-18px_rgb(15_17_21/0.35)] lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]"
    >
      {expired && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 bg-amber-100 px-5 py-3 text-sm text-amber-900 lg:col-span-2">
          <span className="flex items-center gap-2 font-medium">
            <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden /> Ce devis a expiré. Relancez l&apos;analyse pour obtenir un prix à jour.
          </span>
          <button
            type="button"
            onClick={onRefresh}
            className="flex min-h-11 items-center gap-1.5 rounded-full bg-amber-700 px-4 font-semibold text-white motion-safe:transition-colors hover:bg-amber-800 motion-safe:active:scale-95"
          >
            <RefreshCw className="h-4 w-4" aria-hidden /> Actualiser
          </button>
        </div>
      )}

      {/* Colonne photos : toutes les photos reçues, en grand format */}
      <div className="relative lg:h-full">
        <QuoteGallery key={data.ticket} images={images} name={preview.productName} />

        {/* Séparateur vertical du ticket (desktop) */}
        <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 hidden w-0 lg:block">
          <span className="absolute -top-3 left-0 h-6 w-6 -translate-x-1/2 rounded-full bg-white" />
          <span className="absolute -bottom-3 left-0 h-6 w-6 -translate-x-1/2 rounded-full bg-white" />
          <span className="absolute inset-y-6 left-0 border-l-2 border-dashed border-ink/15" />
        </div>
      </div>

      {/* Colonne détails */}
      <div className="min-w-0 lg:flex lg:flex-col lg:justify-center">
        <div className="px-5 pb-5 md:px-6 lg:pb-3 lg:pt-6">
          {marketplaceName && <span className="inline-block rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-bold text-brand-700">{marketplaceName}</span>}
          <h2 id="quote-title" className="mt-1.5 line-clamp-3 font-display text-lg font-extrabold leading-snug tracking-tight md:text-xl lg:line-clamp-2">
            {preview.productName}
          </h2>
        </div>

        <div className="lg:hidden">
          <TicketDivider />
        </div>

        <div className="p-5 md:p-6 lg:pb-5 lg:pt-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            {provisional ? "Prix hors transport (à confirmer)" : "Prix total livré en RDC"}
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2">
            <p className="font-display text-5xl font-extrabold tabular-nums tracking-tight text-brand-600 lg:text-4xl xl:text-5xl">
              {formatUsd(preview.totalPrice)}
            </p>

            {provisional ? (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">
                À valider par l&apos;équipe
              </span>
            ) : (
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">
                {preview.weightSource === "CATALOG_ESTIMATE" ? "Prix estimé" : "Prix ferme"}
              </span>
            )}
          </div>

          <p
            title={validityFull}
            className={cn(
              "mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
              expired ? "bg-red-50 text-red-700" : endingSoon ? "bg-amber-100 text-amber-900" : "bg-white text-muted",
            )}
          >
            <Clock className="h-3.5 w-3.5" aria-hidden />
            {validityShort}
            {remaining && <span className="sr-only"> ({validityFull})</span>}
          </p>

          {!preview.inStock && (
            <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">
              Ce produit est indisponible chez le vendeur pour le moment.
            </p>
          )}
          {provisional && (
            <p className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
              <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              {preview.notice ?? "Ce total est provisoire : il doit être validé par l'équipe A&T avant confirmation."}
            </p>
          )}

          <details open className="group mt-4 overflow-hidden rounded-2xl bg-white lg:mt-3">
            <summary className="flex min-h-12 cursor-pointer list-none select-none items-center justify-between px-4 text-sm font-semibold lg:min-h-10 [&::-webkit-details-marker]:hidden">
              Détail du prix
              <ChevronDown className="h-4 w-4 text-muted motion-safe:transition-transform group-open:rotate-180" aria-hidden />
            </summary>
            <dl className="divide-y divide-line border-t border-line px-4 text-sm">
              {lines.map((line) => (
                <div key={line.label} className="flex justify-between gap-4 py-2.5 lg:py-1.5">
                  <dt className="text-muted">{line.label}</dt>
                  <dd className="font-medium tabular-nums">
                    {line.unknown ? "À confirmer" : formatUsd(line.value)}
                  </dd>
                </div>
              ))}
              <div className="flex justify-between gap-4 py-3 font-bold lg:py-2">
                <dt>{provisional ? "Total partiel" : "Total livré"}</dt>
                <dd className="tabular-nums text-brand-600">{formatUsd(preview.totalPrice)}</dd>
              </div>
            </dl>
            <p className="border-t border-line px-4 py-2.5 text-xs text-muted lg:py-2">
              {preview.weightKg && (
                <>
                  Poids pris en compte : {preview.weightKg} kg{preview.weightSource === "CATALOG_ESTIMATE" ? " (estimé d'après la catégorie)" : ""}.{" "}
                </>
              )}
              Montants en dollars US, calculés par A&amp;T Market.
            </p>
          </details>

          <div className="mt-5 space-y-3 lg:mt-4 lg:space-y-2">
            {preview.inStock && !expired && <AddToCartButton />}
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
              {host && (
                <a
                  href={preview.productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-11 items-center gap-1 font-medium text-brand-600 hover:underline lg:min-h-9"
                >
                  Voir le produit sur {host} <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                </a>
              )}
              <button type="button" onClick={onReset} className="min-h-11 font-medium text-muted underline lg:min-h-9">
                Analyser un autre produit
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
