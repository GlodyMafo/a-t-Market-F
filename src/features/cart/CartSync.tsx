"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useSession } from "@/features/authentication/session.store";
import { mergeCartItems } from "@/services/api/cart";
import { useGuestCart, type GuestLine } from "./guest-cart.store";
import type { MergeItem, MergeItemResult } from "./types";
import { CART_KEY } from "./useCart";

function toMergeItem(line: GuestLine): MergeItem {
  return line.kind === "LOCAL"
    ? { type: "LOCAL", productId: line.productId, quantity: line.quantity }
    : { type: "INTERNATIONAL", ticket: line.ticket, ...(line.options ? { options: line.options } : {}), quantity: line.quantity , ...(line.variantSku ? { variantSku: line.variantSku } : {}),};
}

function announce(results: MergeItemResult[], lines: GuestLine[]) {
  const kept = results.filter((r) => r.status !== "REJECTED").length;
  if (kept > 0) toast.success(kept > 1 ? "Votre panier a été ajouté à votre compte." : "Votre article a été ajouté à votre compte.");

  const problems = results.filter((r) => (r.status === "REJECTED" || r.status === "ADJUSTED") && r.reason);
  problems.slice(0, 3).forEach((r) => toast.warning(`« ${lines[r.index]?.name ?? "Article"} » : ${r.reason}`));
  if (problems.length > 3) toast.warning(`${problems.length - 3} autre(s) article(s) ont été ajustés ou refusés. Vérifiez votre panier.`);
}

/** Relit le panier invité au démarrage, puis le fusionne avec le compte dès que la personne est connectée. */
export function CartSync() {
  const queryClient = useQueryClient();
  const status = useSession((s) => s.status);
  const hydrated = useGuestCart((s) => s.hydrated);
  const hasLines = useGuestCart((s) => s.lines.length > 0);
  const merging = useRef(false);

  useEffect(() => {
    const done = () => useGuestCart.getState().setHydrated();
    const result = useGuestCart.persist.rehydrate();
    if (result && typeof (result as Promise<void>).then === "function") (result as Promise<void>).then(done, done);
    else done();
  }, []);

  useEffect(() => {
    if (status !== "authenticated" || !hydrated || !hasLines || merging.current) return;
    merging.current = true;
    const lines = useGuestCart.getState().lines;

    mergeCartItems(lines.map(toMergeItem))
      .then((response) => {
        queryClient.setQueryData(CART_KEY, response.cart);
        useGuestCart.getState().clear();
        announce(response.results, lines);
      })
      .catch(() => {
        // Les articles restent dans le navigateur : la fusion sera retentée au prochain chargement.
        toast.error("Votre panier n'a pas pu être récupéré pour le moment. Nous réessaierons au prochain chargement.");
      })
      .finally(() => {
        merging.current = false;
      });
  }, [status, hydrated, hasLines, queryClient]);

  return null;
}