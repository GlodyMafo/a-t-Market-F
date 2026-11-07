"use client";

import { AlertTriangle, ExternalLink, Info, RefreshCw } from "lucide-react";
import Image from "next/image";
import { AddToCartButton } from "@/components/products/AddToCartButton";
import { useNow } from "@/hooks/useNow";
import { detectMarketplaceId, safeHost } from "@/lib/marketplace";
import { formatDate, formatUsd } from "@/lib/utils";
import type { QuotePreviewResult } from "@/types/domain";
import { IMPORT_MARKETPLACES } from "./marketplaces";

interface Props {
  data: QuotePreviewResult;
  onRefresh: () => void;
  onReset: () => void;
}

export function QuoteResult({ data, onRefresh, onReset }: Props) {
  const { preview } = data;
  const now = useNow();
  const expired = now > 0 && Date.parse(preview.expiresAt) <= now;
  const provisional = preview.isProvisional || preview.status === "PENDING_REVIEW";

  const marketplaceId = detectMarketplaceId(preview.productUrl);
  const marketplaceName = IMPORT_MARKETPLACES.find((m) => m.id === marketplaceId)?.name;
  const host = safeHost(preview.productUrl);
  const imageUrl = preview.imageUrl?.startsWith("https://") ? preview.imageUrl : null;

  // Chaque ligne est affichée telle que calculée par le backend : aucune addition côté frontend.
  const lines = [
    { label: "Prix du produit", value: preview.productPrice },
    { label: "Transport", value: preview.shippingCost },
    { label: "Douane", value: preview.customsCost },
    { label: "Commission A&T", value: preview.commissionCost },
    ...(Number(preview.fixedFee) > 0 ? [{ label: "Frais fixes", value: preview.fixedFee }] : []),
  ];

  return (
    <section aria-labelledby="quote-title" className="overflow-hidden rounded-2xl border border-line bg-white">
      {expired && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 bg-amber-50 px-5 py-3 text-sm text-amber-900">
          <span className="flex items-center gap-2 font-medium">
            <AlertTriangle className="h-4 w-4" aria-hidden /> Ce devis a expiré. Relancez l&apos;analyse pour obtenir un prix à jour.
          </span>
          <button type="button" onClick={onRefresh} className="flex items-center gap-1.5 rounded-lg bg-amber-700 px-3 py-1.5 font-semibold text-white hover:bg-amber-800">
            <RefreshCw className="h-4 w-4" aria-hidden /> Actualiser
          </button>
        </div>
      )}

      <div className="grid gap-5 p-5 md:grid-cols-[180px_1fr] md:p-6">
        <div className="relative mx-auto aspect-square w-full max-w-[220px] overflow-hidden rounded-xl bg-surface md:max-w-none">
          {imageUrl ? (
            <Image src={imageUrl} alt={preview.productName} fill unoptimized referrerPolicy="no-referrer" sizes="220px" className="object-contain" />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted">Pas d&apos;image</div>
          )}
        </div>

        <div className="min-w-0">
          {marketplaceName && (
            <span className="inline-block rounded bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-700">{marketplaceName}</span>
          )}
          <h2 id="quote-title" className="mt-1 line-clamp-3 text-base font-semibold md:text-lg">
            {preview.productName}
          </h2>

          <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted">Prix total livré en RDC</p>
          <p className="text-4xl font-bold text-brand-600">{formatUsd(preview.totalPrice)}</p>
          {provisional && <p className="mt-1 text-sm font-semibold text-amber-700">Prix provisoire</p>}

          {!preview.inStock && (
            <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-sale">
              Ce produit est indisponible chez le vendeur pour le moment.
            </p>
          )}
          {provisional && (
            <p className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
              <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              {preview.notice ?? "Ce total est provisoire : il doit être validé par l'équipe A&T avant confirmation."}
            </p>
          )}

          <details className="mt-4 rounded-lg border border-line">
            <summary className="cursor-pointer select-none px-4 py-3 text-sm font-semibold">Voir le détail du prix</summary>
            <dl className="divide-y divide-line border-t border-line px-4 text-sm">
              {lines.map((line) => (
                <div key={line.label} className="flex justify-between py-2.5">
                  <dt className="text-muted">{line.label}</dt>
                  <dd className="font-medium">{formatUsd(line.value)}</dd>
                </div>
              ))}
              <div className="flex justify-between py-2.5 font-bold">
                <dt>Total livré</dt>
                <dd className="text-brand-600">{formatUsd(preview.totalPrice)}</dd>
              </div>
            </dl>
            {preview.weightKg && (
              <p className="border-t border-line px-4 py-2.5 text-xs text-muted">
                Poids pris en compte : {preview.weightKg} kg{preview.weightSource === "CATALOG_ESTIMATE" ? " (estimé d'après la catégorie)" : ""}.
              </p>
            )}
          </details>

          <p className="mt-3 text-xs text-muted">
            Montants en dollars US, calculés par A&amp;T Market. {expired ? "Devis expiré." : `Valable jusqu'au ${formatDate(preview.expiresAt)}.`}
          </p>

          <div className="mt-5 space-y-3">
            {preview.inStock && !expired && <AddToCartButton />}
            <div className="flex flex-wrap gap-4 text-sm">
              {host && (
                <a href={preview.productUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 font-medium text-brand-600 hover:underline">
                  Voir le produit sur {host} <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                </a>
              )}
              <button type="button" onClick={onReset} className="font-medium text-muted underline">
                Analyser un autre produit
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}