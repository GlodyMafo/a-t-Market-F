"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { CART_KEY } from "@/features/cart/useCart";
import { ApiError, errorMessage } from "@/services/api/errors";
import { createOrder } from "@/services/api/orders";
import { createPayment } from "@/services/api/payments";
import type { MobileMoneyProvider, PaymentType } from "@/types/enums";
import { rememberOrder } from "./pending-order";

interface PayInput {
  /** Absent : on crée d'abord la commande depuis le panier. Présent : on réessaie sur la commande existante. */
  orderId?: string;
  provider: MobileMoneyProvider;
  phone: string;
  paymentType?: PaymentType;
}

export function usePayment() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lock = useRef(false); // un seul envoi à la fois, même en cas de double clic

  const pay = useCallback(
    async ({ orderId: existing, provider, phone, paymentType = "FULL" }: PayInput) => {
      if (lock.current) return;
      lock.current = true;
      setPending(true);
      setError(null);

      let orderId = existing;
      const createdHere = !existing;

      try {
        if (!orderId) {
          const order = await createOrder();
          orderId = order.id;
          rememberOrder(orderId);
          void queryClient.invalidateQueries({ queryKey: CART_KEY }); // le backend a vidé le panier
        }

        try {
          await createPayment({ orderId, paymentType, phoneNumber: phone, provider });
        } catch (paymentError) {
          // Un paiement du même type est déjà en cours : on suit simplement celui-là.
          const alreadyPending = paymentError instanceof ApiError && /existe d[ée]j[àa]/i.test(paymentError.message);
          if (!alreadyPending) throw paymentError;
        }

        await queryClient.invalidateQueries({ queryKey: ["order", orderId] });
        router.push(`/checkout/confirmation/${encodeURIComponent(orderId)}`);
      } catch (failure) {
        const message = errorMessage(failure);
        if (createdHere && orderId) {
          // La commande existe mais le paiement n'a pas démarré : la page de suivi permet de réessayer.
          toast.error(message);
          router.push(`/checkout/confirmation/${encodeURIComponent(orderId)}`);
        } else {
          setError(message);
        }
      } finally {
        lock.current = false;
        setPending(false);
      }
    },
    [queryClient, router],
  );

  return { pay, pending, error, clearError: () => setError(null) };
}