import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductGridSkeleton } from "@/components/products/ProductGrid";
import { CatalogView } from "@/components/products/CatalogView";

export const metadata: Metadata = { title: "Produits" };

export default function ProductsPage() {
  return (
    // useSearchParams exige une frontière Suspense pour que le build de production passe.
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-6">
          <ProductGridSkeleton count={20} />
        </div>
      }
    >
      <CatalogView />
    </Suspense>
  );
}