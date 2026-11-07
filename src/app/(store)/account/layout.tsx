import type { ReactNode } from "react";
import { AccountNav } from "@/components/account/AccountNav";
import { RequireAuth } from "@/features/authentication/RequireAuth";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[220px_1fr]">
        <AccountNav />
        <div>{children}</div>
      </div>
    </RequireAuth>
  );
}