"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useAddresses } from "@/features/account/hooks";
import { useSession } from "@/features/authentication/session.store";
import { cn } from "@/lib/utils";

/** Aide le client à compléter son profil, sans rien imposer. */
export function ProfileProgress() {
  const user = useSession((s) => s.user);
  const { data: addresses } = useAddresses();
  if (!user) return null;

  const items = [
    { label: "Prénom et nom", done: Boolean(user.firstName && user.lastName), href: "/account/profile" },
    { label: "Téléphone", done: Boolean(user.phone), href: "/account/profile" },
    { label: "Adresse de livraison", done: (addresses?.length ?? 0) > 0, href: "/account/addresses" },
    { label: "E-mail vérifié", done: Boolean(user.emailVerifiedAt), href: "/account/security" },
  ];
  const done = items.filter((item) => item.done).length;
  if (done === items.length) return null;

  return (
    <section aria-labelledby="progress-title" className="rounded-3xl border border-line bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 id="progress-title" className="font-display text-lg font-extrabold tracking-tight">
          Complétez votre profil
        </h2>
        <p className="text-sm font-semibold text-brand-600">
          {done}/{items.length}
        </p>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface" role="progressbar" aria-valuemin={0} aria-valuemax={items.length} aria-valuenow={done} aria-label="Profil complété">
        <div className="h-full rounded-full bg-brand-500 motion-safe:transition-all" style={{ width: `${(done / items.length) * 100}%` }} />
      </div>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.label}>
            <Link href={item.href} className={cn("flex min-h-11 items-center gap-2 rounded-2xl px-3 text-sm font-medium hover:bg-surface", item.done ? "text-muted" : "text-ink")}>
              <span className={cn("flex h-5 w-5 items-center justify-center rounded-full border-2", item.done ? "border-brand-500 bg-brand-500 text-white" : "border-line")}>
                {item.done && <Check className="h-3 w-3" aria-hidden />}
              </span>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}