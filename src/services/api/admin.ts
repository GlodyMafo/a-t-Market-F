import type { PageMeta } from "@/types/api";
import type {
  AdminDashboard, AdminOrderDetail, AdminOrderListItem, AdminStats, AdminTrackingEvent,
  PendingQuote, QuoteRevision, ToPurchaseOrder,
} from "@/types/admin";
import type { TrackingStatus } from "@/types/enums";
import { api } from "./client";
import { endpoints } from "./endpoints";

const authed = { auth: "required" as const };

export async function getAdminDashboard(signal?: AbortSignal) {
  return (await api.get<AdminDashboard>(endpoints.admin.dashboard, { ...authed, signal })).data;
}

export async function getAdminStats(signal?: AbortSignal) {
  return (await api.get<AdminStats>(endpoints.admin.stats, { ...authed, signal })).data;
}

export async function listAdminOrders(page: number, limit: number, signal?: AbortSignal) {
  const { data, meta } = await api.get<AdminOrderListItem[]>(endpoints.admin.orders, { query: { page, limit }, ...authed, signal });
  return { items: data, meta: meta as PageMeta | undefined };
}

export async function getAdminOrder(orderId: string, signal?: AbortSignal) {
  return (await api.get<AdminOrderDetail>(endpoints.admin.order(orderId), { ...authed, signal })).data;
}

export async function addTrackingEvent(orderId: string, body: { status: TrackingStatus; message?: string }) {
  return (await api.post<AdminTrackingEvent>(endpoints.admin.orderTracking(orderId), body, authed)).data;
}

export async function getToPurchase(signal?: AbortSignal) {
  return (await api.get<ToPurchaseOrder[]>(endpoints.admin.toPurchase, { ...authed, signal })).data;
}

export async function listPendingQuotes(signal?: AbortSignal) {
  return (await api.get<PendingQuote[]>(endpoints.admin.quotesPending, { ...authed, signal })).data;
}

export async function approveQuote(quoteId: string, body: { weightKg?: number; adminNotes?: string }) {
  return (await api.post<PendingQuote>(endpoints.admin.quoteApprove(quoteId), body, authed)).data;
}

export async function rejectQuote(quoteId: string, adminNotes: string) {
  return (await api.post<PendingQuote>(endpoints.admin.quoteReject(quoteId), { adminNotes }, authed)).data;
}

export async function getQuoteHistory(quoteId: string, signal?: AbortSignal) {
  return (await api.get<QuoteRevision[]>(endpoints.admin.quoteHistory(quoteId), { ...authed, signal })).data;
}