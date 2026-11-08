"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FormAlert } from "@/components/forms/FormAlert";
import { PasswordField } from "@/components/forms/PasswordField";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { TextField } from "@/components/forms/TextField";
import { safeNext } from "@/lib/utils";
import { registerUser } from "@/services/api/auth";
import { errorMessage } from "@/services/api/errors";
import { cleanPhone, registerSchema, type RegisterValues } from "./schemas";
import { useSession } from "./session.store";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));
  const status = useSession((s) => s.status);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (result) => {
      useSession.getState().setSession(result);
      // Lot 5 : fusion du panier invité ici également.
    },
  });

  useEffect(() => {
    if (status === "authenticated") router.replace(next);
  }, [status, next, router]);

  const loginHref = next === "/account" ? "/login" : `/login?next=${encodeURIComponent(next)}`;

  return (
    <form
      onSubmit={handleSubmit((values) =>
        mutation.mutate({ email: values.email, phone: cleanPhone(values.phone), password: values.password }),
      )}
      noValidate
      className="space-y-4"
    >
      {mutation.error && <FormAlert>{errorMessage(mutation.error)}</FormAlert>}
      <TextField label="Adresse e-mail" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
      <TextField
        label="Téléphone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="+243 970 000 000"
        hint="Votre numéro Mobile Money est idéal."
        error={errors.phone?.message}
        {...register("phone")}
      />
      <PasswordField
        label="Mot de passe"
        autoComplete="new-password"
        hint="8 caractères minimum."
        error={errors.password?.message}
        {...register("password")}
      />
      <PasswordField
        label="Confirmer le mot de passe"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />
      <SubmitButton loading={mutation.isPending}>Créer mon compte</SubmitButton>
      <p className="text-center text-sm text-muted">
        Déjà un compte ?{" "}
        <Link href={loginHref} className="inline-flex min-h-11 items-center font-semibold text-brand-600 hover:underline">
          Se connecter
        </Link>
      </p>
    </form>
  );
}