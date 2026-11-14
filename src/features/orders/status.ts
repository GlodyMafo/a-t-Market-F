import type { OrderStatus, PaymentStatus, PaymentType, TrackingStatus } from "@/types/enums";

export type Tone = "info" | "warn" | "success" | "danger";
export type OrderKind = "LOCAL" | "INTERNATIONAL" | "MIXED";

export const TONE_CLASS: Record<Tone, string> = {
  info: "bg-brand-50 text-brand-700",
  warn: "bg-amber-100 text-amber-900",
  success: "bg-green-100 text-green-800",
  danger: "bg-red-50 text-red-700",
};

export const ORDER_STATUS: Record<OrderStatus, { label: string; tone: Tone }> = {
  PENDING_PAYMENT: { label: "En attente de paiement", tone: "warn" },
  PARTIALLY_PAID: { label: "Paiement partiel", tone: "warn" },
  PAID: { label: "Payée", tone: "info" },
  DELIVERED: { label: "Livrée", tone: "success" },
  CANCELLED: { label: "Annulée", tone: "danger" },
};

export const PAYMENT_STATUS: Record<PaymentStatus, { label: string; tone: Tone }> = {
  PENDING: { label: "En attente", tone: "warn" },
  PARTIAL: { label: "Partiel", tone: "warn" },
  PAID: { label: "Payé", tone: "success" },
  FAILED: { label: "Échoué", tone: "danger" },
  EXPIRED: { label: "Expiré", tone: "danger" },
  REFUNDED: { label: "Remboursé", tone: "info" },
};

export const PAYMENT_TYPE_LABEL: Record<PaymentType, string> = {
  FULL: "Paiement complet",
  PRODUCT: "Produits",
  SHIPPING: "Transport et douane",
};

/** Libellés identiques à ceux du backend (orderFlow.ts). */
export const TRACKING_LABELS: Record<TrackingStatus, string> = {
  ORDER_VALIDATED: "Commande validée",
  PURCHASED: "Produit acheté",
  PREPARING: "En préparation",
  IN_CHINA: "En Chine",
  IN_TRANSIT: "En transit",
  ARRIVED_DRC: "Arrivé en RDC",
  OUT_FOR_DELIVERY: "En cours de livraison",
  DELIVERED: "Livré",
};

/** Un article avec un devis est un article importé (même règle que le backend). */
export function orderKind(items: Array<{ quoteId: string | null }>): OrderKind {
  const imported = items.filter((item) => item.quoteId !== null).length;
  if (imported === 0) return "LOCAL";
  return imported === items.length ? "INTERNATIONAL" : "MIXED";
}

export const KIND_LABEL: Record<OrderKind, string> = { LOCAL: "Local", INTERNATIONAL: "Import", MIXED: "Local + import" };

const LOCAL_STEPS: TrackingStatus[] = ["ORDER_VALIDATED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"];
const IMPORT_STEPS: TrackingStatus[] = ["ORDER_VALIDATED", "PURCHASED", "IN_CHINA", "IN_TRANSIT", "ARRIVED_DRC", "DELIVERED"];

/** Étapes affichées, d'après les parcours du backend. La livraison à domicile (importé) n'apparaît que si elle a eu lieu. */
export function timelineSteps(kind: OrderKind, events: Array<{ status: TrackingStatus }>): TrackingStatus[] {
  if (kind === "LOCAL") return LOCAL_STEPS;
  return events.some((e) => e.status === "OUT_FOR_DELIVERY")
    ? [...IMPORT_STEPS.slice(0, 5), "OUT_FOR_DELIVERY", "DELIVERED"]
    : IMPORT_STEPS;
}