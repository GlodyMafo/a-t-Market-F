import type { Metadata } from "next";
import { ProductDetail } from "@/components/products/ProductDetail";

export const metadata: Metadata = { title: "Produit" };

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // key : l'état (quantité, photo) repart de zéro quand on passe d'un produit à un autre.
  return <ProductDetail key={id} id={id} />;
}