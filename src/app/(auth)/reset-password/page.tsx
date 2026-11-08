import type { Metadata } from "next";
import { Suspense } from "react";
import { FormSkeleton } from "@/components/forms/FormSkeleton";
import { ResetPasswordForm } from "@/features/authentication/ResetPasswordForm";

export const metadata: Metadata = { title: "Nouveau mot de passe" };

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<FormSkeleton fields={2} />}>
      <ResetPasswordForm />
    </Suspense>
  );
}