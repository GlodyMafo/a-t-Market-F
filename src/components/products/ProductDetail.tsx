"use client";

import { Check, ChevronRight, Globe, Headset, PackageCheck, SearchX, Smartphone, Truck } from "lucide-react";
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
import { localDeliveryNote, supportInfo } from "@/constants/site";
import { useProduct } from "@/features/products/hooks";
import { cn, formatUsd } from "@/lib/utils";
import { ApiError, errorMessage } from "@/services/api/errors";

const DESCRIPTION_LIMIT = 300;

function DetailSkeleton() {
  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-2 lg:gap-10" aria-busy="true" aria-label="Chargement du produit">
      <div className="skeleton aspect-square rounded-2xl" />
      <div className="space-y-4">
        <div className="skeleton h-4 w-1/2 rounded" />
        <div className="skeleton h-8 w-4/5 rounded" />
        <div className="skeleton h-10 w-1/3 rounded" />
        <div className="skeleton h-28 rounded-2xl" />
        <div className="skeleton h-12 rounded-full" />
      </div>
    </div>
  );
}

function Description({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const long = text.length > DESCRIPTION_LIMIT || text.split("\n").length > 5;

  return (
    <section className="mt-6 border-t border-line pt-5" aria-labelledby="product-description">
      <h2 id="product-description" className="font-display text-base font-extrabold tracking-tight">
        Description
      </h2>
      <p className={cn("mt-2 whitespace-pre-line text-sm leading-relaxed text-ink/80", long && !open && "line-clamp-5")}>{text}</p>
      {long && (
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="mt-1 min-h-11 text-sm font-semibold text-brand-600">
          {open ? "Réduire" : "Lire la suite"}
        </button>
      )}
    </section>
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
          icon={SearchX}
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
  const hasInventory = Boolean(product.inventory);
  const stock = product.inventory?.quantity ?? 0;
  // Même règle que le catalogue : « Épuisé » seulement si l'inventaire est connu et à 0.
  const soldOut = isLocal && hasInventory && stock <= 0;
  const lowStock = isLocal && hasInventory && stock > 0 && stock <= LOW_STOCK_NOTICE;
  const category = product.subCategory?.category ?? null;
  const hasSupport = Boolean(supportInfo.whatsapp || supportInfo.phone || supportInfo.email);

  const assurances = [
    { icon: Smartphone, text: "Paiement par Mobile Money" },
    { icon: PackageCheck, text: "Suivi de commande jusqu'à la livraison" },
    ...(hasSupport ? [{ icon: Headset, text: "Service client à votre écoute" }] : []),
  ];

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
        <nav aria-label="Fil d'Ariane" className="mb-3 text-xs text-muted">
          <ol className="flex items-center gap-1 overflow-x-auto whitespace-nowrap [scrollbar-width:none]">
            {crumbs.map((crumb, i) => (
              <li key={`${i}-${crumb.label}`} className="flex shrink-0 items-center gap-1">
                <Link href={crumb.href ?? "/"} className="flex min-h-9 items-center hover:text-brand-600">
                  {crumb.label}
                </Link>
                <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              </li>
            ))}
            <li aria-current="page" className="flex min-h-9 shrink-0 items-center text-ink">
              <span className="block max-w-[60vw] truncate">{product.name}</span>
            </li>
          </ol>
        </nav>

        <div className="grid gap-6 md:grid-cols-2 lg:gap-10">
          {/* La galerie reste visible pendant la lecture de la description sur desktop */}
          <div className="md:sticky md:top-[calc(var(--header-h)+1rem)] md:self-start">
            <ProductGallery images={product.images} name={product.name} />
          </div>

          <div>
            <h1 className="font-display text-2xl font-extrabold leading-tight tracking-tight md:text-3xl">{product.name}</h1>

            <div className="mt-3">
              {!isLocal && <p className="text-xs font-semibold uppercase tracking-wider text-muted">Prix du produit</p>}
              <p className="font-display text-4xl font-extrabold tabular-nums tracking-tight text-brand-600">{formatUsd(product.price)}</p>
            </div>

            {isLocal ? (
              <>
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  {soldOut ? (
                    <span className="inline-flex items-center rounded-full bg-surface px-3 py-1 text-sm font-semibold text-muted">Épuisé pour le moment</span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-700">
                      <Check className="h-4 w-4" aria-hidden /> Disponible immédiatement à Lubumbashi
                    </span>
                  )}
                  {lowStock && <span className="text-sm font-semibold text-sale">Plus que {stock} en stock</span>}
                </div>

                <div className="mt-5 space-y-4 rounded-2xl border border-line bg-white p-4 shadow-[0_8px_24px_-16px_rgb(15_17_21/0.25)]">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">Quantité</p>
                    <QuantitySelector value={quantity} max={stock} onChange={setQuantity} disabled={soldOut} />
                  </div>
                  <AddToCartButton soldOut={soldOut} />
                  {localDeliveryNote && (
                    <p className="flex items-start gap-2 border-t border-line pt-3 text-sm text-muted">
                      <Truck className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" aria-hidden /> {localDeliveryNote}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="mt-5 rounded-2xl bg-brand-50 p-4 text-brand-900">
                <p className="flex items-center gap-2 font-semibold">
                  <Globe className="h-5 w-5 text-brand-600" aria-hidden /> Produit importé
                </p>
                <p className="mt-1 text-sm">Le prix total livré en RDC est calculé par un devis.</p>
                <Link
                  href="/import"
                  className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-brand-500 px-6 text-sm font-semibold text-white motion-safe:transition-colors hover:bg-brand-600 motion-safe:active:scale-[0.99] sm:w-auto"
                >
                  Faire un devis
                </Link>
              </div>
            )}

            <ul className="mt-4 grid gap-2 text-sm">
              {assurances.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 rounded-xl bg-surface px-3 py-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-brand-600 shadow-sm">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  {text}
                </li>
              ))}
            </ul>

            {product.description && <Description text={product.description} />}
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