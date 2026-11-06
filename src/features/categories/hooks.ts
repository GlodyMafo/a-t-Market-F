import { useQuery } from "@tanstack/react-query";
import { listCategories } from "@/services/api/catalog";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: ({ signal }) => listCategories(signal),
    staleTime: 5 * 60_000,
  });
}