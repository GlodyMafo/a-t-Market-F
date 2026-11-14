"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/features/authentication/session.store";
import { listNotifications, markAllNotificationsRead, markNotificationRead } from "@/services/api/notifications";

export const NOTIFICATIONS_KEY = ["notifications"] as const;

export function useNotifications(options: { page: number; limit: number; unreadOnly?: boolean; enabled?: boolean }) {
  const { page, limit, unreadOnly = false, enabled = true } = options;
  return useQuery({
    queryKey: [...NOTIFICATIONS_KEY, "list", page, limit, unreadOnly],
    queryFn: ({ signal }) => listNotifications({ page, limit, unread: unreadOnly }, signal),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });
}

/** Compteur officiel du serveur (une seule ligne chargée). Relu toutes les 90 s en secours du temps réel. */
export function useUnreadCount(): number {
  const account = useSession((s) => s.status === "authenticated");
  const { data } = useQuery({
    queryKey: [...NOTIFICATIONS_KEY, "unread"],
    queryFn: ({ signal }) => listNotifications({ page: 1, limit: 1 }, signal),
    enabled: account,
    staleTime: 30_000,
    refetchInterval: 90_000,
    refetchOnWindowFocus: true,
    select: (result) => result.meta?.unread ?? 0,
  });
  return account ? (data ?? 0) : 0;
}

export function useNotificationActions() {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
  const markRead = useMutation({ mutationFn: markNotificationRead, onSuccess: refresh });
  const markAll = useMutation({ mutationFn: markAllNotificationsRead, onSuccess: refresh });
  return { markRead, markAll };
}