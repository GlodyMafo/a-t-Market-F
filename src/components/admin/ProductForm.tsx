"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { ImageEditor } from "@/components/admin/ImageEditor";
import { FormAlert } from "@/components/forms/FormAlert";
import { SelectField } from "@/components/forms/SelectField";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { TextAreaField } from "@/components/forms/TextAreaField";
import { TextField } from "@/components/forms/TextField";
import { useAdminCategories, useCatalogMutations } from "@/features/admin/catalog-hooks";
import { productSchema, toNumber, type ProductValues } from "@/features/admin/productSchema";
import { sumMoney } from "@/lib/money";
import { formatUsd } from "@/lib/utils";
import { errorMessage } from "@/services/api/errors";
import { setStock } from "@/services/api/adminCatalog";
import type { AdminProduct } from "@/types/adminCatalog";

export function ProductForm({ product }: { product?: AdminProduct }) {
  const router = useRouter();
  const editing = Boolean(product);
  const { data: categories } = useAdminCategories();
  const { createProduct, updateProduct } = useCatalogMutations();
  const [images, setImages] = useState<string[]>(() => [...(product?.images ?? [])].sort((a, b) => a.position - b.position).map((i) => i.imageUrl));
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<ProductValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? "",
      description: product?.description ?? "",
      price: product ? String(product.price) : "",
      margin: product ? String(product.margin) : "0",
      subCategoryId: product?.subCategoryId ?? "",
      stock: "0",
    },
  });

  const [price, margin, subCategoryId] = useWatch({ control, name: ["price", "margin", "subCategoryId"] });

  // Catégorie dérivée de la sous-catégorie choisie (la catégorie n'est qu'un moyen de la trouver).
  const [categoryId, setCategoryId] = useState("");
  const activeCategoryId = useMemo(() => {
    if (categoryId) return categoryId;
    return categories?.find((c) => c.subCategories.some((s) => s.id === subCategoryId))?.id ?? "";
  }, [categoryId, categories, subCategoryId]);
  const subCategories = categories?.find((c) => c.id === activeCategoryId)?.subCategories ?? [];

  // Aide à la saisie : prix d'achat + marge. Le prix officiel affiché au client reste celui du backend.
  const clientPrice = /^\d+([.,]\d{1,2})?$/.test(price) && /^\d+([.,]\d{1,2})?$/.test(margin) ? sumMoney([price.replace(",", "."), margin.replace(",", ".")]) : null;

  async function onSubmit(values: ProductValues) {
    setError(null);
    if (images.length === 0) {
      setError("Ajoutez au moins une photo du produit.");
      return;
    }

    if (!product) {
      try {
        const created = await createProduct.mutateAsync({
          name: values.name,
          description: values.description || undefined,
          price: toNumber(values.price),
          margin: toNumber(values.margin),
          images,
          subCategoryId: values.subCategoryId,
        });
        const stock = Number(values.stock);
        if (stock > 0) {
          try {
            await setStock(created.id, stock);
          } catch (stockError) {
            toast.warning(`Produit créé, mais le stock initial n'a pas pu être enregistré : ${errorMessage(stockError)}`);
          }
        }
        toast.success("Produit créé.");
        router.push("/admin/products");
      } catch (failure) {
        setError(errorMessage(failure));
      }
      return;
    }

    // Modification : on n'envoie que ce qui a changé.
    const originalImages = [...product.images].sort((a, b) => a.position - b.position).map((i) => i.imageUrl);
    const body: Parameters<typeof updateProduct.mutate>[0]["body"] = {};
    if (values.name !== product.name) body.name = values.name;
    if (values.description !== (product.description ?? "")) body.description = values.description;
    if (toNumber(values.price) !== Number(product.price)) body.price = toNumber(values.price);
    if (toNumber(values.margin) !== Number(product.margin)) body.margin = toNumber(values.margin);
    if (JSON.stringify(images) !== JSON.stringify(originalImages)) body.images = images;
    if (values.subCategoryId !== product.subCategoryId) body.subCategoryId = values.subCategoryId;
    if (Object.keys(body).length === 0) {
      toast.info("Aucune modification à enregistrer.");
      return;
    }
    try {
      await updateProduct.mutateAsync({ id: product.id, body });
      toast.success("Produit mis à jour.");
      router.push("/admin/products");
    } catch (failure) {
      setError(errorMessage(failure));
    }
  }

  const pending = createProduct.isPending || updateProduct.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {error && <FormAlert>{error}</FormAlert>}

      <section className="space-y-4 rounded-3xl border border-line bg-white p-5">
        <h2 className="font-display text-lg font-extrabold tracking-tight">Informations</h2>
        <TextField label="Nom du produit" error={errors.name?.message} {...register("name")} />
        <TextAreaField label="Description (facultative)" error={errors.description?.message} {...register("description")} />
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Catégorie"
            value={activeCategoryId}
            onChange={(event) => {
              setCategoryId(event.target.value);
              setValue("subCategoryId", "", { shouldValidate: false });
            }}
          >
            <option value="">Choisir…</option>
            {categories?.filter((c) => c.isActive || c.id === activeCategoryId).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}{c.isActive ? "" : " (désactivée)"}
              </option>
            ))}
          </SelectField>
          <SelectField label="Sous-catégorie" disabled={!activeCategoryId} error={errors.subCategoryId?.message} {...register("subCategoryId")}>
            <option value="">Choisir…</option>
            {subCategories.filter((s) => s.isActive || s.id === product?.subCategoryId).map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}{s.isActive ? "" : " (désactivée)"}
              </option>
            ))}
          </SelectField>
        </div>
      </section>

      <section className="space-y-4 rounded-3xl border border-line bg-white p-5">
        <h2 className="font-display text-lg font-extrabold tracking-tight">Prix (en dollars US)</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Prix d'achat" inputMode="decimal" placeholder="Ex. 12,50" error={errors.price?.message} {...register("price")} />
          <TextField label="Marge" inputMode="decimal" placeholder="Ex. 4" error={errors.margin?.message} {...register("margin")} />
        </div>
        <p className="rounded-2xl bg-brand-50 p-3 text-sm text-brand-900">
          Prix affiché au client : <strong className="tabular-nums">{clientPrice ? formatUsd(clientPrice) : "—"}</strong>{" "}
          <span className="text-brand-700">(prix d&apos;achat + marge ; la marge n&apos;est jamais montrée au client).</span>
        </p>
      </section>

      {!editing && (
        <section className="rounded-3xl border border-line bg-white p-5">
          <h2 className="font-display text-lg font-extrabold tracking-tight">Stock initial</h2>
          <div className="mt-3 max-w-xs">
            <TextField label="Quantité disponible" inputMode="numeric" error={errors.stock?.message} hint="Tant que le stock est à 0, le produit reste invisible pour les clients." {...register("stock")} />
          </div>
        </section>
      )}

      <section className="rounded-3xl border border-line bg-white p-5">
        <ImageEditor value={images} onChange={setImages} />
      </section>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <Link href="/admin/products" className="min-h-11 rounded-full border border-line px-6 text-sm font-semibold leading-[2.75rem] hover:bg-surface">
          Annuler
        </Link>
        <div className="w-full sm:w-64">
          <SubmitButton loading={pending}>{editing ? "Enregistrer les modifications" : "Créer le produit"}</SubmitButton>
        </div>
      </div>
    </form>
  );
}