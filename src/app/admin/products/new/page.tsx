import type { Metadata } from "next";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata: Metadata = { title: "Nouveau produit" };

export default function NewProductPage() {
  return (
    <div>
      <Link href="/admin/products" className="mb-3 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-brand-600 hover:underline">
        <ChevronLeft className="h-4 w-4" aria-hidden /> Produits
      </Link>
      <h1 className="mb-6 font-display text-2xl font-extrabold tracking-tight md:text-3xl">Nouveau produit</h1>
      <ProductForm />
    </div>
  );
}