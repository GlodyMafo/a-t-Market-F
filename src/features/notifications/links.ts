/** Page à ouvrir pour une notification : commande, panier (devis) ou file de validation (administrateurs). */
export function notificationHref(type: string, orderId?: string | null): string | null {
  if (type === "QUOTE_PENDING_REVIEW") return "/admin/quotes";
  if (type === "QUOTE_APPROVED" || type === "QUOTE_REJECTED") return "/cart";
  return orderId ? `/account/orders/${encodeURIComponent(orderId)}` : null;
}