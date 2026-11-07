"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ApiError, errorMessage } from "@/services/api/errors";
import type { PreviewInput } from "@/services/api/quotes";
import type { MarketplaceId } from "@/lib/marketplace";
import { ImportForm } from "./ImportForm";
import { MarketplacePicker } from "./MarketplacePicker";
import { QuoteResult } from "./QuoteResult";
import { parseMarketplaceId } from "./marketplaces";
import type { ImportValues } from "./schemas";
import { usePreviewQuote } from "./usePreviewQuote";

export function ImportFlow() {
  const searchParams = useSearchParams();
  const [marketplace, setMarketplace] = useState<MarketplaceId>(() => parseMarketplaceId(searchParams.get("marketplace")) ?? "shein");
  const [lastInput, setLastInput] = useState<PreviewInput | null>(null);
  const { mutation, cancel } = usePreviewQuote();
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mutation.data || mutation.isError) resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [mutation.data, mutation.isError]);

  function submit(values: ImportValues) {
    const input: PreviewInput = { productUrl: values.productUrl, subCategoryId: values.subCategoryId };
    // Même demande et devis encore valable : on réutilise le résultat au lieu de relancer une extraction payante.
    const sameRequest = lastInput?.productUrl === input.productUrl && lastInput.subCategoryId === input.subCategoryId;
    if (sameRequest && mutation.data && Date.parse(mutation.data.preview.expiresAt) > Date.now()) {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    setLastInput(input);
    mutation.mutate(input);
  }

  const retry = () => lastInput && mutation.mutate(lastInput);
  const error = mutation.error;
  const canRetry = error instanceof ApiError && error.retryable;

  return (
    <div className="space-y-6">
      <MarketplacePicker value={marketplace} onChange={setMarketplace} />
      <ImportForm marketplace={marketplace} onDetect={setMarketplace} onSubmit={submit} pending={mutation.isPending} />

      <div ref={resultRef} aria-live="polite" className="scroll-mt-24">
        {mutation.isPending && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-line p-8 text-center" aria-busy="true">
            <Loader2 className="h-8 w-8 animate-spin text-brand-500" aria-hidden />
            <p className="font-semibold">Analyse du produit en cours…</p>
            <p className="text-sm text-muted">Nous lisons la fiche chez la boutique et calculons le prix total livré. Cela peut prendre un moment.</p>
            <button type="button" onClick={cancel} className="text-sm font-medium text-muted underline">
              Annuler
            </button>
          </div>
        )}

        {error && !mutation.isPending && (
          <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5">
            <p className="flex items-start gap-2 font-semibold text-sale">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden /> {errorMessage(error)}
            </p>
            {!(error instanceof ApiError && error.kind === "rate_limited") && (
              <ul className="mt-3 list-disc space-y-1 pl-9 text-sm text-ink/80">
                <li>Vérifiez que le lien est celui d&apos;une fiche produit (et non d&apos;une page de recherche ou de catégorie).</li>
                <li>Vérifiez la boutique : SHEIN, NOON ou 1688 uniquement.</li>
              </ul>
            )}
            {canRetry && (
              <button type="button" onClick={retry} className="mt-4 rounded-lg bg-sale px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
                Réessayer
              </button>
            )}
          </div>
        )}

        {mutation.data && !mutation.isPending && (
          <QuoteResult data={mutation.data} onRefresh={retry} onReset={() => mutation.reset()} />
        )}
      </div>
    </div>
  );
}