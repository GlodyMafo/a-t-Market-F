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
    return (
      <p className="p-10 text-center text-sm text-muted" aria-busy="true">
        Chargement…
      </p>
    );
  }
  return <>{children}</>;
}