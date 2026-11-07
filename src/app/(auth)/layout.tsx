import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/ui/Logo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center bg-surface px-4 py-8">
      <Logo />
      <main className="mt-8 w-full max-w-md rounded-2xl bg-white p-6 shadow-sm md:p-8">{children}</main>
      <Link href="/" className="mt-6 text-sm text-muted hover:text-brand-600">
        ← Retour à la boutique
      </Link>
    </div>
  );
}