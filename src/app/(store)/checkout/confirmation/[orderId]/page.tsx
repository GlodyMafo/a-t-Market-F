import type { Metadata } from "next";
import { PaymentStatus } from "@/components/checkout/PaymentStatus";
import { RequireAuth } from "@/features/authentication/RequireAuth";

export const metadata: Metadata = { title: "Suivi du paiement" };

export default async function ConfirmationPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  return (
    <RequireAuth>
      <PaymentStatus key={orderId} orderId={orderId} />
    </RequireAuth>
  );
}