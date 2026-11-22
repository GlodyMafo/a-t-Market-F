"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/features/authentication/session.store";
import { createAddress, deleteAddress, listAddresses, updateAddress } from "@/services/api/account";

export const ADDRESSES_KEY = ["addresses"] as const;

export function useAddresses() {
  const account = useSession((s) => s.status === "authenticated");
  return useQuery({ queryKey: ADDRESSES_KEY, queryFn: ({ signal }) => listAddresses(signal), enabled: account, staleTime: 30_000 });
}

export function useAddressMutations() {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: ADDRESSES_KEY });
  return {
    create: useMutation({ mutationFn: createAddress, onSuccess: refresh }),
    update: useMutation({ mutationFn: (v: { id: string; body: Parameters<typeof updateAddress>[1] }) => updateAddress(v.id, v.body), onSuccess: refresh }),
    remove: useMutation({ mutationFn: deleteAddress, onSuccess: refresh }),
  };
}