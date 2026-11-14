"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { priceQuote } from "@/services/api/quotes";

/** Prix exact calculé par le serveur pour la variante et la quantité choisies (aucune extraction). */
export function useQuotePricing(args: { ticket: string; variantSku: string | null; quantity: number; enabled: boolean }) {
  const quantity = useDebouncedValue(args.quantity, 400);
  const query = useQuery({
    queryKey: ["quote-price", args.ticket, args.variantSku, quantity],
    queryFn: ({ signal }) => priceQuote({ ticket: args.ticket, variantSku: args.variantSku ?? undefined, quantity }, signal),
    enabled: args.enabled,
    staleTime: 5 * 60_000,
    placeholderData: keepPreviousData,
  });
  /** Vrai tant que le prix affiché ne correspond pas encore au dernier choix. */
  const stale = args.enabled && (args.quantity !== quantity || query.isPlaceholderData || query.isFetching);
  return { ...query, stale };
}