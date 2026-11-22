"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormAlert } from "@/components/forms/FormAlert";
import { SelectField } from "@/components/forms/SelectField";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { TextField } from "@/components/forms/TextField";
import { cleanPhone } from "@/features/authentication/schemas";
import { useSession } from "@/features/authentication/session.store";
import { profileSchema, type ProfileValues } from "@/features/account/schemas";
import { errorMessage } from "@/services/api/errors";
import { updateProfile, type ProfileBody } from "@/services/api/account";

const today = () => new Date().toISOString().slice(0, 10);

export function ProfileForm() {
  const user = useSession((s) => s.user);
  const mutation = useMutation({ mutationFn: updateProfile });

  const defaults: ProfileValues = {
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    phone: user?.phone ?? "",
    birthDate: user?.birthDate ? user.birthDate.slice(0, 10) : "",
    gender: user?.gender ?? "",
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileValues>({ resolver: zodResolver(profileSchema), defaultValues: defaults });

  if (!user) return null;

  function onSubmit(values: ProfileValues) {
    // Seuls les champs modifiés sont envoyés ; un champ vidé est effacé (null).
    const body: ProfileBody = {};
    if (values.firstName !== defaults.firstName) body.firstName = values.firstName || null;
    if (values.lastName !== defaults.lastName) body.lastName = values.lastName || null;
    if (cleanPhone(values.phone) !== cleanPhone(defaults.phone)) body.phone = cleanPhone(values.phone);
    if (values.birthDate !== defaults.birthDate) body.birthDate = values.birthDate || null;
    if (values.gender !== defaults.gender) body.gender = values.gender === "" ? null : values.gender;
    if (Object.keys(body).length === 0) {
      toast.info("Aucune modification à enregistrer.");
      return;
    }
    mutation.mutate(body, {
      onSuccess: (updated) => {
        useSession.getState().setUser({ ...user!, ...updated });
        toast.success("Profil mis à jour.");
        reset({
          firstName: updated.firstName ?? "",
          lastName: updated.lastName ?? "",
          phone: updated.phone ?? "",
          birthDate: updated.birthDate ? updated.birthDate.slice(0, 10) : "",
          gender: updated.gender ?? "",
        });
      },
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {mutation.error && <FormAlert>{errorMessage(mutation.error)}</FormAlert>}

      <section className="space-y-4 rounded-3xl border border-line bg-white p-5 md:p-6">
        <h2 className="font-display text-lg font-extrabold tracking-tight">Identité</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Prénom" autoComplete="given-name" error={errors.firstName?.message} {...register("firstName")} />
          <TextField label="Nom" autoComplete="family-name" error={errors.lastName?.message} {...register("lastName")} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Date de naissance (facultatif)" type="date" max={today()} autoComplete="bday" error={errors.birthDate?.message} {...register("birthDate")} />
          <SelectField label="Genre (facultatif)" error={errors.gender?.message} {...register("gender")}>
            <option value="">Non précisé</option>
            <option value="FEMALE">Femme</option>
            <option value="MALE">Homme</option>
          </SelectField>
        </div>
      </section>

      <section className="space-y-4 rounded-3xl border border-line bg-white p-5 md:p-6">
        <h2 className="font-display text-lg font-extrabold tracking-tight">Contact</h2>
        <TextField label="Adresse e-mail" type="email" value={user.email} readOnly disabled hint="Pour changer d'adresse e-mail, contactez-nous." />
        <TextField label="Téléphone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+243 970 000 000" error={errors.phone?.message} hint="Utilisé pour confirmer la livraison." {...register("phone")} />
      </section>

      <div className="flex justify-end">
        <div className="w-full sm:w-72">
          <SubmitButton loading={mutation.isPending}>{isDirty ? "Enregistrer les modifications" : "Enregistrer"}</SubmitButton>
        </div>
      </div>
    </form>
  );
}