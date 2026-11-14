import { Ban, FileCheck2, FileClock, FileX2, Bell, CheckCircle2, ShoppingBag, Truck, XCircle, type LucideIcon } from "lucide-react";
import type { Tone } from "@/features/orders/status";
import type { NotificationType } from "@/types/enums";

export const FALLBACK_STYLE: { icon: LucideIcon; tone: Tone } = { icon: Bell, tone: "info" };

export const NOTIFICATION_STYLE: Record<NotificationType, { icon: LucideIcon; tone: Tone }> = {
  PAYMENT_CONFIRMED: { icon: CheckCircle2, tone: "success" },
  PAYMENT_FAILED: { icon: XCircle, tone: "danger" },
  ORDER_STATUS_CHANGED: { icon: Truck, tone: "info" },
  ORDER_CREATED: { icon: ShoppingBag, tone: "info" },
  ORDER_CANCELLED: { icon: Ban, tone: "danger" },
  QUOTE_PENDING_REVIEW: { icon: FileClock, tone: "warn" },
  QUOTE_APPROVED: { icon: FileCheck2, tone: "success" },
  QUOTE_REJECTED: { icon: FileX2, tone: "danger" },
};