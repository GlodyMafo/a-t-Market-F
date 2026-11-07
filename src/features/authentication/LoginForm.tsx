"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { PasswordField } from "@/components/forms/PasswordField";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { TextField } from "@/components/forms/TextField";
import { safeNext } from "@/lib/utils";
import { loginUser } from "@/services/api/auth";
import { errorMessage } from "@/services/api/errors";
import { loginSchema, type LoginValues } from "./schemas";
import { useSession } from "./session.store";

export function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const next = safeNext(searchParams.get("next"));
    const status = useSession((s) => s.status);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

    const mutation = useMutation({
        mutationFn: loginUser,
        onSuccess: (result) => {
            useSession.getState().setSession(result);
            // Lot 5 : c'est ici que le panier invité sera fusionné avec celui du compte.
        },
    });

    // Une seule logique de redirection : dès que la session est ouverte (connexion ou déjà connecté).
    useEffect(() => {
        if (status === "authenticated") router.replace(next);
    }, [status, next, router]);

    const registerHref = next === "/account" ? "/register" : `/register?next=${encodeURIComponent(next)}`;

    return (
        <form onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate className="space-y-4">
            {mutation.error && (
                <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-sale">
                    {errorMessage(mutation.error)}
                </div>
            )}
            <TextField label="Adresse e-mail" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
            <PasswordField label="Mot de passe" autoComplete="current-password" error={errors.password?.message} {...register("password")} />
            <div className="-mt-2 text-right">
                <Link href="/forgot-password" className="text-sm font-medium text-brand-600 hover:underline">
                    Mot de passe oublié ?
                </Link>
            </div>
            <SubmitButton loading={mutation.isPending}>Se connecter</SubmitButton>
            <p className="text-center text-sm text-muted">
                Pas encore de compte ?{" "}
                <Link href={registerHref} className="font-semibold text-brand-600 hover:underline">
                    Créer un compte
                </Link>
            </p>
        </form>
    );
}