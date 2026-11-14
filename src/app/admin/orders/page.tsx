import type { Metadata } from "next";
import { AdminOrdersList } from "@/components/admin/AdminOrdersList";

export const metadata: Metadata = { title: "Commandes" };

export default function AdminOrdersPage() {
  return <AdminOrdersList />;
}