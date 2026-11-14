
"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { useSession } from "@/features/authentication/session.store";
import {
  useNotificationActions,
  useNotifications,
  useUnreadCount,
} from "@/features/notifications/hooks";
import { errorMessage } from "@/services/api/errors";
import { cn } from "@/lib/utils";

interface Props {
  /** Page d'historique complète (par défaut : celle du compte client). */
  allHref?: string;
  /** Côté d'ancrage du panneau : « left » dans une barre latérale. */
  align?: "left" | "right";
}

export function NotificationBell({
  allHref = "/account/notifications",
  align = "right",
}: Props) {
  const router = useRouter();
  const authenticated = useSession((s) => s.status === "authenticated");
  const unread = useUnreadCount();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const list = useNotifications({ page: 1, limit: 6, enabled: open });
  const { markAll } = useNotificationActions();

  useEffect(() => {
    if (!open) return;

    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!authenticated) return null;

  function toggle() {
    // Sur mobile, on ouvre directement la page d'historique.
    if (!window.matchMedia("(min-width: 768px)").matches) {
      router.push(allHref);
      return;
    }

    setOpen((value) => !value);
  }

  const label =
    unread > 0
      ? `Notifications, ${unread} non lue${unread > 1 ? "s" : ""}`
      : "Notifications";

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="relative flex h-11 w-11 items-center justify-center rounded-full motion-safe:transition-colors hover:bg-surface"
      >
        <Bell className="h-5 w-5" aria-hidden />

        {unread > 0 && (
          <span
            aria-hidden
            className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-sale px-1 text-[10px] font-bold text-white"
          >
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className={cn(
            "absolute top-full z-50 mt-2 w-[24rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-3xl border border-line bg-white shadow-[0_24px_48px_-16px_rgb(15_17_21/0.35)]",
            align === "left" ? "left-0" : "right-0"
          )}
        >
          <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
            <p className="font-display text-base font-extrabold tracking-tight">
              Notifications
            </p>

            <button
              type="button"
              disabled={unread === 0 || markAll.isPending}
              onClick={() =>
                markAll.mutate(undefined, {
                  onError: (error) => toast.error(errorMessage(error)),
                })
              }
              className="min-h-9 text-sm font-semibold text-brand-600 hover:underline disabled:cursor-not-allowed disabled:text-muted disabled:no-underline"
            >
              Tout marquer comme lu
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto p-2 [scrollbar-width:thin]">
            {list.isLoading && (
              <ul
                aria-busy="true"
                aria-label="Chargement des notifications"
                className="space-y-2"
              >
                {[0, 1, 2].map((i) => (
                  <li
                    key={i}
                    className="skeleton h-16 rounded-2xl bg-ink/[0.06]"
                  />
                ))}
              </ul>
            )}

            {list.error && (
              <p role="alert" className="p-4 text-center text-sm text-muted">
                Impossible de charger vos notifications.{" "}
                <button
                  type="button"
                  onClick={() => list.refetch()}
                  className="font-semibold text-brand-600 underline"
                >
                  Réessayer
                </button>
              </p>
            )}

            {list.data && list.data.items.length === 0 && (
              <p className="p-6 text-center text-sm text-muted">
                Aucune notification pour l&apos;instant.
              </p>
            )}

            {list.data && list.data.items.length > 0 && (
              <ul className="space-y-1">
                {list.data.items.map((notification) => (
                  <li key={notification.id}>
                    <NotificationItem
                      notification={notification}
                      onOpen={() => setOpen(false)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Link
            href={allHref}
            onClick={() => setOpen(false)}
            className="flex min-h-12 items-center justify-center border-t border-line text-sm font-semibold text-brand-600 hover:bg-surface"
          >
            Voir toutes les notifications
          </Link>
        </div>
      )}
    </div>
  );
}
