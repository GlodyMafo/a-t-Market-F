"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { MailCheck } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { StatusPanel, statusButton } from "@/components/feedback/StatusPanel";
import { AuthHeading } from "@/components/forms/AuthHeading";
import { FormAlert } from "@/components/forms/FormAlert";
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
      <StatusPanel
        tone="info"
        icon={MailCheck}
        title="Vérifiez votre boîte mail"
        action={
          <Link href="/login" className={statusButton}>
            Retour à la connexion
          </Link>
        }
      >
        <p>
          Si un compte existe avec <strong className="text-ink">{getValues("email")}</strong>, vous recevrez un e-mail avec un lien valable 1 heure.
          Pensez à regarder dans vos courriers indésirables.
        </p>
      </StatusPanel>
    );
  }

  return (
    <>
      <AuthHeading
        title="Mot de passe oublié"
        subtitle="Saisissez l'adresse e-mail de votre compte. Nous vous enverrons un lien pour choisir un nouveau mot de passe."
      />
      <form onSubmit={handleSubmit((v) => mutation.mutate(v.email))} noValidate className="space-y-4">
        {mutation.error && <FormAlert>{errorMessage(mutation.error)}</FormAlert>}
        <TextField label="Adresse e-mail" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
        <SubmitButton loading={mutation.isPending}>Envoyer le lien</SubmitButton>
        <p className="text-center text-sm">
          <Link href="/login" className="inline-flex min-h-11 items-center font-semibold text-brand-600 hover:underline">
            Retour à la connexion
          </Link>
        </p>
      </form>
    </>
  );
}