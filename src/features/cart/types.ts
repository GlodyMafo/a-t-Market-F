import type { IsoDate, Money } from "@/types/api";
import type { ProductImage } from "@/types/domain";
import type { QuoteStatus } from "@/types/enums";

export type CartKind = "LOCAL" | "INTERNATIONAL";

/** Ligne affichée dans le panier, identique pour un invité et pour un compte connecté. */
export interface CartLine {
  key: string;
  kind: CartKind;
  name: string;
  imageUrl: string | null;
  /** Fiche produit (local) ou lien chez la boutique (importé). */
  href: string | null;
  sourceHost: string | null;
  marketplace: string | null;
  unitPrice: Money | null;
  lineTotal: Money | null;
  quantity: number;
  maxQuantity: number | null;
  quantityEditable: boolean;
  options: string | null;
  payable: boolean;
  issue: string | null;
  issueMessage: string | null;
  needsReview: boolean;
  expiresAt: IsoDate | null;
}

// ---- Réponses du backend (champs utilisés uniquement) ----
export interface ServerCartProduct {
  id: string;
  name: string;
  images?: ProductImage[];
  inventory?: { quantity: number } | null;
}

export interface ServerCartQuote {
  id: string;
  status: QuoteStatus;
  productUrl: string;
  productName: string | null;
  options: string | null;
  imageUrl?: string | null;
  totalPrice: Money;
  expiresAt: IsoDate | null;
}

export interface ServerCartItem {
  id: string;
  quantity: number;
  kind: CartKind;
  payable: boolean;
  issue: string | null;
  product?: ServerCartProduct | null;
  quote?: ServerCartQuote | null;
  minimumOrderMessage?: string | null;
  cartPricing?: { totalPrice: Money } | null;
  /** Présents après la correction backend (section 1). */
  unitPrice?: Money;
  lineTotal?: Money;
}

export interface ServerCart {
  id: string;
  items: ServerCartItem[];
  checkoutReady: boolean;
  estimatedTotal: Money;
}

export interface MergeItemResult {
  index: number;
  type: CartKind;
  status: "ADDED" | "MERGED" | "ADJUSTED" | "ALREADY_IN_CART" | "REJECTED";
  reason?: string;
  quantity?: number;
}

export interface MergeResponse {
  results: MergeItemResult[];
  cart: ServerCart;
}

export type MergeItem =
  | { type: "LOCAL"; productId: string; quantity: number }
  | { type: "INTERNATIONAL"; ticket: string; options?: string; quantity: number, variantSku?: string; };

export type AddOutcome = { ok: true; message?: string } | { ok: false; message: string };