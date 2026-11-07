"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { Toaster } from "sonner";
import { ApiError } from "@/services/api/errors";
import { SessionProvider } from "@/features/authentication/SessionProvider";

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: (count, error) => (error instanceof ApiError ? error.retryable && count < 2 : count < 1),
          },
          // Jamais de nouvelle tentative automatique sur une action (paiement, commande…).
          mutations: { retry: false },
        },
      }),
  );
  return (
    <QueryClientProvider client={client}>
      <SessionProvider>{children}</SessionProvider>
      <Toaster position="top-center" richColors closeButton />
    </QueryClientProvider>
  );
}

