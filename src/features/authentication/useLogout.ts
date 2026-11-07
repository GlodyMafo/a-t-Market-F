"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { toast } from "sonner";
import { useSession } from "./session.store";

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useCallback(() => {
    useSession.getState().clear();
    queryClient.clear(); // efface les données privées en cache
    router.push("/");
    toast.success("Vous êtes déconnecté.");
  }, [queryClient, router]);
}