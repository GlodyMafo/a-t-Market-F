import type { Order } from "@/types/domain";
import { api } from "./client";
import { endpoints } from "./endpoints";
import type { PageMeta } from "@/types/api";

/** Crée la commande à partir du panier du compte : le backend réserve le stock et vide le panier. */
export async function createOrder(): Promise<Order> {
  const { data } = await api.post<Order>(endpoints.orders.create, undefined, { auth: "required" });
  return data;
}

export async function getOrder(id: string, signal?: AbortSignal): Promise<Order> {
  const { data } = await api.get<Order>(endpoints.orders.detail(id), { auth: "required", signal });
  return data;
}


export async function listMyOrders(page: number, limit = 10, signal?: AbortSignal) {
  const { data, meta } = await api.get<Order[]>(endpoints.orders.mine, { query: { page, limit }, auth: "required", signal });
  return { items: data, meta: meta as PageMeta | undefined };
}