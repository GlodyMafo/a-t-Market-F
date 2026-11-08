import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthHeading } from "@/components/forms/AuthHeading";
import { FormSkeleton } from "@/components/forms/FormSkeleton";
import { RegisterForm } from "@/features/authentication/RegisterForm";

export const metadata: Metadata = { title: "Créer un compte" };

export default function RegisterPage() {
  return (
    <>
      <AuthHeading title="Créer un compte" subtitle="Quelques informations suffisent pour commencer." />
      <Suspense fallback={<FormSkeleton fields={4} />}>
        <RegisterForm />
      </Suspense>
    </>
  );
}