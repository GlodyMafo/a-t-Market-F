"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FormAlert } from "@/components/forms/FormAlert";
import { TextField } from "@/components/forms/TextField";
import { addressSchema, toAddressBody, type AddressValues } from "@/features/account/schemas";
import { useAddressMutations } from "@/features/account/hooks";
import { useSession } from "@/features/authentication/session.store";
import { errorMessage } from "@/services/api/errors";
import type { Address } from "@/types/domain";

interface Props {
  address?: Address;
  onSaved: (address: Address) => void;
  onCancel: () => void;
}

export function AddressForm({ address, onSaved, onCancel }: Props) {
  const user = useSession((s) => s.user);
  const { create, update } = useAddressMutations();
  const [failure, setFailure] = useState<string | null>(null);
  const editing = Boolean(address);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddressValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: address?.label ?? "",
      fullName: address?.fullName ?? [user?.firstName, user?.lastName].filter(Boolean).join(" "),
      phone: address?.phone ?? user?.phone ?? "",
      city: address?.city ?? "Lubumbashi",
      commune: address?.commune ?? "",
      neighborhood: address?.neighborhood ?? "",
      street: address?.street ?? "",
      landmark: address?.landmark ?? "",
      isDefault: address?.isDefault ?? false,
    },
  });

  async function onSubmit(values: AddressValues) {
    setFailure(null);
    try {
      const saved = address
        ? await update.mutateAsync({ id: address.id, body: toAddressBody(values, "update") })
        : await create.mutateAsync(toAddressBody(values, "create") as Parameters<typeof create.mutateAsync>[0]);
      onSaved(saved);
    } catch (error) {
      setFailure(errorMessage(error));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {failure && <FormAlert>{failure}</FormAlert>}

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Nom du destinataire" autoComplete="name" error={errors.fullName?.message} {...register("fullName")} />
        <TextField label="Téléphone du destinataire" type="tel" inputMode="tel" autoComplete="tel" error={errors.phone?.message} {...register("phone")} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Ville" error={errors.city?.message} {...register("city")} />
        <TextField label="Commune (facultatif)" error={errors.commune?.message} {...register("commune")} />
      </div>
      <TextField label="Quartier" error={errors.neighborhood?.message} {...register("neighborhood")} />
      <TextField label="Avenue / rue et numéro" error={errors.street?.message} {...register("street")} />
      <TextField label="Point de repère (facultatif)" placeholder="Ex. en face de l'école…" error={errors.landmark?.message} {...register("landmark")} />
      <TextField label="Nom de l'adresse (facultatif)" placeholder="Maison, Bureau…" error={errors.label?.message} {...register("label")} />

      <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-medium">
        <input type="checkbox" className="h-5 w-5 accent-brand-500" {...register("isDefault")} />
        Utiliser comme adresse par défaut
      </label>

      <div className="flex flex-wrap justify-end gap-2">
        <button type="button" onClick={onCancel} disabled={isSubmitting} className="min-h-11 rounded-full border border-line px-5 text-sm font-semibold hover:bg-surface">
          Annuler
        </button>
        <button type="submit" disabled={isSubmitting} className="min-h-11 rounded-full bg-brand-500 px-6 text-sm font-semibold text-white motion-safe:transition hover:bg-brand-600 disabled:opacity-60 motion-safe:active:scale-95">
          {isSubmitting ? "Enregistrement…" : editing ? "Enregistrer" : "Ajouter l'adresse"}
        </button>
      </div>
    </form>
  );
}