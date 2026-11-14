import type { TrackingEvent } from "@/types/domain";
import { api } from "./client";
import { endpoints } from "./endpoints";

/** Événements du suivi, du plus ancien au plus récent, avec leur libellé officiel. */
export async function getTracking(orderId: string, signal?: AbortSignal) {
  const { data } = await api.get<TrackingEvent[]>(endpoints.tracking.byOrder(orderId), { auth: "required", signal });
  return data;
}