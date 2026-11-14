"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addTrackingEvent, approveQuote, getAdminDashboard, getAdminOrder, getAdminStats, getQuoteHistory,
  getToPurchase, listAdminOrders, listPendingQuotes, rejectQuote,
} from "@/services/api/admin";
import type { TrackingStatus } from "@/types/enums";

export const ADMIN_KEY = ["admin"] as const;

/** Relu chaque minute et au retour sur l'onglet : les administrateurs n'ont pas de notification en direct. */
export function useAdminDashboard() {
  return useQuery({
    queryKey: [...ADMIN_KEY, "dashboard"],
    queryFn: ({ signal }) => getAdminDashboard(signal),
    staleTime: 15_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
}

export function useAdminStats() {
  return useQuery({ queryKey: [...ADMIN_KEY, "stats"], queryFn: ({ signal }) => getAdminStats(signal), staleTime: 60_000 });
}

export function useAdminOrders(page: number, limit = 20) {
  return useQuery({
    queryKey: [...ADMIN_KEY, "orders", page, limit],
    queryFn: ({ signal }) => listAdminOrders(page, limit, signal),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
    refetchOnWindowFocus: true,
  });
}

export function useAdminOrder(orderId: string) {
  return useQuery({
    queryKey: [...ADMIN_KEY, "order", orderId],
    queryFn: ({ signal }) => getAdminOrder(orderId, signal),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}

export function useToPurchase() {
  return useQuery({ queryKey: [...ADMIN_KEY, "to-purchase"], queryFn: ({ signal }) => getToPurchase(signal), staleTime: 15_000, refetchOnWindowFocus: true });
}

export function usePendingQuotes() {
  return useQuery({ queryKey: [...ADMIN_KEY, "quotes"], queryFn: ({ signal }) => listPendingQuotes(signal), staleTime: 15_000, refetchOnWindowFocus: true });
}

export function useQuoteHistory(quoteId: string, enabled: boolean) {
  return useQuery({ queryKey: [...ADMIN_KEY, "quote-history", quoteId], queryFn: ({ signal }) => getQuoteHistory(quoteId, signal), enabled });
}

/** Chaque action relit tout l'espace administrateur : compteurs, listes et détails restent cohérents. */
export function useAdminMutations() {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: ADMIN_KEY });

  const addTracking = useMutation({
    mutationFn: (input: { orderId: string; status: TrackingStatus; message?: string }) =>
      addTrackingEvent(input.orderId, { status: input.status, ...(input.message ? { message: input.message } : {}) }),
    onSuccess: refresh,
  });
  const approve = useMutation({
    mutationFn: (input: { quoteId: string; weightKg?: number; adminNotes?: string }) =>
      approveQuote(input.quoteId, { ...(input.weightKg !== undefined ? { weightKg: input.weightKg } : {}), ...(input.adminNotes ? { adminNotes: input.adminNotes } : {}) }),
    onSuccess: refresh,
  });
  const reject = useMutation({
    mutationFn: (input: { quoteId: string; adminNotes: string }) => rejectQuote(input.quoteId, input.adminNotes),
    onSuccess: refresh,
  });

  return { addTracking, approve, reject };
}