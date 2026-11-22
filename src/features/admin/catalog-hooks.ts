"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdminProduct, createCategory, createSubCategory, deleteAdminProduct, getAdminProduct, getAdminSettings,
  listAdminCategories, listAdminProducts, listInventory, listMovements, restockProduct, setCategoryActive, setStock,
  setSubCategoryActive, toggleAdminProduct, updateAdminProduct, updateAdminSettings, updateCategory, updateSubCategory,
} from "@/services/api/adminCatalog";
import { ADMIN_KEY } from "./hooks";

export function useAdminProducts(page: number, limit = 20) {
  return useQuery({
    queryKey: [...ADMIN_KEY, "products", page, limit],
    queryFn: ({ signal }) => listAdminProducts(page, limit, signal),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });
}

export function useAdminProduct(id: string) {
  return useQuery({ queryKey: [...ADMIN_KEY, "product", id], queryFn: ({ signal }) => getAdminProduct(id, signal), staleTime: 0 });
}

export function useAdminInventory(page: number, limit = 50) {
  return useQuery({
    queryKey: [...ADMIN_KEY, "inventory", page, limit],
    queryFn: ({ signal }) => listInventory(page, limit, signal),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });
}

export function useMovements(productId: string, enabled: boolean) {
  return useQuery({ queryKey: [...ADMIN_KEY, "movements", productId], queryFn: ({ signal }) => listMovements(productId, signal), enabled, retry: false });
}

export function useAdminCategories() {
  return useQuery({ queryKey: [...ADMIN_KEY, "categories"], queryFn: ({ signal }) => listAdminCategories(signal), staleTime: 15_000 });
}

export function useAdminSettings() {
  return useQuery({ queryKey: [...ADMIN_KEY, "settings"], queryFn: ({ signal }) => getAdminSettings(signal), staleTime: 0 });
}

/** Chaque modification relit l'espace administrateur ET le catalogue public (boutique, filtres, compteurs). */
export function useCatalogMutations() {
  const queryClient = useQueryClient();
  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ADMIN_KEY }),
      queryClient.invalidateQueries({ queryKey: ["products"] }),
      queryClient.invalidateQueries({ queryKey: ["product"] }),
      queryClient.invalidateQueries({ queryKey: ["categories"] }),
      queryClient.invalidateQueries({ queryKey: ["subcategories"] }),
    ]);
  };
  const options = { onSuccess: refresh };

  return {
    createProduct: useMutation({ mutationFn: createAdminProduct, ...options }),
    updateProduct: useMutation({ mutationFn: (v: { id: string; body: Parameters<typeof updateAdminProduct>[1] }) => updateAdminProduct(v.id, v.body), ...options }),
    toggleProduct: useMutation({ mutationFn: toggleAdminProduct, ...options }),
    deleteProduct: useMutation({ mutationFn: deleteAdminProduct, ...options }),
    setStock: useMutation({ mutationFn: (v: { productId: string; quantity: number }) => setStock(v.productId, v.quantity), ...options }),
    restock: useMutation({ mutationFn: (v: { productId: string; quantity: number; reason?: string }) => restockProduct(v.productId, v.quantity, v.reason), ...options }),
    createCategory: useMutation({ mutationFn: createCategory, ...options }),
    updateCategory: useMutation({ mutationFn: (v: { id: string; body: Parameters<typeof updateCategory>[1] }) => updateCategory(v.id, v.body), ...options }),
    setCategoryActive: useMutation({ mutationFn: (v: { id: string; isActive: boolean }) => setCategoryActive(v.id, v.isActive), ...options }),
    createSubCategory: useMutation({ mutationFn: createSubCategory, ...options }),
    updateSubCategory: useMutation({ mutationFn: (v: { id: string; body: Parameters<typeof updateSubCategory>[1] }) => updateSubCategory(v.id, v.body), ...options }),
    setSubCategoryActive: useMutation({ mutationFn: (v: { id: string; isActive: boolean }) => setSubCategoryActive(v.id, v.isActive), ...options }),
    updateSettings: useMutation({ mutationFn: updateAdminSettings, ...options }),
  };
}