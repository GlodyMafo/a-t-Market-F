import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifyEmail } from "@/features/authentication/VerifyEmail";

export const metadata: Metadata = { title: "Confirmation de l'e-mail" };

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmail />
    </Suspense>
  );
}