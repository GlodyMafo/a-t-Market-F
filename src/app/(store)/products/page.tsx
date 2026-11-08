import type { Metadata } from "next";
import { Suspense } from "react";
import { CATALOG_GRID_CLASS, ProductGridSkeleton } from "@/components/products/ProductGrid";
import { CatalogView } from "@/components/products/CatalogView";

export const metadata: Metadata = { title: "Produits" };

export default function ProductsPage() {
  return (
    // useSearchParams exige une frontière Suspense pour que le build de production passe.
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-4 md:py-6">
          <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
            <div className="hidden lg:block" />
            <ProductGridSkeleton count={20} className={CATALOG_GRID_CLASS} />
          </div>
        </div>
      }
    >
      <CatalogView />
    </Suspense>
  );
}