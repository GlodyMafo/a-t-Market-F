import type { Metadata } from "next";
import { QuotesList } from "@/components/account/QuotesList";

export const metadata: Metadata = { title: "Mes devis" };

export default function QuotesPage() {
  return <QuotesList />;
}