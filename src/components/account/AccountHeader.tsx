"use client";

import { BadgeCheck } from "lucide-react";
import Image from "next/image";
import { accountCover } from "@/constants/site";
import { useSession } from "@/features/authentication/session.store";
import { cn, formatDate } from "@/lib/utils";

export function AccountHeader() {
  const user = useSession((s) => s.user);
  if (!user) return null;

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
  const initials = (fullName || user.email).split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join("");
  const verified = Boolean(user.emailVerifiedAt);

  const cover = accountCover.src;
  const dark = accountCover.tone === "dark";

  return (
    <section
      aria-label="Mon compte"
      className={cn(
        "relative isolate flex items-center overflow-hidden rounded-3xl",
        // Hauteur de la couverture : à ajuster ici (8.5rem ≈ 136 px sur mobile, 9rem ≈ 144 px dès md).
        cover ? "min-h-[8.5rem] md:min-h-[9rem]" : "",
        dark ? "bg-brand-900 text-white" : cover ? "bg-surface text-ink" : "bg-brand-50 text-ink",
      )}
    >
      {cover && (
        <>
          <Image
            src={cover}
            alt=""
            fill
            sizes="(min-width: 1280px) 960px, 100vw"
            style={{ objectPosition: accountCover.position }}
            className="-z-20 object-cover"
          />
          {/* Voile : garantit la lisibilité du texte, plus marqué à gauche sur desktop */}
          <div
            aria-hidden
            className={cn(
              "absolute inset-0 -z-10",
              dark
                ? "bg-brand-900/60 md:bg-transparent md:bg-linear-to-r md:from-brand-900/90 md:via-brand-900/60 md:to-transparent"
                : "bg-white/70 md:bg-transparent md:bg-linear-to-r md:from-white/90 md:via-white/65 md:to-transparent",
            )}
          />
        </>
      )}

      <div className="flex min-w-0 items-center gap-3 p-4 md:gap-4 md:p-5">
        <div
          aria-hidden
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-full font-display text-lg font-extrabold ring-2 md:h-16 md:w-16 md:text-xl",
            dark ? "bg-white/10 text-white ring-white/30" : "bg-white/80 text-brand-700 ring-brand-500/30",
          )}
        >
          {initials}
        </div>
        <div className="min-w-0">
          <h1 className="truncate font-display text-lg font-extrabold tracking-tight md:text-xl">{fullName || "Bienvenue"}</h1>
          <p className={cn("truncate text-sm", dark ? "text-white/80" : "text-ink/70")}>{user.email}</p>
          {(verified || user.createdAt) && (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {verified && (
                <span
                  className={cn(
                    "inline-flex min-h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium ring-1",
                    dark ? "bg-white/10 ring-white/25" : "bg-white/80 text-ink/80 ring-ink/10",
                  )}
                >
                  <BadgeCheck className="h-3.5 w-3.5" aria-hidden /> E-mail vérifié
                </span>
              )}
              {user.createdAt && (
                <span
                  className={cn(
                    "inline-flex min-h-6 items-center rounded-full px-2.5 text-xs font-medium ring-1",
                    dark ? "bg-white/10 ring-white/25" : "bg-white/80 text-ink/80 ring-ink/10",
                  )}
                >
                  Membre depuis le {formatDate(user.createdAt)}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}