import type { Order } from "@/types/domain";

export type PaymentPhase = "paid" | "waiting" | "partial" | "failed" | "cancelled" | "payable";

/** Même format que les notifications et e-mails du backend. */
export const orderReference = (orderId: string) => `#${orderId.slice(-6).toUpperCase()}`;

/** Etat du paiement déduit UNIQUEMENT des données du backend (statut de la commande et de ses paiements). */
export function derivePhase(order: Order): PaymentPhase {
  const payments = order.payments ?? [];
  if (order.status === "PAID" || order.status === "DELIVERED") return "paid";
  if (order.status === "CANCELLED") return "cancelled";
  if (payments.some((p) => p.status === "PENDING")) return "waiting";
  if (order.status === "PARTIALLY_PAID") return "partial";
  const latest = [...payments].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  if (latest && (latest.status === "FAILED" || latest.status === "EXPIRED")) return "failed";
  return "payable";
}

/** Reste à payer d'une commande partiellement payée : montants fournis par le backend, aucun calcul. */
export function remainingPayment(order: Order): { type: "PRODUCT" | "SHIPPING"; amount: string } | null {
  const paid = (order.payments ?? []).filter((p) => p.status === "PAID").map((p) => p.type);
  if (paid.includes("PRODUCT")) return { type: "SHIPPING", amount: order.shippingAmount };
  if (paid.includes("SHIPPING")) return { type: "PRODUCT", amount: order.productsAmount };
  return null;
}