"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Lock } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { FormAlert } from "@/components/forms/FormAlert";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { TextField } from "@/components/forms/TextField";
import { cleanPhone } from "@/features/authentication/schemas";
import { MOBILE_MONEY_PROVIDERS } from "@/features/checkout/providers";
import { paymentSchema, type PaymentValues } from "@/features/checkout/schemas";
import { cn, formatUsd } from "@/lib/utils";
import type { MobileMoneyProvider } from "@/types/enums";

interface Props {
  amount: string | null;
  defaultPhone: string;
  pending: boolean;
  error: string | null;
  submitLabel?: string;
  onSubmit: (values: { provider: MobileMoneyProvider; phone: string }) => void;
}

export function PaymentForm({ amount, defaultPhone, pending, error, submitLabel, onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PaymentValues>({ resolver: zodResolver(paymentSchema), defaultValues: { phone: defaultPhone } });

  const selected = useWatch({ control, name: "provider" });

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) => onSubmit({ provider: values.provider, phone: cleanPhone(values.phone) }))}
      className="space-y-5"
    >
      {error && <FormAlert>{error}</FormAlert>}

      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Votre opérateur Mobile Money</legend>
        <div className="grid grid-cols-2 gap-3">
          {MOBILE_MONEY_PROVIDERS.map((provider) => (
            <label
              key={provider.id}
              className={cn(
                "flex min-h-14 cursor-pointer items-center justify-center rounded-2xl border-2 px-3 text-sm font-semibold motion-safe:transition focus-within:ring-2 focus-within:ring-brand-500",
                selected === provider.id ? "border-brand-500 bg-brand-50 text-brand-700" : "border-line hover:border-brand-200",
              )}
            >
              <input type="radio" value={provider.id} className="sr-only" {...register("provider")} />
              {provider.name}
            </label>
          ))}
        </div>
        {errors.provider && (
          <p role="alert" className="mt-1.5 text-xs text-sale">
            {errors.provider.message}
          </p>
        )}
      </fieldset>

      <TextField
        label="Numéro Mobile Money"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="+243 970 000 000"
        hint="Le numéro qui va payer. Vous devrez confirmer le paiement sur ce téléphone."
        error={errors.phone?.message}
        {...register("phone")}
      />

      <div className="space-y-2">
        <SubmitButton loading={pending}>{submitLabel ?? `Payer ${formatUsd(amount)}`}</SubmitButton>
        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted">
          <Lock className="h-3.5 w-3.5" aria-hidden /> Paiement sécurisé. Vous ne payez qu&apos;après votre confirmation sur le téléphone.
        </p>
      </div>
    </form>
  );
}