import type { Metadata } from "next";
import { AdminOrderDetail } from "@/components/admin/AdminOrderDetail";

export const metadata: Metadata = { title: "Détail de la commande" };

export default async function AdminOrderPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  return <AdminOrderDetail key={orderId} orderId={orderId} />;
}