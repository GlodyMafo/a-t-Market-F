import type { Metadata } from "next";
import { AddressesManager } from "@/components/account/AddressesManager";

export const metadata: Metadata = { title: "Mes adresses" };

export default function AddressesPage() {
  return <AddressesManager />;
}