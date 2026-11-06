export type Role = "USER" | "ADMIN";
export type ProductType = "LOCAL" | "INTERNATIONAL";
export type OrderStatus = "PENDING_PAYMENT" | "PARTIALLY_PAID" | "PAID" | "DELIVERED" | "CANCELLED";
export type PaymentStatus = "PENDING" | "PARTIAL" | "PAID" | "FAILED" | "EXPIRED" | "REFUNDED";
export type PaymentType = "PRODUCT" | "SHIPPING" | "FULL";
export type TrackingStatus =
  | "ORDER_VALIDATED" | "PURCHASED" | "PREPARING" | "IN_CHINA"
  | "IN_TRANSIT" | "ARRIVED_DRC" | "OUT_FOR_DELIVERY" | "DELIVERED";
export type QuoteStatus = "AUTO_APPROVED" | "PENDING_REVIEW" | "APPROVED" | "REJECTED";
export type NotificationType =
  | "PAYMENT_CONFIRMED" | "PAYMENT_FAILED" | "ORDER_STATUS_CHANGED" | "ORDER_CREATED" | "ORDER_CANCELLED";
export type Marketplace = "SHEIN" | "NOON" | "1688";
export type MobileMoneyProvider = "AIRTEL" | "MTN" | "ORANGE" | "VODACOM";
export type CatalogSort = "relevance" | "newest" | "price_asc" | "price_desc" | "name_asc";
export type CartItemIssue =
  | "UNAVAILABLE" | "OUT_OF_STOCK" | "BELOW_MINIMUM_ORDER"
  | "PRICING_SETTINGS_MISSING" | "PRICING_LIMIT_EXCEEDED" | (string & {});