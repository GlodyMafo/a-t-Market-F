import type { Metadata } from "next";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const metadata: Metadata = { title: "Réglages" };

export default function SettingsPage() {
  return <SettingsForm />;
}