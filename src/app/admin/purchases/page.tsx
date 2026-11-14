import type { Metadata } from "next";
import { PurchasesList } from "@/components/admin/PurchasesList";

export const metadata: Metadata = { title: "Produits à acheter" };

export default function PurchasesPage() {
  return <PurchasesList />;
}