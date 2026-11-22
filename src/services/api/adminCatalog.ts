import { env } from "@/lib/env";
import { tokenStorage } from "@/lib/token-storage";
import type { PageMeta } from "@/types/api";
import type {
  AdminCategory, AdminProduct, AdminSettings, DeleteProductResult, InventoryRow, StockMovement,
} from "@/types/adminCatalog";
import { api } from "./client";
import { endpoints } from "./endpoints";
import { ApiError, kindFromStatus } from "./errors";

const authed = { auth: "required" as const };

// ---- Produits ----
export async function listAdminProducts(page: number, limit: number, signal?: AbortSignal) {
  const { data, meta } = await api.get<AdminProduct[]>(endpoints.admin.products, { query: { page, limit }, ...authed, signal });
  return { items: data, meta: meta as PageMeta | undefined };
}

export async function getAdminProduct(id: string, signal?: AbortSignal) {
  return (await api.get<AdminProduct>(endpoints.admin.product(id), { ...authed, signal })).data;
}

export interface ProductBody {
  name: string;
  description?: string;
  price: number;
  margin: number;
  images: string[];
  subCategoryId: string;
}

export async function createAdminProduct(body: ProductBody) {
  return (await api.post<AdminProduct>(endpoints.admin.products, body, authed)).data;
}

export async function updateAdminProduct(id: string, body: Partial<ProductBody>) {
  return (await api.patch<AdminProduct>(endpoints.admin.product(id), body, authed)).data;
}

export async function toggleAdminProduct(id: string) {
  return (await api.patch<AdminProduct>(endpoints.admin.productToggle(id), undefined, authed)).data;
}

export async function deleteAdminProduct(id: string) {
  return (await api.delete<DeleteProductResult>(endpoints.admin.product(id), authed)).data;
}

// ---- Stock ----
export async function listInventory(page: number, limit: number, signal?: AbortSignal) {
  const { data, meta } = await api.get<InventoryRow[]>(endpoints.admin.inventory, { query: { page, limit }, ...authed, signal });
  return { items: data, meta: meta as PageMeta | undefined };
}

export async function setStock(productId: string, quantity: number) {
  return (await api.patch<unknown>(endpoints.admin.inventoryItem(productId), { quantity }, authed)).data;
}

export async function restockProduct(productId: string, quantity: number, reason?: string) {
  return (await api.post<unknown>(endpoints.admin.inventoryRestock(productId), { quantity, ...(reason ? { reason } : {}) }, authed)).data;
}

export async function listMovements(productId: string, signal?: AbortSignal) {
  return (await api.get<StockMovement[]>(endpoints.admin.inventoryMovements(productId), { ...authed, signal })).data;
}

// ---- Catégories ----
export async function listAdminCategories(signal?: AbortSignal) {
  return (await api.get<AdminCategory[]>(endpoints.admin.categories, { ...authed, signal })).data;
}

export async function createCategory(body: { name: string; description?: string }) {
  return (await api.post<unknown>(endpoints.categories.list, body, authed)).data;
}

export async function updateCategory(id: string, body: { name?: string; description?: string | null }) {
  return (await api.patch<unknown>(endpoints.categories.detail(id), body, authed)).data;
}

export async function setCategoryActive(id: string, isActive: boolean) {
  return (await api.patch<unknown>(endpoints.categories.active(id), { isActive }, authed)).data;
}

export async function createSubCategory(body: { name: string; categoryId: string; description?: string }) {
  return (await api.post<unknown>(endpoints.subCategories.list, body, authed)).data;
}

export async function updateSubCategory(id: string, body: { name?: string; description?: string | null }) {
  return (await api.patch<unknown>(endpoints.subCategories.detail(id), body, authed)).data;
}

export async function setSubCategoryActive(id: string, isActive: boolean) {
  return (await api.patch<unknown>(endpoints.subCategories.active(id), { isActive }, authed)).data;
}

// ---- Réglages ----
export async function getAdminSettings(signal?: AbortSignal) {
  return (await api.get<AdminSettings>(endpoints.admin.settings, { ...authed, signal })).data;
}

export async function updateAdminSettings(body: Partial<Record<keyof AdminSettings, number | null>>) {
  return (await api.patch<AdminSettings>(endpoints.admin.settings, body, authed)).data;
}

// ---- Envoi d'une image (corps brut, pas de JSON) ----
export async function uploadImage(blob: Blob): Promise<string> {
  const token = tokenStorage.get();
  let response: Response;
  try {
    response = await fetch(`${env.apiUrl}${endpoints.admin.uploads}`, {
      method: "POST",
      headers: { "Content-Type": blob.type, Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: blob,
    });
  } catch {
    throw new ApiError("Impossible de joindre le serveur. Vérifiez votre connexion.", "network");
  }
  const json = (await response.json().catch(() => null)) as { success?: boolean; message?: string; data?: { url?: string } } | null;
  if (response.status === 404) {
    throw new ApiError("L'envoi d'images n'est pas disponible sur le serveur : collez l'adresse d'une image.", "not_found", 404);
  }
  if (!response.ok || !json?.success || !json.data?.url) {
    throw new ApiError(json?.message ?? "L'envoi de l'image a échoué.", kindFromStatus(response.status), response.status);
  }
  return json.data.url;
}