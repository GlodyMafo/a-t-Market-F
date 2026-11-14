"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/features/authentication/session.store";
import { getCart } from "@/services/api/cart";
import { useGuestCart } from "./guest-cart.store";
import { CART_KEY } from "./useCart";

/** Léger : réutilise la même requête que la page panier, sans relire les produits. */
export function useCartCount(): number {
  const account = useSession((s) => s.status === "authenticated");
  const guestCount = useGuestCart((s) => s.lines.reduce((sum, l) => sum + l.quantity, 0));
  const { data } = useQuery({
    queryKey: CART_KEY,
    queryFn: ({ signal }) => getCart(signal),
    enabled: account,
    staleTime: 15_000,
    select: (cart) => cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
  });
  return account ? (data ?? 0) : guestCount;
}