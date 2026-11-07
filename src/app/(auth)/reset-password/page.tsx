import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/features/authentication/ResetPasswordForm";

export const metadata: Metadata = { title: "Nouveau mot de passe" };

export default function ResetPasswordPage() {
  return (
    <>
      <h1 className="mb-4 text-xl font-bold">Nouveau mot de passe</h1>
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </>
  );
}