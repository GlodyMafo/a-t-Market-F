import type { Metadata } from "next";
import { StockManager } from "@/components/admin/StockManager";

export const metadata: Metadata = { title: "Stock" };

export default function StockPage() {
  return <StockManager />;
}