"use client";

import { Check, Loader2, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  onAdd: () => Promise<{ ok: boolean; message?: string }>;
  soldOut?: boolean;
  disabled?: boolean;
  /** Explique pourquoi le bouton est inactif (ex. « Choisissez une taille »). */
  disabledReason?: string;
}

export function AddToCartButton({ onAdd, soldOut = false, disabled = false, disabledReason }: Props) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "pending" | "added">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  async function handleClick() {
    if (state === "pending") return;
    setState("pending");
    let outcome: { ok: boolean; message?: string };
    try {
      outcome = await onAdd();
    } catch {
      outcome = { ok: false, message: "Impossible d'ajouter cet article pour le moment." };
    }
    if (!outcome.ok) {
      setState("idle");
      toast.error(outcome.message ?? "Impossible d'ajouter cet article.");
      return;
    }
    setState("added");
    toast.success(outcome.message ?? "Ajouté au panier", { action: { label: "Voir le panier", onClick: () => router.push("/cart") } });
    timer.current = setTimeout(() => setState("idle"), 2500);
  }

  const blocked = soldOut || disabled;

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={blocked || state === "pending"}
        aria-busy={state === "pending"}
        className={cn(
          "flex h-12 w-full items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold motion-safe:transition motion-safe:active:scale-95",
          blocked
            ? "cursor-not-allowed bg-surface text-muted"
            : state === "added"
              ? "bg-green-600 text-white"
              : "bg-brand-500 text-white hover:bg-brand-600",
        )}
      >
        {soldOut ? (
          "Épuisé"
        ) : state === "pending" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Ajout…
          </>
        ) : state === "added" ? (
          <>
            <Check className="h-4 w-4" aria-hidden /> Ajouté
          </>
        ) : (
          <>
            <ShoppingBag className="h-4 w-4" aria-hidden /> Ajouter au panier
          </>
        )}
      </button>
      {(soldOut || disabledReason) && (
        <p className="mt-2 text-center text-xs text-muted">{soldOut ? "Ce produit n'est plus en stock pour le moment." : disabledReason}</p>
      )}
    </div>
  );
}