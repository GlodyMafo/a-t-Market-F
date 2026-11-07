"use client";

import { BadgeCheck } from "lucide-react";
import { useSession } from "@/features/authentication/session.store";
import { formatDate } from "@/lib/utils";

export function AccountHeader() {
  const user = useSession((s) => s.user);
  if (!user) return null;

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
  const initials = (fullName || user.email).split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join("");
  const verified = Boolean(user.emailVerifiedAt);

  return (
    <section aria-label="Mon compte" className="flex items-center gap-4 rounded-2xl bg-brand-500 p-5 text-white md:p-6">
      <div aria-hidden className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/20 text-xl font-bold">
        {initials}
      </div>
      <div className="min-w-0">
        <h1 className="truncate text-lg font-bold md:text-xl">{fullName || "Bienvenue"}</h1>
        <p className="flex items-center gap-1.5 truncate text-sm text-brand-50">
          <span className="truncate">{user.email}</span>
          {verified && <BadgeCheck className="h-4 w-4 shrink-0" aria-label="E-mail vérifié" />}
        </p>
        {user.createdAt && <p className="mt-0.5 text-xs text-brand-100">Membre depuis le {formatDate(user.createdAt)}</p>}
      </div>
    </section>
  );
}