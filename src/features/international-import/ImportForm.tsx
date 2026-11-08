"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Check, ClipboardPaste } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { TextField } from "@/components/forms/TextField";
import { detectMarketplaceId, extractUrl, isHttpsUrl, safeHost } from "@/lib/marketplace";
import { IMPORT_MARKETPLACES } from "./marketplaces";
import { importSchema, type ImportValues } from "./schemas";

interface Props {
  onSubmit: (values: ImportValues) => void;
  pending: boolean;
}

export function ImportForm({ onSubmit, pending }: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<ImportValues>({ resolver: zodResolver(importSchema), defaultValues: { productUrl: "" } });

  const rawUrl = useWatch({ control, name: "productUrl" }) ?? "";

  // Retours visuels uniquement : c'est le backend qui accepte ou refuse un lien.
  const candidate = extractUrl(rawUrl);
  const detected = detectMarketplaceId(candidate);
  const detectedName = IMPORT_MARKETPLACES.find((m) => m.id === detected)?.name;
  const unknownShop = !detected && isHttpsUrl(candidate) && Boolean(safeHost(candidate)?.includes("."));

  async function paste() {
    try {
      const text = await navigator.clipboard.readText();
      setValue("productUrl", text, { shouldValidate: true, shouldDirty: true });
    } catch {
      toast.info("Collez le lien manuellement avec Ctrl+V (ou un appui long sur mobile).");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div>
        <TextField
          label="Lien du produit"
          type="url"
          inputMode="url"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="Collez ici le lien SHEIN, NOON ou 1688"
          error={errors.productUrl?.message}
          suffixSpace="pr-28"
          suffix={
            <button
              type="button"
              onClick={paste}
              aria-label="Coller le lien du presse-papiers"
              className="flex h-9 items-center gap-1.5 rounded-full bg-brand-50 px-3 text-sm font-semibold text-brand-700 motion-safe:transition hover:bg-brand-100 motion-safe:active:scale-95"
            >
              <ClipboardPaste className="h-4 w-4" aria-hidden /> Coller
            </button>
          }
          {...register("productUrl")}
        />
        {!errors.productUrl && detectedName && (
          <p role="status" className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-700">
            <Check className="h-4 w-4" aria-hidden /> {detectedName} reconnu
          </p>
        )}
        {!errors.productUrl && unknownShop && (
          <p role="status" className="mt-2 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> Boutique non reconnue : SHEIN, NOON et 1688 uniquement.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <SubmitButton loading={pending}>Voir le prix total livré</SubmitButton>
        <p className="text-center text-xs text-muted">Vous obtenez le prix avant de commander. Aucun compte n&apos;est nécessaire.</p>
      </div>
    </form>
  );
}