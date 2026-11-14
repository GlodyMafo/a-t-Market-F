import type { Metadata } from "next";
import { OrderDetail } from "@/components/orders/OrderDetail";

export const metadata: Metadata = { title: "Détail de la commande" };

export default async function OrderPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  return <OrderDetail key={orderId} orderId={orderId} />;
}