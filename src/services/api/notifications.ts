import type { PageMeta } from "@/types/api";
import type { AppNotification } from "@/types/domain";
import { api } from "./client";
import { endpoints } from "./endpoints";

export type NotificationsMeta = PageMeta & { unread: number };

export async function listNotifications(params: { page: number; limit: number; unread?: boolean }, signal?: AbortSignal) {
  const { data, meta } = await api.get<AppNotification[]>(endpoints.notifications.list, {
    query: { page: params.page, limit: params.limit, unread: params.unread ? "true" : undefined },
    auth: "required",
    signal,
  });
  return { items: data, meta: meta as NotificationsMeta | undefined };
}

export async function markNotificationRead(id: string) {
  const { data } = await api.patch<AppNotification>(endpoints.notifications.read(id), undefined, { auth: "required" });
  return data;
}

export async function markAllNotificationsRead() {
  const { data } = await api.patch<{ updated: number }>(endpoints.notifications.readAll, undefined, { auth: "required" });
  return data;
}