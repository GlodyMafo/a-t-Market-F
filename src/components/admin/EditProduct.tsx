"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { ProductForm } from "@/components/admin/ProductForm";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useAdminProduct } from "@/features/admin/catalog-hooks";
import { ApiError, errorMessage } from "@/services/api/errors";

export function EditProduct({ productId }: { productId: string }) {
  const { data, isLoading, error, refetch } = useAdminProduct(productId);

  if (isLoading) return <div className="skeleton h-96 rounded-3xl bg-ink/[0.06]" aria-busy="true" aria-label="Chargement du produit" />;
  if (error) {
    const missing = error instanceof ApiError && (error.kind === "not_found");
    return <ErrorState title={missing ? "Produit introuvable" : "Impossible de charger le produit"} message={errorMessage(error)} onRetry={() => refetch()} />;
  }
  if (!data) return null;

  return (
    <div>
      <Link href="/admin/products" className="mb-3 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-brand-600 hover:underline">
        <ChevronLeft className="h-4 w-4" aria-hidden /> Produits
      </Link>
      <h1 className="mb-6 font-display text-2xl font-extrabold tracking-tight md:text-3xl">Modifier le produit</h1>
      <ProductForm key={data.id} product={data} />
    </div>
  );
}