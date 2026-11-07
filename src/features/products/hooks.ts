import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getProduct, listProducts, type ProductListParams } from "@/services/api/catalog";

export function useProducts(params: ProductListParams) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: ({ signal }) => listProducts(params, signal),
    placeholderData: keepPreviousData,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: ({ signal }) => getProduct(id, signal),
  });
}