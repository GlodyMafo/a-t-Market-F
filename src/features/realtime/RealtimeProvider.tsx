
"use client";

import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { toast } from "sonner";
import { z } from "zod";
import { useSession } from "@/features/authentication/session.store";
import { notificationHref } from "@/features/notifications/links";
import { env } from "@/lib/env";
import { tokenStorage } from "@/lib/token-storage";

// On ne lit que ces champs, tous traités comme du texte brut.
const payloadSchema = z.object({
  id: z.string().max(100),
  type: z.string().max(60),
  orderId: z.string().max(100).nullable().optional(),
  title: z.string().max(200),
  message: z.string().max(1000),
});

/**
 * Connexion Socket.io : à chaque notification, les données concernées sont relues et un message s'affiche.
 * Sans connexion temps réel, les pages se mettent quand même à jour (relecture périodique et au retour sur l'onglet).
 */
export function RealtimeProvider() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const status = useSession((s) => s.status);

  // Valeurs courantes lues par le gestionnaire sans relancer la connexion.
  const routerRef = useRef(router);
  const pathRef = useRef(pathname);

  useEffect(() => {
    routerRef.current = router;
    pathRef.current = pathname;
  });

  useEffect(() => {
    if (status !== "authenticated") return;

    const token = tokenStorage.get();
    if (!token) return;

    const socket = io(env.apiUrl, {
      auth: { token },
      reconnectionDelayMax: 15_000,
    });

    socket.on("notification", (raw: unknown) => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      void queryClient.invalidateQueries({ queryKey: ["orders"] });

      const parsed = payloadSchema.safeParse(raw);
      if (!parsed.success) return;

      const notification = parsed.data;

      if (notification.orderId) {
        void queryClient.invalidateQueries({
          queryKey: ["order", notification.orderId],
        });
        void queryClient.invalidateQueries({
          queryKey: ["tracking", notification.orderId],
        });
      }

      // Devis : le panier du client et les compteurs de l'administrateur se mettent à jour sans recharger.
      if (
        notification.type === "QUOTE_APPROVED" ||
        notification.type === "QUOTE_REJECTED"
      ) {
        void queryClient.invalidateQueries({ queryKey: ["cart"] });
      }

      if (notification.type === "QUOTE_PENDING_REVIEW") {
        void queryClient.invalidateQueries({ queryKey: ["admin"] });
      }

      // Déjà visible sur la page d'historique : pas de message en plus.
      if (
        pathRef.current.startsWith("/account/notifications") ||
        pathRef.current.startsWith("/admin/notifications")
      ) {
        return;
      }

      const show =
        notification.type === "PAYMENT_CONFIRMED" ||
        notification.type === "QUOTE_APPROVED"
          ? toast.success
          : notification.type === "PAYMENT_FAILED" ||
              notification.type === "ORDER_CANCELLED" ||
              notification.type === "QUOTE_REJECTED"
            ? toast.error
            : toast.info;

      const href = notificationHref(
        notification.type,
        notification.orderId,
      );

      show(notification.title, {
        id: notification.id,
        description: notification.message,
        action: href
          ? {
              label: "Voir",
              onClick: () => routerRef.current.push(href),
            }
          : undefined,
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [status, queryClient]);

  return null;
}
