
"use client";

import { AlertCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ApiError, errorMessage } from "@/services/api/errors";
import type { PreviewInput } from "@/services/api/quotes";
import { ImportForm } from "./ImportForm";
import { ImportInfoPanel } from "./ImportInfoPanel";
import { QuoteResult } from "./QuoteResult";
import { TicketDivider } from "./TicketDivider";
import { IMPORT_MARKETPLACES } from "./marketplaces";
import type { ImportValues } from "./schemas";
import { usePreviewQuote } from "./usePreviewQuote";

function scrollToResult(element: HTMLElement | null) {
  if (!element) return;
  // Desktop : le résultat s'affiche à côté du formulaire. On ne défile que s'il n'est pas entièrement visible.
  if (window.matchMedia("(min-width: 1024px)").matches) {
    const headerHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 73;
    const rect = element.getBoundingClientRect();
    if (rect.top >= headerHeight && rect.bottom <= window.innerHeight) return;
  }
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  element.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}

/** Monté uniquement pendant l'analyse : son compteur repart donc de zéro. Même structure que le ticket, pour éviter tout saut de mise en page. */
function PendingCard({ onCancel }: { onCancel: () => void }) {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 15_000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div role="status" aria-busy="true" className="overflow-hidden rounded-3xl bg-surface lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <div className="p-3 md:p-4 lg:h-full">
        <div className="skeleton aspect-square max-h-[34rem] w-full rounded-2xl bg-ink/[0.06] lg:aspect-auto lg:h-full lg:max-h-none lg:min-h-[24rem]" />
      </div>

      <div className="min-w-0 lg:flex lg:flex-col lg:justify-center">
        <div className="space-y-2.5 px-5 pb-5 md:px-6 lg:pb-3 lg:pt-6">
          <div className="skeleton h-4 w-16 rounded-full bg-ink/[0.06]" />
          <div className="skeleton h-5 w-4/5 rounded bg-ink/[0.06]" />
        </div>
        <div className="lg:hidden">
          <TicketDivider />
        </div>
        <div className="p-5 md:p-6 lg:pt-3">
          <div className="skeleton h-3 w-40 rounded bg-ink/[0.06]" />
          <div className="skeleton mt-3 h-12 w-48 rounded-xl bg-ink/[0.06]" />
          <p className="mt-5 font-semibold lg:mt-4">Analyse du produit en cours…</p>
          <p className="mt-1 text-sm text-muted">Nous lisons la fiche chez la boutique et calculons le prix total livré. Cela peut prendre un moment.</p>
          {slow && <p className="mt-2 text-sm font-medium text-brand-700">Cela peut prendre plus d&apos;une minute. Gardez cette page ouverte.</p>}
          <button
            type="button"
            onClick={onCancel}
            className="mt-4 min-h-11 rounded-full border border-line bg-white px-5 text-sm font-semibold motion-safe:transition-colors hover:bg-surface motion-safe:active:scale-95"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

export function ImportFlow() {
  const [lastInput, setLastInput] = useState<PreviewInput | null>(null);
  const { mutation, cancel } = usePreviewQuote();
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mutation.isPending || mutation.data || mutation.isError) scrollToResult(resultRef.current);
  }, [mutation.isPending, mutation.data, mutation.isError]);

  function submit(values: ImportValues) {
    const input: PreviewInput = { productUrl: values.productUrl };

    // Même demande et devis encore valable : on réutilise le résultat au lieu de relancer une extraction payante.
    if (
      lastInput?.productUrl === input.productUrl &&
      mutation.data &&
      Date.parse(mutation.data.preview.expiresAt) > Date.now()
    ) {
      scrollToResult(resultRef.current);
      return;
    }

    setLastInput(input);
    mutation.mutate(input);
  }

  const retry = () => lastInput && mutation.mutate(lastInput);
  const error = mutation.error;
  const canRetry = error instanceof ApiError && error.retryable;
  const showError = Boolean(error) && !mutation.isPending;
  const showResult = Boolean(mutation.data) && !mutation.isPending;
  const idle = !mutation.isPending && !showError && !showResult;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start lg:gap-8">
      {/* Colonne gauche : la recherche */}
      <div className="space-y-6 rounded-3xl border border-line bg-white p-4 shadow-[0_12px_32px_-22px_rgb(15_17_21/0.3)] md:p-6">
        <ImportForm onSubmit={submit} pending={mutation.isPending} />

        <ul className="space-y-1.5 border-t border-line pt-4 text-sm text-muted">
          {IMPORT_MARKETPLACES.map((m) => (
            <li key={m.id}>
              <span className="font-semibold text-ink">{m.name}</span> : {m.tip}
            </li>
          ))}
        </ul>
      </div>

      {/* Colonne droite : le résultat, collée sous le header sur desktop. Au repos, le panneau d'information occupe la place. */}
      <div className="min-w-0 lg:sticky lg:top-[calc(var(--header-h)+1rem)]">
        {idle && <ImportInfoPanel />}

        <div ref={resultRef} aria-live="polite" className="scroll-mt-[calc(var(--header-h)+1rem)]">
          {mutation.isPending && <PendingCard onCancel={cancel} />}

          {showError && (
            <div role="alert" className="rounded-3xl border border-red-200 bg-red-50 p-5">
              <p className="flex items-start gap-2 font-semibold text-red-700">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-sale" aria-hidden /> {errorMessage(error)}
              </p>
              {!(error instanceof ApiError && error.kind === "rate_limited") && (
                <ul className="mt-3 list-disc space-y-1 pl-9 text-sm text-ink/80">
                  <li>Vérifiez que le lien est celui d&apos;une fiche produit (et non d&apos;une page de recherche ou de catégorie).</li>
                  <li>Vérifiez la boutique : SHEIN, NOON ou 1688 uniquement.</li>
                </ul>
              )}
              {canRetry && (
                <button
                  type="button"
                  onClick={retry}
                  className="mt-4 min-h-11 rounded-full bg-sale px-5 text-sm font-semibold text-white motion-safe:transition hover:opacity-90 motion-safe:active:scale-95"
                >
                  Réessayer
                </button>
              )}
            </div>
          )}

          {showResult && mutation.data && <QuoteResult data={mutation.data} onRefresh={retry} onReset={() => mutation.reset()} />}
        </div>
      </div>
    </div>
  );
}
