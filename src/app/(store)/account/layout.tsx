import type { ReactNode } from "react";
import { AccountNav } from "@/components/account/AccountNav";
import { RequireAuth } from "@/features/authentication/RequireAuth";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-6 md:grid-cols-[240px_minmax(0,1fr)] md:items-start md:gap-6">
        <AccountNav />
        <div className="min-w-0">{children}</div>
      </div>
    </RequireAuth>
  );
}