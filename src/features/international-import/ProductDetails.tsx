import { ChevronDown } from "lucide-react";
import type { QuoteProductDetails } from "@/types/domain";

/** Contenu fourni par la boutique, affiché comme texte brut. Replié par défaut : le client l'ouvre s'il est intéressé. */
export function ProductDetails({ details }: { details: QuoteProductDetails }) {
  const { specs, highlights } = details;

  return (
    <details className="group overflow-hidden rounded-2xl bg-white">
      <summary className="flex min-h-12 cursor-pointer list-none select-none items-center justify-between gap-3 px-4 text-sm font-semibold [&::-webkit-details-marker]:hidden">
        <span>
          Caractéristiques du produit <span className="font-normal text-muted">({specs.length + highlights.length})</span>
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted motion-safe:transition-transform group-open:rotate-180" aria-hidden />
      </summary>

      <div className="space-y-4 border-t border-line p-4">
        {highlights.length > 0 && (
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink/80">
            {highlights.map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ul>
        )}
        {specs.length > 0 && (
          <dl className="divide-y divide-line text-sm">
            {specs.map((spec) => (
              <div key={`${spec.name}-${spec.value}`} className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-3 py-2">
                <dt className="text-muted">{spec.name}</dt>
                <dd className="break-words font-medium">{spec.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </details>
  );
}