"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { StatusPanel, statusButton } from "@/components/feedback/StatusPanel";
import { AuthHeading } from "@/components/forms/AuthHeading";
import { FormAlert } from "@/components/forms/FormAlert";
import { PasswordField } from "@/components/forms/PasswordField";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { resetPassword } from "@/services/api/auth";
import { errorMessage } from "@/services/api/errors";
import { resetPasswordSchema, type ResetPasswordValues } from "./schemas";

export function ResetPasswordForm() {
  const token = useSearchParams().get("token") ?? "";
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({ resolver: zodResolver(resetPasswordSchema) });
  const mutation = useMutation({ mutationFn: resetPassword });

  if (!token) {
    return (
      <StatusPanel
        tone="error"
        title="Ce lien est incomplet"
        action={
          <Link href="/forgot-password" className={statusButton}>
            Demander un nouveau lien
          </Link>
        }
      >
        <p>Ouvrez le lien depuis l&apos;e-mail reçu, ou demandez-en un nouveau.</p>
      </StatusPanel>
    );
  }

  if (mutation.isSuccess) {
    return (
      <StatusPanel
        tone="success"
        title="Mot de passe mis à jour"
        action={
          <Link href="/login" className={statusButton}>
            Se connecter
          </Link>
        }
      >
        <p>Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
      </StatusPanel>
    );
  }

  return (
    <>
      <AuthHeading title="Nouveau mot de passe" subtitle="Choisissez un mot de passe que vous n'utilisez nulle part ailleurs." />
      <form onSubmit={handleSubmit((v) => mutation.mutate({ token, password: v.password }))} noValidate className="space-y-4">
        {mutation.error && (
          <FormAlert>
            {errorMessage(mutation.error)}{" "}
            <Link href="/forgot-password" className="font-semibold underline">
              Demander un nouveau lien
            </Link>
          </FormAlert>
        )}
        <PasswordField label="Nouveau mot de passe" autoComplete="new-password" hint="8 caractères minimum." error={errors.password?.message} {...register("password")} />
        <PasswordField label="Confirmer le mot de passe" autoComplete="new-password" error={errors.confirmPassword?.message} {...register("confirmPassword")} />
        <SubmitButton loading={mutation.isPending}>Enregistrer le mot de passe</SubmitButton>
      </form>
    </>
  );
}