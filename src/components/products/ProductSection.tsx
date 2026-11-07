"use client";

import { ErrorState } from "@/components/feedback/ErrorState";
import { Section } from "@/components/layout/Section";
import { ProductCard } from "@/components/products/ProductCard";
import { PRODUCT_GRID_CLASS, PRODUCT_ROW_CLASS, ProductGridSkeleton } from "@/components/products/ProductGrid";
import { useProducts } from "@/features/products/hooks";
import { errorMessage } from "@/services/api/errors";
import type { ProductListParams } from "@/services/api/catalog";

interface Props {
  title: string;
  href?: string;
  params: ProductListParams;
  layout?: "grid" | "scroll";
  excludeId?: string;
}

export function ProductSection({ title, href, params, layout = "grid", excludeId }: Props) {
  const { data, isLoading, error, refetch } = useProducts(params);

  if (isLoading) {
    return (
      <Section title={title}>
        <ProductGridSkeleton count={params.limit ?? 10} />
      </Section>
    );
  }
  if (error) {
    return (
      <Section title={title}>
        <ErrorState title="Produits indisponibles" message={errorMessage(error)} onRetry={() => refetch()} />
      </Section>
    );
  }

  const items = (data?.items ?? []).filter((product) => product.id !== excludeId);
  if (items.length === 0) return null;

  const scroll = layout === "scroll";
  return (
    <Section title={title} href={href}>
      <div className={scroll ? PRODUCT_ROW_CLASS : PRODUCT_GRID_CLASS}>
        {items.map((product) =>
          scroll ? (
            <div key={product.id} className="w-36 shrink-0 snap-start sm:w-44 lg:w-auto">
              <ProductCard product={product} />
            </div>
          ) : (
            <ProductCard key={product.id} product={product} />
          ),
        )}
      </div>
    </Section>
  );
}