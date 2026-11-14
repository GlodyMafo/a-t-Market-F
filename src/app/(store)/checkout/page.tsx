import type { Metadata } from "next";
import { CheckoutView } from "@/components/checkout/CheckoutView";
import { RequireAuth } from "@/features/authentication/RequireAuth";

export const metadata: Metadata = { title: "Finaliser la commande" };

export default function CheckoutPage() {
  return (
    <RequireAuth>
      <CheckoutView />
    </RequireAuth>
  );
}