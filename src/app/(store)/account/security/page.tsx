import type { Metadata } from "next";
import { SecurityView } from "@/components/account/SecurityView";

export const metadata: Metadata = { title: "Sécurité" };

export default function SecurityPage() {
  return <SecurityView />;
}