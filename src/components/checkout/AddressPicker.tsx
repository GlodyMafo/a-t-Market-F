"use client";

import { MapPin, Plus } from "lucide-react";
import { useState } from "react";
import { Modal } from "@/components/admin/Modal";
import { AddressForm } from "@/components/account/AddressForm";
import { AddressLines } from "@/components/account/AddressLines";
import { useAddresses } from "@/features/account/hooks";
import { cn } from "@/lib/utils";
import { errorMessage } from "@/services/api/errors";
import type { Address } from "@/types/domain";

interface Props {
  value: string | null;
  onChange: (id: string) => void;
  error?: string | null;
}

export function AddressPicker({ value, onChange, error }: Props) {
  const { data, isLoading, error: loadError, refetch } = useAddresses();
  const [dialog, setDialog] = useState<{ address?: Address } | null>(null);

  if (isLoading) return <div className="skeleton h-28 rounded-2xl bg-ink/[0.06]" aria-busy="true" aria-label="Chargement des adresses" />;
  if (loadError) {
    return (
      <p role="alert" className="text-sm text-sale">
        {errorMessage(loadError)}{" "}
        <button type="button" onClick={() => refetch()} className="font-semibold underline">
          Réessayer
        </button>
      </p>
    );
  }

  const addresses = data ?? [];

  return (
    <fieldset>
      <legend className="sr-only">Adresse de livraison</legend>

      {addresses.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-line p-6 text-center">
          <MapPin className="h-6 w-6 text-brand-500" aria-hidden />
          <p className="text-sm text-muted">Ajoutez l&apos;adresse où livrer votre commande.</p>
          <button type="button" onClick={() => setDialog({})} className="min-h-11 rounded-full bg-brand-500 px-5 text-sm font-semibold text-white hover:bg-brand-600">
            Ajouter une adresse
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((address) => (
            <label
              key={address.id}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 motion-safe:transition focus-within:ring-2 focus-within:ring-brand-500",
                value === address.id ? "border-brand-500 bg-brand-50" : "border-line hover:border-brand-200",
              )}
            >
              <input type="radio" name="delivery-address" value={address.id} checked={value === address.id} onChange={() => onChange(address.id)} className="mt-1 h-4 w-4 accent-brand-500" />
              <span className="min-w-0 flex-1">
                <span className="mb-1 flex flex-wrap items-center gap-2">
                  {address.label && <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold">{address.label}</span>}
                  {address.isDefault && <span className="text-xs font-semibold text-brand-700">Par défaut</span>}
                </span>
                <AddressLines address={address} />
              </span>
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  setDialog({ address });
                }}
                className="min-h-9 shrink-0 rounded-full px-3 text-xs font-semibold text-brand-600 hover:underline"
              >
                Modifier
              </button>
            </label>
          ))}
          {addresses.length < 10 && (
            <button type="button" onClick={() => setDialog({})} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-600 hover:underline">
              <Plus className="h-4 w-4" aria-hidden /> Ajouter une autre adresse
            </button>
          )}
        </div>
      )}

      {error && (
        <p role="alert" className="mt-2 text-xs text-sale">
          {error}
        </p>
      )}

      <Modal open={dialog !== null} onClose={() => setDialog(null)} title={dialog?.address ? "Modifier l'adresse" : "Nouvelle adresse"} wide>
        {dialog && (
          <AddressForm
            address={dialog.address}
            onCancel={() => setDialog(null)}
            onSaved={(saved) => {
              onChange(saved.id); // la nouvelle adresse (ou celle modifiée) est sélectionnée aussitôt
              setDialog(null);
            }}
          />
        )}
      </Modal>
    </fieldset>
  );
}