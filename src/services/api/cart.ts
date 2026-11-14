import type { MergeItem, MergeResponse, ServerCart } from "@/features/cart/types";
import { api } from "./client";
import { endpoints } from "./endpoints";
import { ApiError } from "./errors";

/** Retourne null quand le compte n'a pas encore de panier (le backend répond alors 404). */
export async function getCart(signal?: AbortSignal): Promise<ServerCart | null> {
  try {
    const { data } = await api.get<ServerCart>(endpoints.cart.me, { auth: "required", signal });
    return data;
  } catch (error) {
    if (error instanceof ApiError && error.kind === "not_found" && /introuvable/i.test(error.message)) return null;
    throw error;
  }
}

export async function addLocalItem(input: { productId: string; quantity: number }) {
  await api.post<unknown>(endpoints.cart.add, input, { auth: "required" });
}

export async function updateCartItem(itemId: string, quantity: number) {
  await api.patch<unknown>(endpoints.cart.item(itemId), { quantity }, { auth: "required" });
}

export async function removeCartItem(itemId: string) {
  await api.delete<unknown>(endpoints.cart.item(itemId), { auth: "required" });
}

/** Fusion du panier invité ; sert aussi à ajouter un devis (ticket) au panier d'un compte connecté. */
export async function mergeCartItems(items: MergeItem[]): Promise<MergeResponse> {
  const { data } = await api.post<MergeResponse>(endpoints.cart.merge, { items }, { auth: "required" });
  return data;
}