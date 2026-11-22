"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { BadgeCheck, MailWarning } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormAlert } from "@/components/forms/FormAlert";
import { PasswordField } from "@/components/forms/PasswordField";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { changePasswordSchema, type ChangePasswordValues } from "@/features/account/schemas";
import { useSession } from "@/features/authentication/session.store";
import { formatDate } from "@/lib/utils";
import { changePassword, resendVerification } from "@/services/api/account";
import { errorMessage } from "@/services/api/errors";

const COOLDOWN_SECONDS = 60;

function EmailCard() {
  const user = useSession((s) => s.user);
  const [wait, setWait] = useState(0);
  const mutation = useMutation({
    mutationFn: resendVerification,
    onSuccess: () => {
      toast.success("E-mail envoyé. Vérifiez votre boîte de réception (et les courriers indésirables).");
      setWait(COOLDOWN_SECONDS);
    },
  });

  useEffect(() => {
    if (wait <= 0) return;
    const timer = setInterval(() => setWait((n) => Math.max(n - 1, 0)), 1000);
    return () => clearInterval(timer);
  }, [wait > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!user) return null;
  const known = user.emailVerifiedAt !== undefined; // absent tant que le backend « compte » n'est pas appliqué
  const verified = Boolean(user.emailVerifiedAt);

  return (
    <section aria-labelledby="email-title" className="rounded-3xl border border-line bg-white p-5 md:p-6">
      <h2 id="email-title" className="font-display text-lg font-extrabold tracking-tight">
        Adresse e-mail
      </h2>
      <p className="mt-2 text-sm">{user.email}</p>

      {!known ? (
        <p className="mt-3 text-sm text-muted">Le statut de vérification n&apos;est pas disponible pour le moment.</p>
      ) : verified ? (
        <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
          <BadgeCheck className="h-4 w-4" aria-hidden /> Vérifiée le {formatDate(user.emailVerifiedAt)}
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          <p className="flex items-start gap-2 rounded-2xl bg-amber-50 p-3 text-sm text-amber-900">
            <MailWarning className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> Votre adresse n&apos;est pas encore confirmée. Le lien envoyé à l&apos;inscription est valable 24 heures.
          </p>
          {mutation.error && <FormAlert>{errorMessage(mutation.error)}</FormAlert>}
          <button
            type="button"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || wait > 0}
            className="min-h-11 rounded-full bg-brand-500 px-5 text-sm font-semibold text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {mutation.isPending ? "Envoi…" : wait > 0 ? `Renvoyer dans ${wait} s` : "Renvoyer l'e-mail de confirmation"}
          </button>
        </div>
      )}
    </section>
  );
}

function PasswordCard() {
  const mutation = useMutation({ mutationFn: changePassword });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordValues>({ resolver: zodResolver(changePasswordSchema) });

  return (
    <section aria-labelledby="password-title" className="rounded-3xl border border-line bg-white p-5 md:p-6">
      <h2 id="password-title" className="font-display text-lg font-extrabold tracking-tight">
        Mot de passe
      </h2>
      <form
        noValidate
        className="mt-4 max-w-md space-y-4"
        onSubmit={handleSubmit((values) =>
          mutation.mutate(
            { currentPassword: values.currentPassword, newPassword: values.newPassword },
            {
              onSuccess: () => {
                toast.success("Mot de passe mis à jour.");
                reset();
              },
            },
          ),
        )}
      >
        {mutation.error && <FormAlert>{errorMessage(mutation.error)}</FormAlert>}
        <PasswordField label="Mot de passe actuel" autoComplete="current-password" error={errors.currentPassword?.message} {...register("currentPassword")} />
        <PasswordField label="Nouveau mot de passe" autoComplete="new-password" hint="8 caractères minimum." error={errors.newPassword?.message} {...register("newPassword")} />
        <PasswordField label="Confirmer le nouveau mot de passe" autoComplete="new-password" error={errors.confirmPassword?.message} {...register("confirmPassword")} />
        <SubmitButton loading={mutation.isPending}>Changer le mot de passe</SubmitButton>
      </form>
    </section>
  );
}

export function SecurityView() {
  return (
    <section aria-labelledby="security-title" className="space-y-6">
      <h1 id="security-title" className="font-display text-2xl font-extrabold tracking-tight">
        Sécurité
      </h1>
      <EmailCard />
      <PasswordCard />
    </section>
  );
}