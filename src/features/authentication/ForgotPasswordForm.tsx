"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { MailCheck } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { TextField } from "@/components/forms/TextField";
import { requestPasswordReset } from "@/services/api/auth";
import { errorMessage } from "@/services/api/errors";
import { forgotPasswordSchema, type ForgotPasswordValues } from "./schemas";

export function ForgotPasswordForm() {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({ resolver: zodResolver(forgotPasswordSchema) });
  const mutation = useMutation({ mutationFn: requestPasswordReset });

  if (mutation.isSuccess) {
    return (
      <div className="text-center">
        <MailCheck className="mx-auto h-10 w-10 text-brand-500" aria-hidden />
        <h2 className="mt-3 text-lg font-bold">Vérifiez votre boîte mail</h2>
        <p className="mt-2 text-sm text-muted">
          Si un compte existe avec <strong className="text-ink">{getValues("email")}</strong>, vous recevrez un e-mail avec un lien valable 1 heure.
          Pensez à regarder dans vos courriers indésirables.
        </p>
        <Link href="/login" className="mt-6 inline-block text-sm font-semibold text-brand-600 hover:underline">
          Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit((v) => mutation.mutate(v.email))} noValidate className="space-y-4">
      <p className="text-sm text-muted">Saisissez l&apos;adresse e-mail de votre compte. Nous vous enverrons un lien pour choisir un nouveau mot de passe.</p>
      {mutation.error && (
        <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-sale">
          {errorMessage(mutation.error)}
        </div>
      )}
      <TextField label="Adresse e-mail" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
      <SubmitButton loading={mutation.isPending}>Envoyer le lien</SubmitButton>
      <p className="text-center text-sm">
        <Link href="/login" className="font-semibold text-brand-600 hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </form>
  );
}