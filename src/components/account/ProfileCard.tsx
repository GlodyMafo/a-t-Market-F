"use client";

import { useSession } from "@/features/authentication/session.store";
import { formatDate } from "@/lib/utils";

export function ProfileCard() {
  const user = useSession((s) => s.user);
  if (!user) return null;

  const rows = [
    { label: "Adresse e-mail", value: user.email },
    { label: "Téléphone", value: user.phone || "Non renseigné" },
    { label: "Membre depuis le", value: formatDate(user.createdAt) },
  ];

  return (
    <section aria-labelledby="profile-title" className="rounded-3xl border border-line bg-white p-5 md:p-6">
      <h2 id="profile-title" className="font-display text-lg font-extrabold tracking-tight">
        Mes informations
      </h2>
      <dl className="mt-3 divide-y divide-line text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-col gap-0.5 py-3 sm:flex-row sm:justify-between sm:gap-4">
            <dt className="text-muted">{row.label}</dt>
            <dd className="min-w-0 break-words font-medium sm:text-right">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}