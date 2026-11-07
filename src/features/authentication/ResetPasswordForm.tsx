"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
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
      <div className="text-center text-sm">
        <p>Ce lien est incomplet.</p>
        <Link href="/forgot-password" className="mt-3 inline-block font-semibold text-brand-600 hover:underline">
          Demander un nouveau lien
        </Link>
      </div>
    );
  }

  if (mutation.isSuccess) {
    return (
      <div className="text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-green-600" aria-hidden />
        <h2 className="mt-3 text-lg font-bold">Mot de passe mis à jour</h2>
        <p className="mt-2 text-sm text-muted">Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
        <Link href="/login" className="mt-6 inline-block rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-600">
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit((v) => mutation.mutate({ token, password: v.password }))} noValidate className="space-y-4">
      {mutation.error && (
        <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-sale">
          {errorMessage(mutation.error)}{" "}
          <Link href="/forgot-password" className="font-semibold underline">
            Demander un nouveau lien
          </Link>
        </div>
      )}
      <PasswordField label="Nouveau mot de passe" autoComplete="new-password" hint="8 caractères minimum." error={errors.password?.message} {...register("password")} />
      <PasswordField label="Confirmer le mot de passe" autoComplete="new-password" error={errors.confirmPassword?.message} {...register("confirmPassword")} />
      <SubmitButton loading={mutation.isPending}>Enregistrer le mot de passe</SubmitButton>
    </form>
  );
}