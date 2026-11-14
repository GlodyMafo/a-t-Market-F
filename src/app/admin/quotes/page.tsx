import type { Metadata } from "next";
import { QuotesReview } from "@/components/admin/QuotesReview";

export const metadata: Metadata = { title: "Devis à valider" };

export default function QuotesPage() {
  return <QuotesReview />;
}