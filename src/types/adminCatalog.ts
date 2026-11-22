import type { IsoDate, Money } from "@/types/api";
import type { ProductImage } from "@/types/domain";
import type { ProductType } from "@/types/enums";

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: Money; // prix d'achat
  margin: Money;
  currency: string;
  type: ProductType;
  isActive: boolean;
  subCategoryId: string | null;
  images: ProductImage[];
  inventory: { id: string; quantity: number } | null;
  createdAt: IsoDate;
}

export interface DeleteProductResult {
  deleted: boolean;
  archived: boolean;
  message: string;
}

export interface InventoryRow {
  id: string;
  productId: string;
  quantity: number;
  updatedAt: IsoDate;
  product: { id: string; name: string; isActive: boolean; images: ProductImage[] };
}

export interface StockMovement {
  id: string;
  productId: string;
  quantity: number;
  type: string;
  reason: string | null;
  createdAt: IsoDate;
}

export interface AdminSubCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  categoryId: string;
  _count: { products: number };
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  subCategories: AdminSubCategory[];
}

export interface AdminSettings {
  commissionRate: string | number;
  chinaPricePerKg: string | number;
  fixedFee: string | number;
  aedToUsdRate: string | number | null;
  cnyToUsdRate: string | number | null;
  autoApproveMaxUsd?: string | number | null;
}