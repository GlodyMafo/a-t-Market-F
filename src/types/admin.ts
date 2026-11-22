import type { IsoDate, Money } from "@/types/api";
import type { OrderItem, Payment } from "@/types/domain";
import type { OrderKind } from "@/features/orders/status";
import type { OrderStatus, QuoteStatus, TrackingStatus } from "@/types/enums";

export interface AdminUserRef {
  id: string;
  email: string;
  phone: string | null;
}

export interface AdminDashboard {
  internationalToPurchase: number;
  quotesPendingReview: number;
  localToPrepare: number;
  partiallyPaid: number;
  outOfStockProducts: number;
}

export interface AdminStats {
  totalUsers: number;
  totalOrders: number;
  paidOrders: number;
  totalRevenue: number;
}

export interface AdminTrackingEvent {
  id: string;
  status: TrackingStatus;
  message: string | null;
  createdAt: IsoDate;
  actor?: { id: string; email: string } | null;
}

export interface AdminOrderListItem {
  id: string;
  status: OrderStatus;
  productsAmount: Money;
  shippingAmount: Money;
  totalAmount: Money;
  createdAt: IsoDate;
  user: AdminUserRef;
  items: Array<{ id: string; quoteId: string | null; quantity: number }>;
  payments: Payment[];
  trackingEvents: AdminTrackingEvent[];
}

export interface AdminQuote {
  id: string;
  productUrl: string;
  productName: string | null;
  options: string | null;
  productPrice: Money;
  shippingCost: Money;
  customsCost: Money;
  commissionCost: Money;
  totalPrice: Money;
  currency: string;
  status: QuoteStatus;
  productWeight: Money | null;
  weightSource: string | null;
  adminNotes: string | null;
  expiresAt: IsoDate | null;
  createdAt: IsoDate;
}

export type AdminOrderItem = Omit<OrderItem, "quoteSnapshot"> & { quote: AdminQuote | null };

export interface AdminOrderDetail {
  id: string;
  status: OrderStatus;
  productsAmount: Money;
  shippingAmount: Money;
  totalAmount: Money;
  createdAt: IsoDate;
  user: AdminUserRef;
  deliveryAddress?: unknown;
  items: AdminOrderItem[];
  payments: Payment[];
  trackingEvents: AdminTrackingEvent[];
  kind: OrderKind;
  currentTrackingStatus: TrackingStatus | null;
  /** Étapes acceptées par le backend à cet instant : l'interface ne propose rien d'autre. */
  allowedNextStatuses: TrackingStatus[];
}

export interface ToPurchaseOrder {
  id: string;
  createdAt: IsoDate;
  totalAmount: Money;
  user: AdminUserRef;
  items: Array<{ id: string; quantity: number; price: Money; quoteSnapshot: unknown }>;
}

export interface PendingQuote extends AdminQuote {
  user: AdminUserRef;
  subCategory?: { name: string; category?: { name: string } | null } | null;
}

export interface QuoteRevision {
  id: string;
  action: string;
  note: string | null;
  createdAt: IsoDate;
  admin: { id: string; email: string } | null;
  snapshotBefore: unknown;
  snapshotAfter: unknown;
}