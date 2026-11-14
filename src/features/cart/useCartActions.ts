"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useSession } from "@/features/authentication/session.store";
import { collectQuoteImages } from "@/features/international-import/images";
import { addLocalItem, mergeCartItems, removeCartItem, updateCartItem } from "@/services/api/cart";
import { errorMessage } from "@/services/api/errors";
import { resolveImageUrl } from "@/lib/utils";
import type { Product, QuotePreviewResult } from "@/types/domain";
import { useGuestCart, guestLineKey } from "./guest-cart.store";
import type { AddOutcome } from "./types";
import { CART_KEY } from "./useCart";

export function useCartActions() {
  const queryClient = useQueryClient();
  const account = useSession((s) => s.status === "authenticated");
  const [pending, setPending] = useState(0);

  const track = useCallback(async <T,>(task: () => Promise<T>): Promise<T> => {
    setPending((n) => n + 1);
    try {
      return await task();
    } finally {
      setPending((n) => n - 1);
    }
  }, []);

  const refresh = useCallback(() => queryClient.invalidateQueries({ queryKey: CART_KEY }), [queryClient]);

  const addLocal = useCallback(
    async (product: Product, quantity: number): Promise<AddOutcome> => {
      if (!account) {
        const first = [...product.images].sort((a, b) => a.position - b.position)[0]?.imageUrl ?? null;
        return useGuestCart.getState().addLocal({
          productId: product.id,
          name: product.name,
          imageUrl: first,
          quantity,
          stock: product.inventory?.quantity ?? null,
        });
      }
      return track(async () => {
        try {
          await addLocalItem({ productId: product.id, quantity });
          await refresh();
          return { ok: true } as const;
        } catch (error) {
          return { ok: false, message: errorMessage(error) } as const;
        }
      });
    },
    [account, track, refresh],
  );

  const addInternational = useCallback(
    async (
      data: QuotePreviewResult,
      extras: { options: string | undefined; variantSku: string | null; quantity: number; totalPrice: string },
    ): Promise<AddOutcome> => {
      const { preview } = data;
      if (!account) {
        return useGuestCart.getState().addInternational({
          ticket: data.ticket,
          name: preview.productName,
          imageUrl: collectQuoteImages(preview)[0] ?? null,
          productUrl: preview.productUrl,
          totalPrice: extras.totalPrice,
          isProvisional: preview.isProvisional,
          needsReview: preview.status === "PENDING_REVIEW",
          expiresAt: preview.expiresAt,
          options: extras.options ?? null,
          variantSku: extras.variantSku,
          quantity: extras.quantity,
        });
      }
      return track(async () => {
        try {
          const response = await mergeCartItems([
            {
              type: "INTERNATIONAL",
              ticket: data.ticket,
              ...(extras.options ? { options: extras.options } : {}),
              ...(extras.variantSku ? { variantSku: extras.variantSku } : {}),
              quantity: extras.quantity,
            },
          ]);
          queryClient.setQueryData(CART_KEY, response.cart);
          const result = response.results[0];
          if (!result || result.status === "REJECTED") {
            return { ok: false, message: result?.reason ?? "Ce produit n'a pas pu être ajouté." } as const;
          }
          return { ok: true, message: result.status === "ALREADY_IN_CART" ? "Ce produit est déjà dans votre panier." : undefined } as const;
        } catch (error) {
          return { ok: false, message: errorMessage(error) } as const;
        }
      });
    },
    [account, track, queryClient],
  );

  const setQuantity = useCallback(
    async (key: string, quantity: number) => {
      if (!account) {
        useGuestCart.getState().setQuantity(key, quantity);
        return;
      }
      await track(async () => {
        try {
          await updateCartItem(key, quantity);
        } catch (error) {
          toast.error(errorMessage(error));
        }
        await refresh();
      });
    },
    [account, track, refresh],
  );

  const remove = useCallback(
    async (key: string) => {
      if (!account) {
        useGuestCart.getState().remove(key);
        toast.success("Article retiré du panier.");
        return;
      }
      await track(async () => {
        try {
          await removeCartItem(key);
          toast.success("Article retiré du panier.");
        } catch (error) {
          toast.error(errorMessage(error));
        }
        await refresh();
      });
    },
    [account, track, refresh],
  );

  return { addLocal, addInternational, setQuantity, remove, pending: pending > 0 };
}

export { guestLineKey };