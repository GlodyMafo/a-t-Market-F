import type { Metadata } from "next";
import { OrdersList } from "@/components/orders/OrdersList";

export const metadata: Metadata = { title: "Mes commandes" };

export default function OrdersPage() {
  return <OrdersList />;
}