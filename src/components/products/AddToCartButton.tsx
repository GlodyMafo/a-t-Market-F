import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export function AddToCartButton({ soldOut = false }: { soldOut?: boolean }) {
  return (
    <div>
      <button
        type="button"
        disabled
        className={cn(
          "flex h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold",
          soldOut ? "bg-surface text-muted" : "bg-brand-50 text-brand-700 ring-1 ring-brand-100",
        )}
      >
        {soldOut ? (
          "Épuisé"
        ) : (
          <>
            Ajouter au panier
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-500 px-2 py-0.5 text-[11px] font-bold text-white">
              <Clock className="h-3 w-3" aria-hidden /> Bientôt
            </span>
          </>
        )}
      </button>
      <p className="mt-2 text-center text-xs text-muted">
        {soldOut ? "Ce produit n'est plus en stock pour le moment." : "Le panier sera disponible prochainement."}
      </p>
    </div>
  );
}