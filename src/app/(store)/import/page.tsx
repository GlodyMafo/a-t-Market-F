import type { Metadata } from "next";
import { Globe } from "lucide-react";
import { Suspense } from "react";
import { ImportFlow } from "@/features/international-import/ImportFlow";

export const metadata: Metadata = { title: "Importer un produit" };

export default function ImportPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-8 lg:py-5">
      <header className="max-w-2xl">
        <p className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
          <Globe className="h-3.5 w-3.5" aria-hidden /> SHEIN · NOON · 1688
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight">Importer un produit</h1>
        <p className="mt-1 text-sm text-muted md:text-base">
          Collez le lien d&apos;un produit SHEIN, NOON ou 1688 : vous obtenez son prix total livré en RDC, avant de commander.
        </p>
      </header>

      <div className="mt-5 lg:mt-4">
        <Suspense>
          <ImportFlow />
        </Suspense>
      </div>
    </div>
  );
}