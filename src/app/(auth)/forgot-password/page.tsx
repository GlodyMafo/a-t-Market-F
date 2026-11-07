import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/features/authentication/ForgotPasswordForm";

export const metadata: Metadata = { title: "Mot de passe oublié" };

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="mb-4 text-xl font-bold">Mot de passe oublié</h1>
      <ForgotPasswordForm />
    </>
  );
}