import { useQuery } from "@tanstack/react-query";
import { listCategories, listSubCategories } from "@/services/api/catalog";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: ({ signal }) => listCategories(signal),
    staleTime: 5 * 60_000,
  });
}

export function useSubCategories() {
  return useQuery({
    queryKey: ["subcategories"],
    queryFn: ({ signal }) => listSubCategories(signal),
    staleTime: 5 * 60_000,
  });
}