
"use client";

import { AlertTriangle, ChevronDown, Clock, ExternalLink, Info, RefreshCw } from "lucide-react";
import { useState } from "react";
import { AddToCartButton } from "@/components/products/AddToCartButton";
import { QuantitySelector } from "@/components/products/QuantitySelector";
import { useCartActions } from "@/features/cart/useCartActions";
import { useNow } from "@/hooks/useNow";
import { detectMarketplaceId, safeHost } from "@/lib/marketplace";
import { cn, formatUsd } from "@/lib/utils";
import { errorMessage } from "@/services/api/errors";
import type { QuotePriceBreakdown, QuotePreviewResult } from "@/types/domain";
import { collectQuoteImages } from "./images";
import { IMPORT_MARKETPLACES } from "./marketplaces";
import { applyChoice, findVariant, formatOptions, isComplete, missingGroups, type Selected } from "./options";
import { ProductDetails } from "./ProductDetails";
import { QuoteGallery } from "./QuoteGallery";
import { TicketDivider } from "./TicketDivider";
import { useQuotePricing } from "./useQuotePricing";
import { VariantPicker } from "./VariantPicker";

interface Props {
  data: QuotePreviewResult;
  onRefresh: () => void;
  onReset: () => void;
}

const scrollArea = "[scrollbar-width:thin] [scrollbar-gutter:stable]";

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
  const { addInternational } = useCartActions();

  const options = preview.variantOptions && preview.variantOptions.groups.length > 0 ? preview.variantOptions : null;

  const details =
    preview.details &&
    (preview.details.specs.length > 0 || preview.details.highlights.length > 0)
      ? preview.details
      : null;

  const hasMiddle = Boolean(options || details);
  const stockLimit = preview.stockLimit ?? null;

  const required = Boolean(options?.required);
  const minQty = Math.max(preview.minOrderQuantity ?? 1, 1);

  const [selected, setSelected] = useState<Selected>({});
  const [quantity, setQuantity] = useState(minQty);

  const variant = options ? findVariant(options, selected) : null;
  const sku = variant?.sku ?? null;
  const complete = options ? isComplete(options, selected) : true;
  const missing = options ? missingGroups(options, selected).join(", ") : "";
  const noChoiceYet = required && sku === null;

  const expiresMs = Date.parse(preview.expiresAt);
  const validDate = Number.isFinite(expiresMs);
  const expired = now > 0 && validDate && expiresMs <= now;
  const remaining = now > 0 && validDate && !expired ? formatRemaining(expiresMs - now) : null;
  const endingSoon = now > 0 && validDate && !expired && expiresMs - now < 3_600_000;

  // Prix : l'aperçu suffit pour 1 unité sans choix particulier ; sinon le serveur calcule le prix exact.
  const serverPrice = !noChoiceYet && !expired && (sku !== null || quantity !== 1);
  const pricing = useQuotePricing({ ticket: data.ticket, variantSku: sku, quantity, enabled: serverPrice });

  const fromPreview: QuotePriceBreakdown = {
    currency: "USD", quantity: 1,
    productPrice: preview.productPrice, shippingCost: preview.shippingCost, customsCost: preview.customsCost,
    commissionCost: preview.commissionCost, fixedFee: preview.fixedFee, totalPrice: preview.totalPrice,
    isProvisional: preview.isProvisional,
  };
  const breakdown: QuotePriceBreakdown | null = noChoiceYet ? null : serverPrice ? (pricing.data ?? null) : fromPreview;
  const priceStale = serverPrice && pricing.stale;

  const provisional = breakdown?.isProvisional ?? preview.isProvisional;
  const needsReview = preview.status === "PENDING_REVIEW";
  const marketplaceId = detectMarketplaceId(preview.productUrl);
  const marketplaceName = IMPORT_MARKETPLACES.find((m) => m.id === marketplaceId)?.name;
  const host = safeHost(preview.productUrl);
  const images = collectQuoteImages(preview);

  // Chaque ligne est celle calculée par le backend : aucune addition côté frontend.
  const customsIncluded = breakdown ? Number(breakdown.customsCost) === 0 : true;
  const lines: Array<{ label: string; value: string; unknown?: boolean }> = breakdown
    ? [
        { label: quantity > 1 ? `Prix du produit (×${quantity})` : "Prix du produit", value: breakdown.productPrice },
        { label: customsIncluded ? "Transport et douane" : "Transport", value: breakdown.shippingCost, unknown: provisional },
        ...(customsIncluded ? [] : [{ label: "Douane", value: breakdown.customsCost }]),
        { label: "Commission A&T", value: breakdown.commissionCost },
        ...(Number(breakdown.fixedFee) > 0 ? [{ label: "Frais fixes", value: breakdown.fixedFee }] : []),
      ]
    : [];

  const untilLabel = formatUntil(preview.expiresAt);
  const validityShort = expired ? "Devis expiré" : remaining ? `Valable encore ${remaining}` : `Valable jusqu'au ${untilLabel}`;
  const validityFull = expired ? "Devis expiré" : `Valable jusqu'au ${untilLabel}`;

  const noSizeLeft = Boolean(options?.groups.some((g) => g.values.every((v) => !v.available)));
  const canAdd = preview.inStock && !expired && complete && breakdown !== null && !priceStale && !pricing.isError && !noSizeLeft;
  const disabledReason = !complete
    ? `Choisissez ${missing} pour continuer.`
    : noSizeLeft
      ? "Une option n'est plus disponible pour ce produit."
      : pricing.isError
        ? errorMessage(pricing.error)
        : priceStale
          ? "Mise à jour du prix…"
          : undefined;

  const header = (
    <div className="px-5 pb-4 pt-5 md:px-6">
      {marketplaceName && <span className="inline-block rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-bold text-brand-700">{marketplaceName}</span>}
      <h2 id="quote-title" className="mt-1.5 line-clamp-3 font-display text-lg font-extrabold leading-snug tracking-tight md:text-xl">
        {preview.productName}
      </h2>
    </div>
  );

  return (
    <section
      aria-labelledby="quote-title"
      className={cn(
        "overflow-hidden rounded-3xl bg-surface shadow-[0_12px_32px_-18px_rgb(15_17_21/0.35)]",
        "lg:grid lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]",
        hasMiddle ? "xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)_minmax(0,0.85fr)]" : "xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]",
        expired ? "lg:grid-rows-[auto_minmax(0,1fr)]" : "lg:grid-rows-[minmax(0,1fr)]",
      )}
    >
      {expired && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 bg-amber-100 px-5 py-3 text-sm text-amber-900 lg:col-span-full">
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

      {/* Colonne 1 : photos */}
      <div className="relative lg:flex lg:min-h-0">
        <QuoteGallery key={data.ticket} images={images} name={preview.productName} />
        <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 hidden w-0 lg:block">
          <span className="absolute -top-3 left-0 h-6 w-6 -translate-x-1/2 rounded-full bg-white" />
          <span className="absolute -bottom-3 left-0 h-6 w-6 -translate-x-1/2 rounded-full bg-white" />
          <span className="absolute inset-y-6 left-0 border-l-2 border-dashed border-ink/15" />
        </div>
      </div>

      {/* Colonnes 2 et 3 (empilées sous 1280 px) */}
      <div className={cn("flex min-w-0 flex-col lg:min-h-0", hasMiddle && "xl:contents")}>
        {hasMiddle ? (
          <div className="flex min-w-0 flex-col lg:min-h-0 lg:flex-1">
            {header}
            <div className="lg:hidden">
              <TicketDivider />
            </div>
            <div className={cn("space-y-7 px-5 py-4 md:px-6 lg:min-h-0 lg:flex-1 lg:overflow-y-auto", scrollArea)}>
              {options && (
                <VariantPicker
                  options={options}
                  selected={selected}
                  onSelect={(group, value) => setSelected((current) => applyChoice(options, current, group, value))}
                  missing={missing || undefined}
                />
              )}
              {details && <ProductDetails details={details} />}
            </div>
          </div>
        ) : null}

        {/* Prix, quantité, détail et action */}
        <div className={cn("flex min-w-0 flex-col lg:shrink-0", hasMiddle ? "xl:min-h-0 xl:flex-1 xl:border-l xl:border-ink/10" : "lg:min-h-0 lg:flex-1")}>
          {!hasMiddle && (
            <>
              {header}
              <div className="lg:hidden">
                <TicketDivider />
              </div>
            </>
          )}
          {hasMiddle && (
            <div className="lg:hidden xl:hidden">
              <TicketDivider />
            </div>
          )}

          <div className={cn("px-5 pb-3 pt-5 md:px-6", scrollArea, hasMiddle ? "xl:min-h-0 xl:flex-1 xl:overflow-y-auto" : "lg:min-h-0 lg:flex-1 lg:overflow-y-auto")}>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              {noChoiceYet ? "Prix à partir de" : provisional ? "Prix hors transport (à confirmer)" : "Prix total livré en RDC"}
            </p>
            <div className={cn("mt-1 flex flex-wrap items-center gap-x-3 gap-y-2", priceStale && "opacity-60 motion-safe:transition-opacity")} aria-live="polite">
              <p className="font-display text-4xl font-extrabold tabular-nums tracking-tight text-brand-600 xl:text-4xl 2xl:text-5xl">
                {formatUsd(noChoiceYet ? preview.totalPrice : (breakdown?.totalPrice ?? null))}
              </p>
              {needsReview ? (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">À valider par l&apos;équipe</span>
              ) : !noChoiceYet ? (
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">
                  {preview.weightSource === "CATALOG_ESTIMATE" ? "Prix estimé" : "Prix ferme"}
                </span>
              ) : null}
            </div>
            {noChoiceYet && preview.maxTotalPrice && (
              <p className="mt-1 text-sm text-muted">jusqu&apos;à {formatUsd(preview.maxTotalPrice)} selon les options</p>
            )}

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

            {/* Quantité */}
            <div className="mt-5">
              <p className="mb-2 text-sm font-bold">Quantité</p>
              <QuantitySelector
                value={quantity}
                max={stockLimit ?? 999}
                onChange={(next) => setQuantity(Math.min(Math.max(next, minQty), stockLimit ?? 999))}
              />
              {minQty > 1 && <p className="mt-1.5 text-xs text-muted">Quantité minimale chez ce vendeur : {minQty}.</p>}
              {stockLimit !== null && (
                <p className="mt-1.5 text-xs font-medium text-amber-800">Plus que {stockLimit} en stock chez le vendeur.</p>
              )}
            </div>

            {!preview.inStock && (
              <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                Ce produit est indisponible chez le vendeur pour le moment.
              </p>
            )}
            {needsReview && (
              <p className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
                <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                {preview.notice ?? "Ce total doit être validé par l'équipe A&T avant confirmation."}
              </p>
            )}

            {breakdown && (
              <details className="group mt-4 overflow-hidden rounded-2xl bg-white">
                <summary className="flex min-h-12 cursor-pointer list-none select-none items-center justify-between px-4 text-sm font-semibold [&::-webkit-details-marker]:hidden">
                  <span>
                    Détail du prix <span className="hidden font-normal text-muted sm:inline">· poids, transport, commission</span>
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted motion-safe:transition-transform group-open:rotate-180" aria-hidden />
                </summary>
                <dl className="divide-y divide-line border-t border-line px-4 text-sm">
                  {lines.map((line) => (
                    <div key={line.label} className="flex justify-between gap-4 py-2.5">
                      <dt className="text-muted">{line.label}</dt>
                      <dd className="font-medium tabular-nums">{line.unknown ? "À confirmer" : formatUsd(line.value)}</dd>
                    </div>
                  ))}
                  <div className="flex justify-between gap-4 py-3 font-bold">
                    <dt>{provisional ? "Total partiel" : "Total livré"}</dt>
                    <dd className="tabular-nums text-brand-600">{formatUsd(breakdown.totalPrice)}</dd>
                  </div>
                </dl>
                <p className="border-t border-line px-4 py-2.5 text-xs text-muted">
                  {preview.weightKg && (
                    <>
                      Poids pris en compte : {preview.weightKg} kg{preview.weightSource === "CATALOG_ESTIMATE" ? " (estimé d'après la catégorie)" : ""} par unité.{" "}
                    </>
                  )}
                  Montants en dollars US, calculés par A&amp;T Market.
                </p>
              </details>
            )}
          </div>

          <div className="space-y-2 border-t border-ink/10 p-5 md:px-6 lg:shrink-0 lg:py-4">
            {preview.inStock && !expired && (
              <AddToCartButton
                disabled={!canAdd}
                disabledReason={disabledReason}
                onAdd={() =>
                  addInternational(data, {
                    options: formatOptions(options, selected),
                    variantSku: sku,
                    quantity,
                    totalPrice: breakdown?.totalPrice ?? preview.totalPrice,
                  })
                }
              />
            )}
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
              {host && (
                <a href={preview.productUrl} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center gap-1 font-medium text-brand-600 hover:underline lg:min-h-9">
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
