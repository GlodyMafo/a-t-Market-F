"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { listMyOrders } from "@/services/api/orders";
import { getTracking } from "@/services/api/tracking";

export function useMyOrders(page: number, limit = 10) {
  return useQuery({
    queryKey: ["orders", page, limit],
    queryFn: ({ signal }) => listMyOrders(page, limit, signal),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
    refetchOnWindowFocus: true,
  });
}

/** Relecture périodique en secours : le temps réel invalide déjà ces données quand il fonctionne. */
export function useTracking(orderId: string) {
  return useQuery({
    queryKey: ["tracking", orderId],
    queryFn: ({ signal }) => getTracking(orderId, signal),
    staleTime: 15_000,
    refetchOnWindowFocus: true,
    refetchInterval: (query) => {
      const events = query.state.data;
      return events?.some((e) => e.status === "DELIVERED") ? false : 60_000;
    },
  });
}