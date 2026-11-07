"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ClipboardPaste } from "lucide-react";
import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { SelectField } from "@/components/forms/SelectField";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { TextField } from "@/components/forms/TextField";
import { useCategories, useSubCategories } from "@/features/categories/hooks";
import { detectMarketplaceId, extractUrl, type MarketplaceId } from "@/lib/marketplace";
import { IMPORT_MARKETPLACES } from "./marketplaces";
import { importSchema, type ImportValues } from "./schemas";

interface Props {
  marketplace: MarketplaceId;
  onDetect: (id: MarketplaceId) => void;
  onSubmit: (values: ImportValues) => void;
  pending: boolean;
}

export function ImportForm({ marketplace, onDetect, onSubmit, pending }: Props) {
  const { data: categories } = useCategories();
  const { data: allSubCategories } = useSubCategories();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<ImportValues>({
    resolver: zodResolver(importSchema),
    defaultValues: { productUrl: "", categoryId: "", subCategoryId: "" },
  });

  const categoryId = useWatch({ control, name: "categoryId" });
  const subCategories = useMemo(
    () => (allSubCategories ?? []).filter((s) => s.isActive && s.categoryId === categoryId),
    [allSubCategories, categoryId],
  );

  const name = IMPORT_MARKETPLACES.find((m) => m.id === marketplace)?.name ?? "";

  function detect(value: string) {
    const id = detectMarketplaceId(extractUrl(value));
    if (id) onDetect(id);
  }

  async function paste() {
    try {
      const text = await navigator.clipboard.readText();
      setValue("productUrl", text, { shouldValidate: true, shouldDirty: true });
      detect(text);
    } catch {
      toast.info("Collez le lien manuellement avec Ctrl+V (ou un appui long sur mobile).");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div>
        <TextField
          label={`2. Lien du produit ${name}`}
          type="url"
          inputMode="url"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="https://…"
          error={errors.productUrl?.message}
          suffix={
            <button type="button" onClick={paste} aria-label="Coller le lien du presse-papiers" className="rounded-md p-2 text-muted hover:text-brand-600">
              <ClipboardPaste className="h-4 w-4" aria-hidden />
            </button>
          }
          {...register("productUrl", { onChange: (e) => detect(e.target.value) })}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="3. Catégorie du produit"
          error={errors.categoryId?.message}
          {...register("categoryId", { onChange: () => setValue("subCategoryId", "") })}
        >
          <option value="">Choisir…</option>
          {(categories ?? []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </SelectField>
        <SelectField label="Sous-catégorie" disabled={!categoryId} error={errors.subCategoryId?.message} {...register("subCategoryId")}>
          <option value="">Choisir…</option>
          {subCategories.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </SelectField>
      </div>
      <p className="-mt-2 text-xs text-muted">Elles nous permettent d&apos;estimer le poids du colis et les frais de transport.</p>

      <SubmitButton loading={pending}>Analyser le produit</SubmitButton>
    </form>
  );
}