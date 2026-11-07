import type { QuoteStatus } from "@/types/enums";

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, { label: string; className: string }> = {
  AUTO_APPROVED: { label: "Prêt", className: "bg-green-50 text-green-700" },
  PENDING_REVIEW: { label: "En vérification", className: "bg-amber-50 text-amber-700" },
  APPROVED: { label: "Validé", className: "bg-green-50 text-green-700" },
  REJECTED: { label: "Refusé", className: "bg-red-50 text-sale" },
};