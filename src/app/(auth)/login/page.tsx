import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/features/authentication/LoginForm";

export const metadata: Metadata = { title: "Connexion" };

export default function LoginPage() {
  return (
    <>
      <h1 className="mb-6 text-xl font-bold">Connexion</h1>
      <Suspense>
        <LoginForm />
      </Suspense>
    </>
  );
}