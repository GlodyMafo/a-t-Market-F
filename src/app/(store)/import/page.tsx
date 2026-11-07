import type { Metadata } from "next";
import { Suspense } from "react";
import { ImportFlow } from "@/features/international-import/ImportFlow";

export const metadata: Metadata = { title: "Importer un produit" };

export default function ImportPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:py-10">
      <h1 className="text-2xl font-bold">Importer un produit</h1>
      <p className="mt-2 mb-6 text-sm text-muted">
        Collez le lien d&apos;un produit SHEIN, NOON ou 1688 : vous obtenez son prix total livré en RDC, avant de commander.
      </p>
      <Suspense>
        <ImportFlow />
      </Suspense>
    </div>
  );
}