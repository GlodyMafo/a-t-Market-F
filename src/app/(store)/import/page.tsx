import type { Metadata } from "next";
import { ImportFlow } from "@/features/international-import/ImportFlow";

export const metadata: Metadata = { title: "Importer un produit" };

export default function ImportPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-4 md:py-6 lg:py-3">
      <ImportFlow />
    </div>
  );
}