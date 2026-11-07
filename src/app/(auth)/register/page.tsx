import type { Metadata } from "next";
import { Suspense } from "react";
import { RegisterForm } from "@/features/authentication/RegisterForm";

export const metadata: Metadata = { title: "Créer un compte" };

export default function RegisterPage() {
  return (
    <>
      <h1 className="mb-6 text-xl font-bold">Créer un compte</h1>
      <Suspense>
        <RegisterForm />
      </Suspense>
    </>
  );
}