import type { Metadata } from "next";
import { CategoriesManager } from "@/components/admin/CategoriesManager";

export const metadata: Metadata = { title: "Catégories" };

export default function CategoriesPage() {
  return <CategoriesManager />;
}