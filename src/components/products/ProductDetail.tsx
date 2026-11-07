"use client";

import { Check, Smartphone, PackageCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { AddToCartButton } from "@/components/products/AddToCartButton";
import { ProductGallery } from "@/components/products/ProductGallery";
import { ProductSection } from "@/components/products/ProductSection";
import { QuantitySelector } from "@/components/products/QuantitySelector";
import { LOW_STOCK_NOTICE } from "@/constants/catalog";
import { useProduct } from "@/features/products/hooks";
import { formatUsd } from "@/lib/utils";
import { ApiError, errorMessage } from "@/services/api/errors";

function DetailSkeleton() {
  return (
    <div className="mx-auto grid max-w-7xl animate-pulse gap-6 px-4 py-6 md:grid-cols-2 lg:gap-10" aria-busy="true" aria-label="Chargement du produit">
      <div className="aspect-square rounded-xl bg-surface" />
      <div className="space-y-4">
        <div className="h-4 w-1/2 rounded bg-surface" />
        <div className="h-8 w-4/5 rounded bg-surface" />
        <div className="h-8 w-1/4 rounded bg-surface" />
        <div className="h-24 rounded bg-surface" />
        <div className="h-12 rounded bg-surface" />
      </div>
    </div>
  );
}

export function ProductDetail({ id }: { id: string }) {
  const router = useRouter();
  const { data: product, isLoading, error, refetch } = useProduct(id);
  const [quantity, setQuantity] = useState(1);

  if (isLoading) return <DetailSkeleton />;

  if (error) {
    if (error instanceof ApiError && error.kind === "not_found") {
      return (
        <EmptyState
          title="Produit introuvable"
          message="Ce produit n'existe pas ou n'est plus disponible."
          actionLabel="Voir les produits"
          onAction={() => router.push("/products")}
        />
      );
    }
    return <ErrorState title="Impossible de charger ce produit" message={errorMessage(error)} onRetry={() => refetch()} />;
  }
  if (!product) return null;

  const isLocal = product.type === "LOCAL";
  const stock = product.inventory?.quantity ?? 0;
  const category = product.subCategory?.category ?? null;

  const crumbs: Array<{ label: string; href?: string }> = [{ label: "Accueil", href: "/" }];
  if (category) crumbs.push({ label: category.name, href: `/products?categoryId=${encodeURIComponent(category.id)}` });
  if (category && product.subCategory) {
    crumbs.push({
      label: product.subCategory.name,
      href: `/products?categoryId=${encodeURIComponent(category.id)}&subCategoryId=${encodeURIComponent(product.subCategory.id)}`,
    });
  }

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-4 md:py-6">
        <nav aria-label="Fil d'Ariane" className="mb-4 text-xs text-muted">
          <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
            {crumbs.map((crumb) => (
              <li key={crumb.label} className="flex items-center gap-1.5">
                <Link href={crumb.href ?? "/"} className="hover:text-brand-600">{crumb.label}</Link>
                <span aria-hidden>/</span>
              </li>
            ))}
            <li aria-current="page" className="max-w-[60vw] truncate text-ink">{product.name}</li>
          </ol>
        </nav>

        <div className="grid gap-6 md:grid-cols-2 lg:gap-10">
          <ProductGallery images={product.images} name={product.name} />

          <div>
            <h1 className="text-xl font-bold md:text-2xl">{product.name}</h1>
            <p className="mt-3 text-3xl font-bold text-brand-600">{formatUsd(product.price)}</p>

            {isLocal ? (
              <div className="mt-3 space-y-1 text-sm">
                <p className="flex items-center gap-1.5 font-medium text-green-700">
                  <Check className="h-4 w-4" aria-hidden /> Disponible immédiatement à Lubumbashi
                </p>
                {stock > 0 && stock <= LOW_STOCK_NOTICE && <p className="text-sale">Plus que {stock} en stock</p>}
              </div>
            ) : (
              <div className="mt-4 rounded-xl bg-brand-50 p-4 text-sm text-brand-900">
                <p className="font-semibold">Produit importé</p>
                <p className="mt-1">
                  Le prix total livré en RDC est calculé par un devis.{" "}
                  <Link href="/import" className="font-semibold underline">Faire un devis</Link>
                </p>
              </div>
            )}

            {isLocal && (
              <div className="mt-6 space-y-4">
                <div>
                  <p className="mb-2 text-sm font-medium">Quantité</p>
                  <QuantitySelector value={quantity} max={stock} onChange={setQuantity} />
                </div>
                <AddToCartButton />
              </div>
            )}

            <ul className="mt-6 space-y-2 border-t border-line pt-4 text-sm text-muted">
              <li className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-brand-500" aria-hidden /> Paiement par Mobile Money
              </li>
              <li className="flex items-center gap-2">
                <PackageCheck className="h-4 w-4 text-brand-500" aria-hidden /> Suivi de commande jusqu&apos;à la livraison
              </li>
            </ul>

            {product.description && (
              <section className="mt-6 border-t border-line pt-4" aria-labelledby="product-description">
                <h2 id="product-description" className="text-sm font-bold">Description</h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink/80">{product.description}</p>
              </section>
            )}
          </div>
        </div>
      </div>

      {product.subCategoryId && (
        <ProductSection
          title="Dans la même catégorie"
          href={
            category
              ? `/products?categoryId=${encodeURIComponent(category.id)}&subCategoryId=${encodeURIComponent(product.subCategoryId)}`
              : "/products"
          }
          params={{ subCategoryId: product.subCategoryId, limit: 7 }}
          layout="scroll"
          excludeId={product.id}
        />
      )}
    </>
  );
}