"use client";

import { AlertCircle, Globe } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ApiError, errorMessage } from "@/services/api/errors";
import type { PreviewInput } from "@/services/api/quotes";
import { ImportForm } from "./ImportForm";
import { ImportInfoPanel } from "./ImportInfoPanel";
import { QuoteResult } from "./QuoteResult";
import { TicketDivider } from "./TicketDivider";
import type { ImportValues } from "./schemas";
import { usePreviewQuote } from "./usePreviewQuote";

const ALIGN_MARGIN = "scroll-mt-[calc(var(--header-h)+0.75rem)]";

/** Desktop : l'espace de travail se cale sous l'en-tête. Mobile : on amène le résultat à l'écran. */
function align(workspace: HTMLElement | null, result: HTMLElement | null) {
  const desktop = window.matchMedia("(min-width: 1024px)").matches;
  const target = desktop ? workspace : result;
  if (!target) return;
  if (desktop) {
    const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 73;
    if (Math.abs(target.getBoundingClientRect().top - (header + 12)) < 6) return; // déjà en place
  }
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}

/** Monté uniquement pendant l'analyse : son compteur repart donc de zéro. Même structure que le ticket, pour éviter tout saut de mise en page. */
function PendingCard({ onCancel }: { onCancel: () => void }) {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 15_000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      role="status"
      aria-busy="true"
      className="overflow-hidden rounded-3xl bg-surface lg:grid lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)]"
    >
      <div className="p-3 md:p-4 lg:flex">
        <div className="skeleton aspect-square max-h-[34rem] w-full rounded-2xl bg-ink/[0.06] lg:aspect-auto lg:max-h-none lg:flex-1" />
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
  const workspaceRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const error = mutation.error;
  const canRetry = error instanceof ApiError && error.retryable;
  const showError = Boolean(error) && !mutation.isPending;
  const showResult = Boolean(mutation.data) && !mutation.isPending;
  const workspace = mutation.isPending || showError || showResult; // l'espace de travail occupe la hauteur de l'écran
  const idle = !workspace;

  useEffect(() => {
    if (mutation.isPending || mutation.data || mutation.isError) align(workspaceRef.current, resultRef.current);
  }, [mutation.isPending, mutation.data, mutation.isError]);

  function submit(values: ImportValues) {
    const input: PreviewInput = { productUrl: values.productUrl };
    // Même demande et devis encore valable : on réutilise le résultat au lieu de relancer une extraction payante.
    if (lastInput?.productUrl === input.productUrl && mutation.data && Date.parse(mutation.data.preview.expiresAt) > Date.now()) {
      align(workspaceRef.current, resultRef.current);
      return;
    }
    setLastInput(input);
    mutation.mutate(input);
  }

  const retry = () => lastInput && mutation.mutate(lastInput);

  return (
    <div
      ref={workspaceRef}
      className={cn("flex flex-col gap-4", ALIGN_MARGIN, workspace && "lg:h-[calc(100dvh-var(--header-h)-1.5rem)] lg:min-h-[34rem]")}
    >
      {/* Barre de recherche : titre à gauche, champ et bouton sur une ligne (desktop) */}
      <section
        aria-labelledby="import-title"
        className="rounded-3xl border border-line bg-white p-4 shadow-[0_12px_32px_-22px_rgb(15_17_21/0.3)] md:p-5 lg:shrink-0"
      >
        <div className="lg:flex lg:items-start lg:gap-8">
          <header className="mb-4 lg:mb-0 lg:w-72 lg:shrink-0">
            <p className={cn("inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700", workspace && "lg:hidden")}>
              <Globe className="h-3.5 w-3.5" aria-hidden /> SHEIN · NOON · 1688
            </p>
            <h1 id="import-title" className="mt-2 font-display text-2xl font-extrabold tracking-tight md:text-3xl lg:mt-0">
              Importer un produit
            </h1>
            <p className={cn("mt-1 text-sm text-muted", workspace && "lg:hidden")}>
              Collez le lien d&apos;un produit SHEIN, NOON ou 1688 : vous obtenez son prix total livré en RDC, avant de commander.
            </p>
          </header>
          <div className="min-w-0 lg:flex-1 lg:pt-1">
            <ImportForm onSubmit={submit} pending={mutation.isPending} compact={workspace} />
          </div>
        </div>
      </section>

      {/* Résultat : prend toute la hauteur restante sur desktop */}
      <div ref={resultRef} aria-live="polite" className={cn("min-w-0", ALIGN_MARGIN, workspace && "lg:flex lg:min-h-0 lg:flex-1 lg:flex-col")}>
        {idle && <ImportInfoPanel />}

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

        {showResult && mutation.data && (
          <QuoteResult key={mutation.data.ticket} data={mutation.data} onRefresh={retry} onReset={() => mutation.reset()} />
        )}      
        </div>
    </div>
  );
}