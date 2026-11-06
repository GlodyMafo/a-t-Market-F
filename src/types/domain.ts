import type { IsoDate, Money } from "./api";
import type {
  CartItemIssue, NotificationType, OrderStatus, PaymentStatus,
  PaymentType, ProductType, QuoteStatus, Role, TrackingStatus,
} from "./enums";

export interface SessionUser {
  id: string;
  email: string;
  phone: string | null;
  role: Role;
}
export interface AuthResult {
  user: SessionUser;
  token: string;
}

export interface ProductImage { id: string; productId: string; imageUrl: string; position: number }
export interface Inventory { id: string; productId: string; quantity: number }

/** Produit tel que renvoyé par le catalogue public : `price` est le prix FINAL (marge déjà incluse, jamais exposée). */
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: Money;
  currency: string;
  type: ProductType;
  isActive: boolean;
  images: ProductImage[];
  inventory: Inventory | null;
  categoryId: string | null;
  subCategoryId: string | null;
  subCategory: ({ id: string; name: string; categoryId: string; category: { id: string; name: string } } & Record<string, unknown>) | null;
  createdAt: IsoDate;
}

export interface QuotePreview {
  productUrl: string;
  productName: string;
  imageUrl: string | null;
  currency: "USD";
  productPrice: Money;
  shippingCost: Money;
  customsCost: Money;
  commissionCost: Money;
  fixedFee: Money;
  totalPrice: Money;
  isProvisional: boolean;
  weightKg: Money | null;
  weightSource: "EXTRACTED" | "CATALOG_ESTIMATE" | null;
  status: "AUTO_APPROVED" | "PENDING_REVIEW";
  notice: string | null;
  inStock: boolean;
  expiresAt: IsoDate;
}
export interface QuotePreviewResult { ticket: string; preview: QuotePreview }

export interface Payment {
  id: string;
  orderId: string;
  amount: Money;
  type: PaymentType;
  status: PaymentStatus;
  providerReference: string | null;
  createdAt: IsoDate;
}

export interface TrackingEvent {
  id: string;
  status: TrackingStatus;
  message: string | null;
  createdAt: IsoDate;
  label?: string; // présent sur GET /api/tracking/order/:orderId
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string | null;
  quoteId: string | null;
  quoteSnapshot: unknown | null;
  quantity: number;
  price: Money;
  /** @deprecated Ne pas utiliser : champs internes à retirer côté backend (Lot B). */
  basePrice?: Money;
  /** @deprecated Idem. */
  margin?: Money;
  product: (Pick<Product, "id" | "name" | "images"> & Record<string, unknown>) | null;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  productsAmount: Money;
  shippingAmount: Money;
  totalAmount: Money;
  createdAt: IsoDate;
  items: OrderItem[];
  payments?: Payment[];
  trackingEvents?: TrackingEvent[];
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  orderId: string | null;
  title: string;
  message: string;
  data: unknown | null;
  readAt: IsoDate | null;
  createdAt: IsoDate;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  createdAt?: IsoDate;
}

export interface SubCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  categoryId: string;
  category: Category;
}

export type { CartItemIssue, QuoteStatus };