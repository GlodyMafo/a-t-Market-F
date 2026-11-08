import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthHeading } from "@/components/forms/AuthHeading";
import { FormSkeleton } from "@/components/forms/FormSkeleton";
import { LoginForm } from "@/features/authentication/LoginForm";

export const metadata: Metadata = { title: "Connexion" };

export default function LoginPage() {
  return (
    <>
      <AuthHeading title="Connexion" subtitle="Connectez-vous pour accéder à votre compte." />
      <Suspense fallback={<FormSkeleton fields={2} />}>
        <LoginForm />
      </Suspense>
    </>
  );
}