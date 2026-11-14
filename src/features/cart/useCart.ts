"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useSession } from "@/features/authentication/session.store";
import { useNow } from "@/hooks/useNow";
import { sumMoney } from "@/lib/money";
import { getCart } from "@/services/api/cart";
import { getProduct } from "@/services/api/catalog";
import { ApiError } from "@/services/api/errors";
import { useGuestCart } from "./guest-cart.store";
import { lineFromGuest, lineFromServer, type LiveProduct } from "./mappers";
import type { CartLine } from "./types";

export const CART_KEY = ["cart"] as const;

export interface CartState {
  mode: "loading" | "guest" | "account";
  status: "loading" | "ready" | "error";
  lines: CartLine[];
  /** Nombre d'unités dans le panier. */
  count: number;
  /** Compte : total officiel du backend. Invité : estimation d'affichage. */
  total: string | null;
  totalIsEstimate: boolean;
  checkoutReady: boolean;
  unpayableCount: number;
  error: unknown;
  refetch: () => void;
}

export function useCart(): CartState {
  const sessionStatus = useSession((s) => s.status);
  const account = sessionStatus === "authenticated";
  const guestLines = useGuestCart((s) => s.lines);
  const hydrated = useGuestCart((s) => s.hydrated);
  const now = useNow();

  const server = useQuery({
    queryKey: CART_KEY,
    queryFn: ({ signal }) => getCart(signal),
    enabled: account,
    staleTime: 15_000,
    refetchOnMount: "always", // disponibilités revérifiées à chaque visite du panier
  });
  const serverItems = useMemo(() => server.data?.items ?? [], [server.data]);

  // Produits locaux dont on doit relire le prix ou le stock dans le catalogue public.
  const productIds = useMemo(() => {
    const ids = account
      ? serverItems.flatMap((i) => (i.kind === "LOCAL" && i.product && i.unitPrice === undefined ? [i.product.id] : []))
      : guestLines.flatMap((l) => (l.kind === "LOCAL" ? [l.productId] : []));
    return [...new Set(ids)];
  }, [account, serverItems, guestLines]);

  const liveQueries = useQueries({
    queries: productIds.map((id) => ({
      queryKey: ["product", id],
      queryFn: ({ signal }: { signal: AbortSignal }) => getProduct(id, signal),
      staleTime: 30_000,
    })),
  });

  const live = new Map<string, LiveProduct | null | undefined>();
  productIds.forEach((id, i) => {
    const query = liveQueries[i];
    if (query?.data) live.set(id, { price: query.data.price, stock: query.data.inventory?.quantity ?? null });
    else if (query?.error instanceof ApiError && query.error.kind === "not_found") live.set(id, null);
    else live.set(id, undefined);
  });

  const lines: CartLine[] = account
    ? serverItems.map((item) => lineFromServer(item, item.product ? live.get(item.product.id) : undefined))
    : guestLines.map((line) => lineFromGuest(line, line.kind === "LOCAL" ? live.get(line.productId) : undefined, now));

  let status: CartState["status"];
  if (sessionStatus === "loading") status = "loading";
  else if (account) status = server.isPending ? "loading" : server.isError ? "error" : "ready";
  else status = hydrated ? "ready" : "loading";

  const total = account
    ? (server.data?.estimatedTotal ?? null)
    : sumMoney(lines.filter((l) => l.payable).map((l) => l.lineTotal));

  return {
    mode: sessionStatus === "loading" ? "loading" : account ? "account" : "guest",
    status,
    lines,
    count: lines.reduce((sum, l) => sum + l.quantity, 0),
    total,
    totalIsEstimate: !account,
    checkoutReady: account ? (server.data?.checkoutReady ?? false) : false,
    unpayableCount: lines.filter((l) => !l.payable).length,
    error: server.error,
    refetch: () => void server.refetch(),
  };
}