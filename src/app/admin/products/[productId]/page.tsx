import type { Metadata } from "next";
import { EditProduct } from "@/components/admin/EditProduct";

export const metadata: Metadata = { title: "Modifier le produit" };

export default async function EditProductPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  return <EditProduct productId={productId} />;
}