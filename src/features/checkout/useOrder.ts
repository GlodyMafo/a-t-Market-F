"use client";

import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";
import { getOrder } from "@/services/api/orders";
import { derivePhase } from "./orderState";

const POLL_MS = 4_000;
const MAX_POLL_MS = 10 * 60_000;

/** Suit la commande ; relit le serveur toutes les 4 s tant qu'un paiement est en attente (10 min au plus). */
export function useOrder(orderId: string) {
  const startedAt = useRef(0);

  return useQuery({
    queryKey: ["order", orderId],
    queryFn: ({ signal }) => getOrder(orderId, signal),
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: (query) => {
      const order = query.state.data;
      if (!order || derivePhase(order) !== "waiting") return false;
      if (startedAt.current === 0) startedAt.current = Date.now();
      return Date.now() - startedAt.current > MAX_POLL_MS ? false : POLL_MS;
    },
  });
}