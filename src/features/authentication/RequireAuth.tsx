"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useSession } from "./session.store";

export function RequireAuth({ children }: { children: ReactNode }) {
  const status = useSession((s) => s.status);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "anonymous") router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [status, router, pathname]);

  if (status !== "authenticated") {
    // Squelette à la forme de la page, pour éviter un saut de mise en page quand la session est confirmée.
    return (
      <div role="status" aria-busy="true" className="mx-auto max-w-7xl px-4 py-6">
        <span className="sr-only">Chargement…</span>
        <div className="flex items-center gap-4 rounded-3xl bg-surface p-5 md:p-6">
          <div className="skeleton h-16 w-16 shrink-0 rounded-full bg-ink/[0.06]" />
          <div className="flex-1 space-y-2.5">
            <div className="skeleton h-5 w-1/2 rounded bg-ink/[0.06]" />
            <div className="skeleton h-4 w-1/3 rounded bg-ink/[0.06]" />
          </div>
        </div>
        <div className="skeleton mt-4 h-20 rounded-2xl bg-ink/[0.06]" />
      </div>
    );
  }
  return <>{children}</>;
}