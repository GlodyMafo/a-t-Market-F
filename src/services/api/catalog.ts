import type { CatalogSort } from "@/types/enums";
import type { PageMeta } from "@/types/api";
import type { Category, Product } from "@/types/domain";
import { api } from "./client";
import { endpoints } from "./endpoints";

export type ProductListParams = {
  q?: string;
  categoryId?: string;
  subCategoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: CatalogSort;
  page?: number;
  limit?: number;
};

export async function listProducts(params: ProductListParams = {}, signal?: AbortSignal) {
  const { data, meta } = await api.get<Product[]>(endpoints.products.list, {
    query: params,
    signal,
    auth: "none",
  });
  return { items: data, meta: meta as PageMeta | undefined };
}

export async function listCategories(signal?: AbortSignal) {
  const { data } = await api.get<Category[]>(endpoints.categories.list, { signal, auth: "none" });
  return data;
}