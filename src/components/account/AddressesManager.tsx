"use client";

import { MapPin, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/admin/Modal";
import { AddressForm } from "@/components/account/AddressForm";
import { AddressLines } from "@/components/account/AddressLines";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useAddressMutations, useAddresses } from "@/features/account/hooks";
import { errorMessage } from "@/services/api/errors";
import type { Address } from "@/types/domain";

const MAX_ADDRESSES = 10;

type Dialog = { kind: "form"; address?: Address } | { kind: "delete"; address: Address } | null;

export function AddressesManager() {
  const { data, isLoading, error, refetch } = useAddresses();
  const { update, remove } = useAddressMutations();
  const [dialog, setDialog] = useState<Dialog>(null);
  const close = () => setDialog(null);
  const full = (data?.length ?? 0) >= MAX_ADDRESSES;

  return (
    <section aria-labelledby="addresses-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 id="addresses-title" className="font-display text-2xl font-extrabold tracking-tight">
            Mes adresses
          </h1>
          <p className="mt-1 text-sm text-muted">Adresses de livraison enregistrées ({data?.length ?? 0}/{MAX_ADDRESSES}).</p>
        </div>
        <button
          type="button"
          disabled={full}
          onClick={() => setDialog({ kind: "form" })}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand-500 px-5 text-sm font-semibold text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" aria-hidden /> Ajouter une adresse
        </button>
      </div>

      {isLoading && <div className="skeleton mt-5 h-40 rounded-3xl bg-ink/[0.06]" aria-busy="true" aria-label="Chargement des adresses" />}
      {error && <ErrorState title="Impossible de charger vos adresses" message={errorMessage(error)} onRetry={() => refetch()} />}
      {data && data.length === 0 && (
        <EmptyState
          icon={MapPin}
          title="Aucune adresse enregistrée"
          message="Ajoutez une adresse pour pouvoir passer commande."
          actionLabel="Ajouter une adresse"
          onAction={() => setDialog({ kind: "form" })}
        />
      )}

      <ul className="mt-5 grid gap-4 md:grid-cols-2">
        {data?.map((address) => (
          <li key={address.id} className="flex flex-col justify-between rounded-3xl border border-line bg-white p-5">
            <div>
              <div className="mb-2 flex items-center gap-2">
                {address.label && <span className="rounded-full bg-surface px-2.5 py-0.5 text-xs font-bold">{address.label}</span>}
                {address.isDefault && <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-700">Par défaut</span>}
              </div>
              <AddressLines address={address} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-3">
              <button type="button" onClick={() => setDialog({ kind: "form", address })} className="min-h-9 rounded-full border border-line px-3 text-xs font-semibold hover:bg-surface">
                Modifier
              </button>
              {!address.isDefault && (
                <button
                  type="button"
                  disabled={update.isPending}
                  onClick={() =>
                    update.mutate(
                      { id: address.id, body: { isDefault: true } },
                      { onSuccess: () => toast.success("Adresse par défaut mise à jour."), onError: (e) => toast.error(errorMessage(e)) },
                    )
                  }
                  className="min-h-9 rounded-full border border-line px-3 text-xs font-semibold hover:bg-surface disabled:opacity-50"
                >
                  Définir par défaut
                </button>
              )}
              <button type="button" onClick={() => setDialog({ kind: "delete", address })} className="min-h-9 rounded-full px-3 text-xs font-semibold text-sale hover:bg-red-50">
                Supprimer
              </button>
            </div>
          </li>
        ))}
      </ul>

      <Modal open={dialog?.kind === "form"} onClose={close} title={dialog?.kind === "form" && dialog.address ? "Modifier l'adresse" : "Nouvelle adresse"} wide>
        {dialog?.kind === "form" && (
          <AddressForm
            address={dialog.address}
            onCancel={close}
            onSaved={() => {
              toast.success("Adresse enregistrée.");
              close();
            }}
          />
        )}
      </Modal>

      <Modal open={dialog?.kind === "delete"} onClose={close} title="Supprimer l'adresse">
        {dialog?.kind === "delete" && (
          <div className="space-y-4">
            <p className="text-sm">Supprimer cette adresse ? Les commandes déjà passées gardent leur adresse de livraison.</p>
            <AddressLines address={dialog.address} />
            <div className="flex flex-wrap justify-end gap-2">
              <button type="button" onClick={close} disabled={remove.isPending} className="min-h-11 rounded-full border border-line px-5 text-sm font-semibold hover:bg-surface">
                Annuler
              </button>
              <button
                type="button"
                disabled={remove.isPending}
                onClick={() =>
                  remove.mutate(dialog.address.id, {
                    onSuccess: () => {
                      toast.success("Adresse supprimée.");
                      close();
                    },
                    onError: (e) => toast.error(errorMessage(e)),
                  })
                }
                className="min-h-11 rounded-full bg-sale px-5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
              >
                {remove.isPending ? "Suppression…" : "Supprimer"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}