"use client";

import { useSession } from "@/features/authentication/session.store";
import { formatDate } from "@/lib/utils";

export function ProfileCard() {
    const user = useSession((s) => s.user);
    if (!user) return null;

    const rows = [
        { label: "Adresse e-mail", value: user.email },
        { label: "Téléphone", value: user.phone ?? "—" },
        { label: "Membre depuis le", value: formatDate(user.createdAt) },
    ];

    return (
        <section aria-labelledby="profile-title" className="rounded-xl border border-line p-5">
            <h2 id="profile-title" className="text-lg font-bold">Mes informations</h2>
            <dl className="mt-4 divide-y divide-line text-sm">
                {rows.map((row) => (
                    <div key={row.label} className="flex flex-col gap-0.5 py-3 sm:flex-row sm:justify-between">
                        <dt className="text-muted">{row.label}</dt>
                        <dd className="font-medium">{row.value}</dd>
                    </div>
                ))}
            </dl>
        </section>
    );
}