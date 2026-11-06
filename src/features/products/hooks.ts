import { useQuery } from "@tanstack/react-query";
import { listProducts, type ProductListParams } from "@/services/api/catalog";

export function useProducts(params: ProductListParams) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: ({ signal }) => listProducts(params, signal),
  });
}