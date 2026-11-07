"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, type ReactNode } from "react";
import { toast } from "sonner";
import { tokenStorage } from "@/lib/token-storage";
import { fetchMe } from "@/services/api/auth";
import { setUnauthorizedHandler } from "@/services/api/client";
import { ApiError } from "@/services/api/errors";
import { useSession } from "./session.store";

export function SessionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Le backend rejette le jeton (expiré ou invalide) : on ferme la session.
    setUnauthorizedHandler(() => {
      if (useSession.getState().status === "authenticated") {
        toast.info("Votre session a expiré. Reconnectez-vous.");
      }
      useSession.getState().clear();
      queryClient.clear();
    });

    const controller = new AbortController();

    if (!tokenStorage.get()) {
      useSession.getState().setAnonymous();
    } else {
      fetchMe(controller.signal)
        .then((user) => useSession.getState().setUser(user))
        .catch((error: unknown) => {
          if (controller.signal.aborted) return;
          if (error instanceof ApiError && (error.kind === "unauthorized" || error.kind === "not_found")) {
            useSession.getState().clear(); // jeton refusé ou compte supprimé
          } else {
            // Réseau ou serveur indisponible : on garde le jeton pour réessayer au prochain chargement.
            useSession.getState().setAnonymous();
          }
        });
    }

    return () => {
      controller.abort();
      setUnauthorizedHandler(null);
    };
  }, [queryClient]);

  return <>{children}</>;
}